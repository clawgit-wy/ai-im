/**
 * Tauri 命令调用封装 (对应 DESIGN.md 3.3 服务层 tauriCommand.ts)
 *
 * 统一封装前端到 Rust 侧的 invoke 调用，对应文档 src-tauri/commands/ 下定义的命令：
 * - ws.rs: ws_connect / ws_send / ws_disconnect / ws_reconnect
 * - message.rs: message_send / message_get_history / message_has_read / message_get_unread
 * - session.rs: get_sessions
 * - auth.rs: auth_login / auth_logout
 *
 * 在浏览器/Mock 环境下会抛出明确错误，调用方应通过 isTauri() 守卫。
 */
import { isTauri } from '@/utils/tauri'

/** 动态加载 invoke，避免浏览器环境加载失败 */
async function getInvoke() {
  if (!isTauri()) {
    throw new Error('[tauriCommand] 当前非 Tauri 环境，无法调用 Rust 命令')
  }
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke
}

/* ======================================================== */
/*                    WebSocket 命令 (ws.rs)                */
/* ======================================================== */

/** 建立 WebSocket 连接 */
export async function wsConnect(token: string): Promise<void> {
  const invoke = await getInvoke()
  return invoke('ws_connect', { token })
}

/** 发送 WebSocket 消息 */
export async function wsSend(message: string): Promise<void> {
  const invoke = await getInvoke()
  return invoke('ws_send', { message })
}

/** 断开 WebSocket 连接 */
export async function wsDisconnect(): Promise<void> {
  const invoke = await getInvoke()
  return invoke('ws_disconnect')
}

/** 手动重连 WebSocket */
export async function wsReconnect(): Promise<void> {
  const invoke = await getInvoke()
  return invoke('ws_reconnect')
}

/* ======================================================== */
/*                    消息命令 (message.rs)                 */
/* ======================================================== */

/** 发送消息 */
export async function messageSend(params: {
  sessionId: string
  content: string
  type: number
}): Promise<any> {
  const invoke = await getInvoke()
  return invoke('message_send', params)
}

/** 获取历史消息 (三级缓存查询: L1 -> L2 -> L3) */
export async function messageGetHistory(params: {
  sessionId: string
  limit: number
  offset: number
}): Promise<any[]> {
  const invoke = await getInvoke()
  return invoke('message_get_history', params)
}

/** 消息已读上报 */
export async function messageHasRead(msgIds: number[]): Promise<void> {
  const invoke = await getInvoke()
  return invoke('message_has_read', { msgIds })
}

/** 获取未读消息 */
export async function messageGetUnread(msgIds: number[]): Promise<any[]> {
  const invoke = await getInvoke()
  return invoke('message_get_unread', { msgIds })
}

/* ======================================================== */
/*                    会话命令 (session.rs)                 */
/* ======================================================== */

/** 获取会话列表 */
export async function getSessions(): Promise<any[]> {
  const invoke = await getInvoke()
  return invoke('get_sessions')
}

/* ======================================================== */
/*                    认证命令 (auth.rs)                    */
/* ======================================================== */

/** 登录 (Rust 侧处理 DES-CBC 加密 + HTTP 请求) */
export async function authLogin(params: {
  account: string
  password: string
  deviceId: string
  appVersion: string
}): Promise<any> {
  const invoke = await getInvoke()
  return invoke('auth_login', params)
}

/** 登出 */
export async function authLogout(): Promise<void> {
  const invoke = await getInvoke()
  return invoke('auth_logout')
}
