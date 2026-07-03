import { ref, onUnmounted } from 'vue'
import { computedToken } from '@/services/http'
import Mitt from '@/utils/Bus'
import { MittEnum } from '@/enums'
import type { MessageType } from '@/services/types'

/**
 * WebSocket Hook
 * 管理WebSocket连接，接收实时消息推送
 */
export function useWebSocket() {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  const reconnectCount = ref(0)
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /** 构建WebSocket URL */
  function buildWsUrl(): string {
    const token = computedToken.get()
    if (!token) return ''
    // 开发环境：直连Nitro后端(3001)；生产环境/Tauri：通过VITE_WEBSOCKET_URL或当前host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const port = window.location.port
    // 开发服务器(6130)直连后端3001（使用 127.0.0.1 避免 IPv6 解析问题）
    if (port === '6130') {
      return `ws://127.0.0.1:3001/ws?token=${token}`
    }
    // Tauri 环境：使用环境变量配置的 WebSocket 地址
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL
    if (wsUrl) {
      return `${wsUrl}?token=${token}`
    }
    // 兜底：使用当前host
    return `${protocol}//${host}:${port}/ws?token=${token}`
  }

  /** 连接WebSocket */
  function connect() {
    const url = buildWsUrl()
    if (!url) {
      console.warn('[WS] 无token，跳过连接')
      return
    }
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      return
    }

    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        connected.value = true
        reconnectCount.value = 0
        console.log('[WS] 已连接')

        // 发送心跳
        const heartbeat = setInterval(() => {
          if (ws.value?.readyState === WebSocket.OPEN) {
            ws.value.send(JSON.stringify({ type: 'ping' }))
          } else {
            clearInterval(heartbeat)
          }
        }, 30000)
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (err) {
          console.warn('[WS] 消息解析失败:', err)
        }
      }

      ws.value.onerror = (err) => {
        console.error('[WS] 连接错误:', err)
      }

      ws.value.onclose = () => {
        connected.value = false
        console.log('[WS] 连接关闭')
        // 自动重连（最多5次）
        if (reconnectCount.value < 5) {
          reconnectCount.value++
          reconnectTimer = setTimeout(() => {
            console.log(`[WS] 第${reconnectCount.value}次重连...`)
            connect()
          }, 3000 * reconnectCount.value)
        }
      }
    } catch (err) {
      console.error('[WS] 创建连接失败:', err)
    }
  }

  /** 处理接收到的消息 */
  function handleMessage(data: any) {
    if (data.type === 'pong') return

    // 会话级推送（消息/会话更新等）
    // 服务器格式: { type: 'session', sessionId, data: { type: 'message'|..., ... } }
    if (data.type === 'session' && data.data) {
      const inner = data.data
      // 新消息推送
      if (inner.type === 'message' && inner.message) {
        // 转换为前端 MessageType 格式
        const msg = {
          fromUser: {
            uid: inner.message.fromUid || 0,
            username: inner.message.fromName || '',
            avatar: inner.message.fromAvatar || ''
          },
          message: {
            id: inner.message.id || 0,
            sessionId: inner.sessionId || data.sessionId || 0,
            type: inner.message.type || 0,
            body: inner.message.body || { content: '' },
            sendTime: inner.message.sendTime || Date.now(),
            messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
          },
          sendTime: new Date(inner.message.sendTime || Date.now()).toLocaleTimeString(),
          loading: false
        } as MessageType
        Mitt.emit(MittEnum.SEND_MESSAGE, msg)
      }
      // 会话更新通知（如群组创建、会话列表变更）
      if (inner.type === 'session_update') {
        Mitt.emit(MittEnum.UPDATE_UNREAD, inner.data)
      }
      return
    }

    // 兼容旧格式：直接 type === 'message'
    if (data.type === 'message' && data.data) {
      const msg = data.data as MessageType
      Mitt.emit(MittEnum.SEND_MESSAGE, msg)
    }

    // 会话更新通知
    if (data.type === 'session_update') {
      Mitt.emit(MittEnum.UPDATE_UNREAD, data.data)
    }
  }

  /** 发送消息到服务器 */
  function send(data: any) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  /** 主动断开连接 */
  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectCount.value = 5 // 阻止自动重连
    ws.value?.close()
    ws.value = null
    connected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    connected,
    connect,
    disconnect,
    send
  }
}
