/**
 * 类型定义文件
 * 注意：请使用TSDoc规范进行注释，以便在使用时能够获得良好提示。
 * @see TSDoc规范 https://tsdoc.org/
 **/
import { AITypeEnum, ChatTypeEnum, MsgEnum, OnlineEnum, PluginStatusEnum, RoleEnum } from '@/enums'
import type { ChatTypeListEnum, MsgStatusEnum, MsgTypeEnum } from '@/enums'

/** 统一API响应体 */
export type ApiResponse<T = any> = {
  /** 成功标识 true or false */
  success: boolean
  /** 错误码 */
  code: number
  /** 错误消息 */
  message: string
  /** 数据 */
  data: T
}

/** 列表响应体 */
export type ListResponse<T> = {
  /** 游标（下次翻页带上这参数）*/
  cursor: string
  /** 是否最后一页 */
  isLast: boolean
  /** 列表数据 */
  list: T[]
}

/* ======================================================== */
/*                       用户相关类型                         */
/* ======================================================== */

/** 用户信息 */
export type UserInfo = {
  /** 用户唯一标识 */
  uid: number
  /** 用户名 */
  name: string
  /** 用户头像 */
  avatar: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 在线状态 */
  onlineStatus: OnlineEnum
  /** 最后一次上下线时间 */
  lastOptTime: number
}

/** 登录请求参数 */
export type LoginReq = {
  /** 账号（邮箱/手机号）*/
  account: string
  /** 密码 */
  password: string
}

/** 登录响应 */
export type LoginRes = {
  /** 用户信息 */
  userInfo: UserInfo
  /** 访问令牌 */
  token: string
}

/** 注册请求参数 */
export type RegisterReq = {
  /** 用户名 */
  name: string
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
}

/** 重置密码请求参数 */
export type ResetPasswordReq = {
  /** 邮箱 */
  email: string
  /** 验证码 */
  code: string
  /** 新密码 */
  password: string
}

/* ======================================================== */
/*                       会话相关类型                         */
/* ======================================================== */

/** 会话列表项 */
export type Session = {
  /** 会话ID */
  id: number
  /** 会话名称 */
  name: string
  /** 会话头像 */
  avatar: string
  /** 会话类型 1单聊 2群聊 */
  type: ChatTypeEnum
  /** 最新消息 */
  lastMsg: string
  /** 最后活跃时间(用来排序) */
  time: number
  /** 未读数 */
  unread: number
  /** 是否启用AI */
  aiEnabled: boolean
}

/* ======================================================== */
/*                       消息相关类型                         */
/* ======================================================== */

/** 消息中用户信息 */
export type MsgUserType = {
  /** 用户ID */
  uid: number
  /** 用户名 */
  username: string
  /** 头像 */
  avatar: string
}

/** 消息互动信息 */
export type MessageMarkType = {
  /** 点赞 */
  userLike: number
  /** 举报 */
  userDislike: number
  /** 点赞数 */
  likeCount: number
  /** 举报数 */
  dislikeCount: number
}

/** 图片消息体 */
export type ImageBody = {
  /** 图片大小 */
  size: number
  /** 图片地址 */
  url: string
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
}

/** 语音消息体 */
export type VoiceBody = {
  /** 文件大小 */
  size: number
  /** 时长(秒) */
  second: number
  /** 文件地址 */
  url: string
}

/** 视频消息体 */
export type VideoBody = {
  /** 文件大小 */
  size: number
  /** 文件地址 */
  url: string
  /** 缩略图宽度 */
  thumbWidth?: number
  /** 缩略图高度 */
  thumbHeight?: number
  /** 缩略图地址 */
  thumbUrl?: string
}

/** 文件消息体 */
export type FileBody = {
  /** 文件大小 */
  size: number
  /** 文件名 */
  fileName: string
  /** 文件地址 */
  url: string
}

/** 文本消息体 */
export type TextBody = {
  /** 消息内容 */
  content: string
  /** 回复消息 */
  reply?: ReplyType
}

