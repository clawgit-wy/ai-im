/**
 * WebSocket 实时通信插件
 * 在 Nitro 启动时创建 ws.Server，挂载到 HTTP server 的 /ws 路径
 * 客户端通过 ws://host:port/ws?token=xxx 连接，token 为 JWT
 */
import http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { defineNitroPlugin } from 'nitropack/runtime'
import { db, verifyToken } from '../utils/db'

// 全局连接映射: uid -> WebSocket
const wsConnections = new Map<number, WebSocket>()

// 创建 WebSocket 服务器 (noServer 模式，手动处理 upgrade)
const wss = new WebSocketServer({ noServer: true })

// 连接处理
wss.on('connection', (ws: WebSocket, request: http.IncomingMessage) => {
  // 从 URL 参数中解析 token
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`)
  const token = url.searchParams.get('token')

  if (!token) {
    ws.close(4001, '缺少 token')
    return
  }

  // 验证 JWT
  const user = verifyToken(`Bearer ${token}`)
  if (!user) {
    ws.close(4003, 'token 无效或已过期')
    return
  }

  const uid = user.uid

  // 如果该用户已有连接，先关闭旧连接
  const existing = wsConnections.get(uid)
  if (existing && existing.readyState === WebSocket.OPEN) {
    existing.close(4000, '重复登录')
  }

  // 存储连接
  wsConnections.set(uid, ws)

  // 发送连接成功消息
  ws.send(JSON.stringify({ type: 'connected', data: { uid, name: user.name } }))

  // 处理客户端消息
  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString())
      // 可以在这里处理客户端发来的消息（如心跳、已读标记等）
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }))
      }
    } catch {
      // 忽略无法解析的消息
    }
  })

  // 连接关闭时清理
  ws.on('close', () => {
    if (wsConnections.get(uid) === ws) {
      wsConnections.delete(uid)
    }
  })

  ws.on('error', () => {
    wsConnections.delete(uid)
  })
})

/**
 * 向指定会话的所有在线用户广播消息
 * 对于群聊和单聊，均查询群成员表获取参与方uid
 */
function broadcastToSession(sessionId: number, data: any) {
  // 查询该会话的所有成员（单聊也使用 group_members 表记录参与方）
  const members = db.prepare('SELECT uid FROM group_members WHERE sessionId = ?').all(sessionId) as { uid: number }[]
  // 构建消息体：保留 data 内部的 type 字段（如 'message'），外层用统一格式
  const message = JSON.stringify({ type: 'session', sessionId, data })
  if (members.length > 0) {
    // 有成员记录：发送给在线成员
    for (const { uid } of members) {
      const ws = wsConnections.get(uid)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    }
  } else {
    // 无成员记录（兼容旧数据）：广播给所有在线用户
    for (const [, ws] of wsConnections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    }
  }
}

/**
 * 向指定用户推送消息
 */
function broadcastToUser(uid: number, data: any) {
  const ws = wsConnections.get(uid)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

// 将广播函数挂载到全局，供 db.ts 中的 notifySession/notifyUser 调用
;(globalThis as any).broadcastToSession = broadcastToSession
;(globalThis as any).broadcastToUser = broadcastToUser
;(globalThis as any).wsConnections = wsConnections

// 导出为 Nitro 插件
export default defineNitroPlugin((nitroApp) => {
  // 拦截 http.Server.prototype.listen 以获取 HTTP 服务器实例
  // 当 Nitro 创建 HTTP 服务器并调用 listen 时，附加 WebSocket upgrade 处理
  const originalListen = http.Server.prototype.listen
  http.Server.prototype.listen = function (this: http.Server, ...args: any[]) {
    const result = originalListen.apply(this, args as any)

    // 附加 WebSocket upgrade 事件处理
    this.on('upgrade', (request: http.IncomingMessage, socket: any, head: Buffer) => {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`)
      if (url.pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request)
        })
      }
    })

    // 恢复原始 listen 方法（只需拦截一次）
    http.Server.prototype.listen = originalListen

    return result
  }
})
