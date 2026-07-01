/**
 * 类型定义文件
 * 注意：请使用TSDoc规范进行注释，以便在使用时能够获得良好提示。
 * @see TSDoc规范 https://tsdoc.org/
 **/
import { AITypeEnum, ChatTypeEnum, MsgEnum, OnlineEnum, PluginStatusEnum, RoleEnum } from '@/enums'

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

/** 添加群成员请求 */
export type AddMemberReq = {
  /** 会话ID */
  sessionId: number
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