/** 表情消息体 */
export type EmojiBody = {
  /** 表情地址 */
  url: string
}

/** 回复消息类型 */
export type ReplyType = {
  /** 消息ID */
  id: number
  /** 用户名 */
  username: string
  /** 消息类型 */
  type: MsgEnum
  /** 回复内容 */
  body: any
  /** 是否可消息跳转 0否 1是 */
  canCallback: number
  /** 跳转间隔的消息条数 */
  gapCount: number
}

/**
 * 消息主体
 */
export type Message = {
  /** 消息ID */
  id: number
  /** 会话ID */
  sessionId: number
  /** 消息类型 */
  type: MsgEnum
  /** 动态消息体 - 根据消息类型变化 */
  body: TextBody | ImageBody | VoiceBody | VideoBody | FileBody | EmojiBody | any
  /** 发送时间戳 */
  sendTime: number
  /** 消息互动信息 */
  messageMark: MessageMarkType
}

/**
 * 消息返回体
 */
export type MessageType = {
  /** 发送者信息 */
  fromUser: MsgUserType
  /** 消息主体 */
  message: Message
  /** 发送时间 */
  sendTime: string
  /** 时间段（可选） */
  timeBlock?: string
  /** 是否加载中 */
  loading?: boolean
}

/** 发送消息请求 */
export type SendMsgReq = {
  /** 会话ID */
  sessionId: number
  /** 消息类型 */
  msgType: MsgEnum
  /** 消息体 */
  body: {
    /** 文本消息内容 */
    content?: string
    /** 回复的消息id */
    replyMsgId?: number
    /** 任意 */
    [key: string]: any
  }
}

/* ======================================================== */
/*                       群组相关类型                         */
/* ======================================================== */

/** 群成员 */
export type GroupMember = {
  /** 用户ID */
  uid: number
  /** 用户名 */
  username: string
  /** 头像 */
  avatar: string
  /** 成员角色 1群主 2管理员 3普通成员 4机器人 */
  role: RoleEnum
  /** 在线状态 */
  onlineStatus: OnlineEnum
  /** 加入时间 */
  joinTime: number
}

/** 创建群组请求 */
export type CreateGroupReq = {
  /** 群名称 */
  groupName: string
  /** 群头像 */
  avatar: string
  /** 成员uid列表 */
  uidList: number[]
}

/* ======================================================== */
/*                       日程相关类型                         */
/* ======================================================== */

/** 日程项 */
export type Schedule = {
  /** 日程ID */
  id: number
  /** 日程标题 */
  title: string
  /** 日程内容 */
  content: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 是否全天 */
  allDay: boolean
  /** 提醒时间(分钟) */
  remindTime: number
  /** 日程类型 */
  type: string
  /** 是否完成 */
  completed: boolean
  /** 创建时间 */
  createTime: number
}

/** 日程请求 */
export type ScheduleReq = {
  /** 日程标题 */
  title: string
  /** 日程内容 */
  content: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 是否全天 */
  allDay: boolean
  /** 提醒时间(分钟) */
  remindTime: number
  /** 日程类型 */
  type: string
}

/* ======================================================== */
/*                       工作流相关类型                       */
/* ======================================================== */

/** 工作流(机器人) */
export type Workflow = {
  /** 工作流ID */
  id: number
  /** 工作流名称 */
  name: string
  /** 工作流描述 */
  description: string
  /** 关联的AI类型 0无 1机器人 2智能体 */
  aiType: AITypeEnum
  /** 头像 */
  avatar: string
  /** 提示词 */
  prompt: string
  /** 模型配置 */
  modelConfig: {
    /** 模型名称 */
    model: string
    /** 温度 */
    temperature: number
    /** 最大token数 */
    maxTokens: number
  }
  /** 是否启用 */
  enabled: boolean
  /** 创建时间 */
  createTime: number
}

/** 工作流请求 */
export type WorkflowReq = {
  /** 工作流名称 */
  name: string
  /** 工作流描述 */
  description: string
  /** 头像 */
  avatar: string
  /** 提示词 */
  prompt: string
  /** 模型配置 */
  modelConfig: {
    /** 模型名称 */
    model: string
    /** 温度 */
    temperature: number
    /** 最大token数 */
    maxTokens: number
  }
  /** 是否启用 */
  enabled: boolean
}

