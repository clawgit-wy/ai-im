/**
 * WebSocket 适配器层 (对应 DESIGN.md 3.3 服务层架构)
 *
 * 设计目标(文档 3.2 关键设计)：
 * - WebSocket 连接管理在 Rust 侧实现，前端通过封装好的服务层进行交互
 * - 后台保活更可靠，减少 JS 层 GC 压力，移动端后台连接更稳定
 *
 * 适配策略：
 * - Tauri 环境：通过 Tauri IPC 调用 Rust 命令 (ws_connect/ws_send) 并监听 Rust 推送事件
 * - 浏览器/Mock 环境：降级为原生 WebSocket，保持接口一致
 *
 * 消息分发遵循文档 4.3.3 的 socket.js 解析逻辑，按 data.type 路由。
 */
import { isTauri } from '@/utils/tauri'
import { SOCKET_MSG_TYPES, HEARTBEAT_INTERVAL, RECONNECT_DELAYS, type WsPacket } from '@/services/wsType'
import Mitt from '@/utils/Bus'
import { MittEnum } from '@/enums'
import { computedToken } from '@/services/http'
import type { MessageType } from '@/services/types'

/** 消息分发处理器类型 */
type DispatchHandler = (packet: WsPacket) => void

/** 连接状态变更回调 */
type StatusCallback = (connected: boolean) => void

/**
 * WebSocket 适配器
 * 统一封装 Tauri IPC 与原生 WebSocket 两种实现
 */
class WebSocketAdapter {
  /** 原生 WS 实例(浏览器环境) */
  private ws: WebSocket | null = null
  /** 是否已连接 */
  private isConnected = false
  /** 心跳定时器 */
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  /** 重连定时器 */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  /** 当前重连次数 */
  private reconnectIndex = 0
  /** 状态变更回调集合 */
  private statusCallbacks = new Set<StatusCallback>()
  /** 是否主动关闭(阻止自动重连) */
  private manualClosed = false
  /** Tauri 事件取消监听函数 */
  private unlistenFn: (() => void) | null = null

  /** 获取当前连接状态 */
  get connected() {
    return this.isConnected
  }

  /**
   * 建立连接 (对应文档 4.3.1: ws_connect)
   * - Tauri 环境：invoke('ws_connect') + listen('ws://message')
   * - 浏览器环境：new WebSocket(url)
   */
  async connect(token?: string): Promise<boolean> {
    const authToken = token || computedToken.get()
    if (!authToken) {
      console.warn('[WSAdapter] 无 token，跳过连接')
      return false
    }
    this.manualClosed = false

    // Tauri 环境：通过 Rust 侧管理连接
    if (isTauri()) {
      return this.connectViaRust(authToken)
    }

    // 浏览器/Mock 环境：降级为原生 WebSocket
    return this.connectViaBrowser(authToken)
  }

