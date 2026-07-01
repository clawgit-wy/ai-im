/**
 * WebSocket 消息类型定义 (对应 DESIGN.md 4.2.6)
 *
 * 这些常量与 yutong-im 后端 WebSocket 协议保持一致，
 * 用于长连接消息分发时按 data.type 路由处理。
 */
export const SOCKET_MSG_TYPES = {
  /** 建立连接 */
  CONNECT: 1,
  /** 断开连接 */
  DISCONNECT: 2,
  /** 心跳 */
  HEARTBEAT: 3,
  /** 聊天消息 */
  CHAT: 5,
  /** 推送消息 */
  PUSH: 6,
  /** 消息已读 */
  READED: 7,
  /** 用户在线状态变更 */
  ONLINE_CHANGE: 8,
  /** 群成员变更 */
  MEMBER_CHANGE: 9,
  /** 会话置顶 */
  SESSION_TOP: 10,
  /** 未读数变更 */
  UNREAD_CHANGE: 11,
  /** 消息撤回 */
  WITHDRAW: 16,
  /** 连接设备变更 */
  DEVICE_CHANGE: 17,
  /** 消息提醒 */
  REMIND: 18,
  /** 退出设备 */
  LOGOUT: 19,
  /** 删除会话 */
  SESSION_DEL: 20,
  /** 版本更新 */
  VERSION_UPDATE: 32,
  /** 视频会议通知 */
  MEETING_NOTIFY: 33,
  /** 系统通知 */
  SYSTEM_NOTIFY: 48
} as const

/** WebSocket 消息类型数值 */
export type SocketMsgType = (typeof SOCKET_MSG_TYPES)[keyof typeof SOCKET_MSG_TYPES]

/**
 * WebSocket 传输的数据包结构
 * 与 yutong-im 后端协议一致，data.type 决定分发处理逻辑
 */
export interface WsPacket {
  /** 消息类型 (见 SOCKET_MSG_TYPES) */
  type: number
  /** 消息数据 */
  data: any
}

/**
 * 心跳间隔(毫秒)，对应文档 4.3.1：每30秒
 */
export const HEARTBEAT_INTERVAL = 30 * 1000

/**
 * 重连策略(指数退避，对应文档 4.3.8)
 * 5s -> 10s -> 30s -> 60s -> 120s -> 300s
 */
export const RECONNECT_DELAYS = [5, 10, 30, 60, 120, 300].map((s) => s * 1000)