/* ======================================================== */
/*                       智能体相关类型                       */
/* ======================================================== */

/** 智能体 */
export type Agent = {
  /** 智能体ID */
  id: number
  /** 智能体名称 */
  name: string
  /** 智能体描述 */
  description: string
  /** 头像 */
  avatar: string
  /** 系统提示词 */
  systemPrompt: string
  /** 关联的插件ID列表 */
  pluginIds: number[]
  /** 模型配置 */
  modelConfig: {
    /** 模型名称 */
    model: string
    /** 温度 */
    temperature: number
    /** 最大token数 */
    maxTokens: number
  }
  /** 是否启用 */
  enabled: boolean
  /** 创建时间 */
  createTime: number
}

/** 智能体配置请求 */
export type AgentReq = {
  /** 智能体名称 */
  name: string
  /** 智能体描述 */
  description: string
  /** 头像 */
  avatar: string
  /** 系统提示词 */
  systemPrompt: string
  /** 关联的插件ID列表 */
  pluginIds: number[]
  /** 模型配置 */
  modelConfig: {
    /** 模型名称 */
    model: string
    /** 温度 */
    temperature: number
    /** 最大token数 */
    maxTokens: number
  }
  /** 是否启用 */
  enabled: boolean
}

/* ======================================================== */
/*                       插件相关类型                         */
/* ======================================================== */

/** 插件 */
export type Plugin = {
  /** 插件ID */
  id: number
  /** 插件名称 */
  name: string
  /** 插件描述 */
  description: string
  /** 插件图标 */
  icon: string
  /** 插件版本 */
  version: string
  /** 插件作者 */
  author: string
  /** 插件状态 */
  status: PluginStatusEnum
  /** 下载地址 */
  downloadUrl: string
  /** 插件配置 */
  config: Record<string, any>
  /** 是否启用 */
  enabled: boolean
  /** 安装时间 */
  installTime: number
  /** 更新时间 */
  updateTime: number
}

/** 插件配置请求 */
export type PluginReq = {
  /** 插件名称 */
  name: string
  /** 插件配置 */
  config: Record<string, any>
  /** 是否启用 */
  enabled: boolean
}

/* ======================================================== */
/*          yutong-im 规范类型 (对应 DESIGN.md 4.2)         */
/*   这些类型与 yutong-im 后端接口字段完全一致，用于直接替换  */
/* ======================================================== */

/**
 * yutong-im 会话实体 (对应文档 4.2.1)
 * 接口：POST /api/session/list
 */
export type YTSession = {
  /** 会话唯一 ID (类型@用户1_用户2) */
  session_id: string
  /** 对方用户ID */
  from_id: string
  /** 最后消息时间戳 */
  time: number
  /** 会话类型 p=个人, g=群组, s=服务号, t=通知, r=机器人 */
  chat_type: ChatTypeListEnum
  /** 会话名称 */
  chat_name: string
  /** 最后消息类型 */
  type: MsgTypeEnum
  /** 最后消息内容 */
  content: string
  /** 未读数量 */
  unread_num: number
  /** 是否置顶 (0=否, 1=是) */
  head: number
  /** 头像URL */
  headUrl: string
  /** 内线电话 */
  sign: string
  /** 手机号 */
  mobile: string
  /** 状态 (-1=无, 0=会议中, 1=休假中, 2=出差中, 3=暂离) */
  state: number
  /** 在线设备 */
  online: string
  /** 是否常用联系人 */
  frequent: number
  /** 群公告 */
  notice: string
  /** 群成员数 */
  user_num: number
}

/**
 * yutong-im 消息实体 (对应文档 4.2.2)
 * 接口：POST /api/msg/sync.do
 */