  /** Tauri 环境连接：调用 Rust 命令并监听推送事件 */
  private async connectViaRust(token: string): Promise<boolean> {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const { listen } = await import('@tauri-apps/api/event')
      // 调用 Rust 侧 ws_connect 命令(对应文档 src-tauri/commands/ws.rs)
      await invoke('ws_connect', { token })
      // 监听 Rust 推送的 WebSocket 消息事件
      this.unlistenFn = await listen<WsPacket>('ws://message', (event) => {
        this.dispatch(event.payload)
      })
      this.setStatus(true)
      this.startHeartbeat(true)
      console.log('[WSAdapter] Rust 侧 WebSocket 已连接')
      return true
    } catch (err) {
      console.error('[WSAdapter] Rust 连接失败，降级到浏览器模式:', err)
      return this.connectViaBrowser(token)
    }
  }

  /** 浏览器环境连接：原生 WebSocket */
  private connectViaBrowser(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      const url = this.buildWsUrl(token)
      if (!url) {
        resolve(false)
        return
      }
      try {
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this.reconnectIndex = 0
          this.setStatus(true)
          this.startHeartbeat(false)
          console.log('[WSAdapter] 浏览器 WebSocket 已连接')
          resolve(true)
        }

        this.ws.onmessage = (event) => {
          try {
            const packet: WsPacket = JSON.parse(event.data)
            this.dispatch(packet)
          } catch (err) {
            console.warn('[WSAdapter] 消息解析失败:', err)
          }
        }

        this.ws.onerror = (err) => {
          console.error('[WSAdapter] 连接错误:', err)
        }

        this.ws.onclose = () => {
          this.setStatus(false)
          this.stopHeartbeat()
          if (!this.manualClosed) {
            this.scheduleReconnect(token)
          }
        }
      } catch (err) {
        console.error('[WSAdapter] 创建连接失败:', err)
        resolve(false)
      }
    })
  }

  /** 构建 WebSocket URL */
  private buildWsUrl(token: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const port = window.location.port
    // 开发服务器(6130)直连后端
    if (port === '6130') {
      return `ws://localhost:3000/ws?token=${token}`
    }
    return `${protocol}//${host}:${port}/ws?token=${token}`
  }

  /**
   * 启动心跳 (对应文档 4.3.1：每30秒)
   * @param viaRust 是否通过 Rust 侧发送
   */
  private startHeartbeat(viaRust: boolean) {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(async () => {
      if (!this.isConnected) return
      if (viaRust && isTauri()) {
        try {
          const { invoke } = await import('@tauri-apps/api/core')
          await invoke('ws_send', { message: JSON.stringify({ type: SOCKET_MSG_TYPES.HEARTBEAT }) })
        } catch {
          /* ignore */
        }
      } else if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: SOCKET_MSG_TYPES.HEARTBEAT }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  /** 停止心跳 */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 重连调度 (对应文档 4.3.8：指数退避 5s->10s->30s->60s->120s->300s)
   */
  private scheduleReconnect(token: string) {
    if (this.reconnectIndex >= RECONNECT_DELAYS.length) {
      console.warn('[WSAdapter] 达到最大重连次数，停止重连')
      return
    }
    const delay = RECONNECT_DELAYS[this.reconnectIndex]
    this.reconnectIndex++
    this.reconnectTimer = setTimeout(() => {
      console.log(`[WSAdapter] 第${this.reconnectIndex}次重连...`)
      this.connect(token)
    }, delay)
  }

  /**
   * 消息分发 (对应文档 4.3.3 socket.js 解析逻辑)
   * 按 packet.type 路由到对应处理器
   */
  private dispatch(packet: WsPacket) {
    // 心跳回执忽略
    if (packet.type === SOCKET_MSG_TYPES.HEARTBEAT) return

    switch (packet.type) {
      // 聊天消息
      case SOCKET_MSG_TYPES.CHAT:
        this.handleChat(packet.data)
        break
      // 推送消息
      case SOCKET_MSG_TYPES.PUSH:
        this.handlePush(packet.data)
        break
      // 消息已读
      case SOCKET_MSG_TYPES.READED:
        Mitt.emit(MittEnum.UPDATE_UNREAD, packet.data)
        break
      // 消息撤回
      case SOCKET_MSG_TYPES.WITHDRAW:
        Mitt.emit(MittEnum.SEND_MESSAGE, { ...packet.data, withdraw: true })
        break
      // 未读数变更
      case SOCKET_MSG_TYPES.UNREAD_CHANGE:
        Mitt.emit(MittEnum.UPDATE_UNREAD, packet.data)
        break
      // 删除会话
      case SOCKET_MSG_TYPES.SESSION_DEL:
        Mitt.emit(MittEnum.UPDATE_UNREAD, { sessionDel: true, ...packet.data })
        break
      // 退出设备
      case SOCKET_MSG_TYPES.LOGOUT:
        this.handleLogout(packet.data)
        break
      // 消息提醒
      case SOCKET_MSG_TYPES.REMIND:
        Mitt.emit(MittEnum.SEND_MESSAGE, packet.data)
        break
      default:
        console.debug('[WSAdapter] 未处理的消息类型:', packet.type)
    }
  }

  /** 处理聊天消息 */
  private handleChat(data: any) {
    if (!data) return
    const msg = data as MessageType
    Mitt.emit(MittEnum.SEND_MESSAGE, msg)
  }

  /** 处理推送消息 */
  private handlePush(data: any) {
    if (!data) return
    Mitt.emit(MittEnum.SEND_MESSAGE, data)
  }

  /** 处理退出登录 */
  private handleLogout(data: any) {
    console.warn('[WSAdapter] 收到退出设备通知:', data)
    Mitt.emit(MittEnum.UPDATE_UNREAD, { logout: true, ...data })
  }

  /**
   * 发送消息 (对应文档 4.3.2: message_send)
   * @param data 消息数据
   */
  async send(data: any): Promise<boolean> {
    if (!this.isConnected) return false
    const payload = JSON.stringify(data)
    if (isTauri()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('ws_send', { message: payload })
        return true
      } catch (err) {
        console.error('[WSAdapter] Rust 发送失败:', err)
        return false
      }
    }
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(payload)
      return true
    }
    return false
  }

  /** 注册连接状态回调 */
  onStatus(cb: StatusCallback): () => void {
    this.statusCallbacks.add(cb)
    return () => this.statusCallbacks.delete(cb)
  }

  /** 注册消息分发处理器(扩展点) */
  onMessage(handler: DispatchHandler): () => void {
    // 通过 Mitt 间接订阅，保持单一分发入口
    const fn = (data: any) => handler({ type: SOCKET_MSG_TYPES.CHAT, data })
    Mitt.on(MittEnum.SEND_MESSAGE, fn as any)
    return () => Mitt.off(MittEnum.SEND_MESSAGE, fn as any)
  }

  /** 设置连接状态并通知回调 */
  private setStatus(connected: boolean) {
    this.isConnected = connected
    this.statusCallbacks.forEach((cb) => cb(connected))
  }

  /**
   * 主动断开连接 (阻止自动重连)
   */
  disconnect() {
    this.manualClosed = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.unlistenFn) {
      this.unlistenFn()
      this.unlistenFn = null
    }
    if (isTauri()) {
      import('@tauri-apps/api/core')
        .then(({ invoke }) => invoke('ws_disconnect').catch(() => {}))
        .catch(() => {})
    }
    this.ws?.close()
    this.ws = null
    this.setStatus(false)
  }
}

/** 全局单例适配器实例 */
export const wsAdapter = new WebSocketAdapter()

export default wsAdapter