export type YTMessage = {
  /** 消息唯一ID */
  msg_id: number
  /** 消息UUID (客户端用) */
  uuid: string
  /** 消息序列号 */
  seq: number
  /** 会话ID */
  session_id: string
  /** 发送者ID */
  from_id: string
  /** 消息内容 */
  content: string
  /** 本地文件路径 */
  local_uri?: string
  /** 发送时间戳 */
  time: number
  /** 语音时长(秒) */
  duration?: number
  /** 消息状态 0=默认 1=发送中 2=成功 3=失败 */
  status: MsgStatusEnum
  /** 消息类型 (见 MsgTypeEnum) */
  type: MsgTypeEnum
  /** 会话类型 */
  chat_type: ChatTypeListEnum
  /** 消息关键字(用于搜索) */
  keyword: string
  /** 未读状态 */
  unread: number
  /** 发送者显示名 */
  name: string
  /** 发送者头像 */
  headUrl: string
  /** 发送者状态 */
  state: string
}

/* ======================================================== */
/*                请求参数类型 (文档第五部分)                 */
/* ======================================================== */

/** 登录请求 (POST /mercy/app/auth/login.do) */
export type YTLoginReq = {
  /** 账号 */
  account: string
  /** 密码 (DES-CBC + Base64 加密) */
  password: string
  /** 应用版本 */
  appVersion: string
  /** 设备ID */
  deviceId: string
}

/** 登录响应 */
export type YTLoginRes = {
  /** 用户信息 */
  userInfo: YTUserInfo
  /** 访问令牌 */
  token: string
  /** 设备ID */
  deviceId: string
}

/** yutong-im 用户信息 */
export type YTUserInfo = {
  /** 用户ID */
  uid: string
  /** 用户名 */
  name: string
  /** 头像URL */
  headUrl: string
  /** 手机号 */
  mobile: string
  /** 邮箱 */
  email: string
  /** 签名 */
  sign: string
  /** 在线状态 */
  online: string
}

/** 会话列表请求 (POST /api/session/list) */
export type YTSessionListReq = {
  /** 页码 */
  page?: number
  /** 每页数量 */
  size?: number
}

/** 消息同步请求 (POST /api/msg/sync.do) */
export type YTMsgSyncReq = {
  /** 会话ID */
  session_id: string
  /** 最后一条消息ID */
  last_msg_id?: number
  /** 每页数量 */
  size?: number
}

/** 消息已读请求 (POST /api/msg/read.do) */
export type YTMsgReadReq = {
  /** 会话ID */
  session_id: string
}

/** 消息已读上报请求 (POST /api/msg/readMsg.do) */
export type YTMsgReadMsgReq = {
  /** 消息ID列表 */
  msg_ids: number[]
}

/** 消息撤回请求 (POST /api/msg/withdraw.do) */
export type YTMsgWithdrawReq = {
  /** 消息ID */
  msg_id: number
  /** 会话ID */
  session_id: string
}

/** 创建群组请求 (POST /api/group/create.do) */
export type YTCreateGroupReq = {
  /** 群名称 */
  name: string
  /** 群头像 */
  avatar: string
  /** 成员uid列表 */
  uidList: string[]
}

/** 群成员管理请求 (POST /api/group/add.do | /api/group/remove.do) */
export type YTGroupMemberReq = {
  /** 群组ID */
  group_id: string
  /** 成员uid列表 */
  uidList: string[]
}

/** 联系人信息请求 (POST /api/contact/info.do) */
export type YTContactInfoReq = {
  /** 用户ID */
  uid: string
}

/** 搜索人员请求 (POST /api/contact/search.do) */
export type YTContactSearchReq = {
  /** 搜索关键字 */
  keyword: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  size?: number
}

/* ======================================================== */
/*                适配器映射类型 (raw <-> app)              */
/*   用于在 yutong-im 原始类型与应用内部类型之间转换          */
/* ======================================================== */

/** yutong-im 列表响应 (统一包装) */
export type YTListResponse<T> = {
  /** 列表数据 */
  list: T[]
  /** 总数 */
  total?: number
  /** 是否最后一页 */
  isLast?: boolean
  /** 游标 */
  cursor?: string
}
