/**
 * 全局枚举文件
 * 如果枚举值需要在全局使用，那么请在此文件中定义。其他枚举值请在对应的文件中定义。
 * 定义规则：
 *  枚举名：XxxEnum
 *  枚举值：全部大写，单词间用下划线分割
 */

/** Mitt兄弟组件通信 */
export enum MittEnum {
  /** 切换模块 */
  SWITCH_MODULE,
  /** 发送消息 */
  SEND_MESSAGE,
  /** 缩小窗口 */
  SHRINK_WINDOW,
  /** 更新未读数 */
  UPDATE_UNREAD,
  /** 打开设置 */
  OPEN_SETTINGS,
  /** 切换主题 */
  TOGGLE_THEME
}

/** 主题类型 */
export enum ThemeEnum {
  /** 亮色 */
  LIGHT = 'light',
  /** 暗色 */
  DARK = 'dark',
  /** 跟随系统 */
  OS = 'os'
}

/** pinia存储的名称 */
export enum StoresEnum {
  /** 设置 */
  SETTING = 'setting',
  /** 用户 */
  USER = 'user',
  /** 对话 */
  CHAT = 'chat',
  /** 日程 */
  SCHEDULE = 'schedule',
  /** 机器人 */
  ROBOT = 'robot',
  /** 智能体 */
  AGENT = 'agent',
  /** 插件 */
  PLUGIN = 'plugin',
  /** 全局 */
  GLOBAL = 'global'
}

/** 会话类型 1单聊 2群聊 (应用内部使用，保留兼容) */
export enum ChatTypeEnum {
  /** 单聊 */
  SINGLE = 1,
  /** 群聊 */
  GROUP
}

/**
 * 会话类型 (yutong-im 规范，对应文档 4.2.3)
 * p=个人, g=群组, s=服务号, t=通知, r=机器人
 */
export enum ChatTypeListEnum {
  /** 个人(私聊) */
  PERSON = 'p',
  /** 群组(群聊) */
  GROUP = 'g',
  /** 服务号 */
  SERVICE_NUM = 's',
  /** 通知(系统消息) */
  TEMPLATE_USER = 't',
  /** 机器人(系统消息) */
  ROBOT = 'r'
}

/**
 * 消息类型 (应用内部使用，保留兼容)
 */
export enum MsgEnum {
  /** 文本 */
  TEXT,
  /** 图片 */
  IMAGE,
  /** 文件 */
  FILE,
  /** 语音 */
  VOICE,
  /** 视频 */
  VIDEO,
  /** 表情包 */
  EMOJI,
  /** 系统消息 */
  SYSTEM,
  /** 回复 */
  REPLY
}

/**
 * yutong-im 消息类型码 (对应文档 4.2.4)
 */
export enum MsgTypeEnum {
  /** 文本消息 */
  TXT = 0,
  /** 图片消息 */
  IMG = 1,
  /** 语音消息 */
  VOICE = 2,
  /** 视频消息 */
  VIDEO = 3,
  /** 文件消息 */
  FILE = 4,
  /** 群系统通知(改名/加人/踢人等) */
  NOTIFY = 5,
  /** 群公告 */
  ANNOUNCEMENT = 6,
  /** 名片消息 */
  CARD = 7,
  /** 位置消息 */
  LOCATION = 8,
  /** 撤回消息 */
  WITHDRAW = 9,
  /** @人消息 */
  AT = 10,
  /** 推送消息 */
  PUSH = 11,
  /** 视频会议 */
  MEETING = 12,
  /** 多选转发 */
  MANY_FORWARD = 14,
  /** GIF 消息 */
  GIF = 15,
  /** 新消息通知(置顶/取消) */
  NOTIFY_GENERAL = 18
}

/**
 * 消息状态 (对应文档 4.2.5)
 */
export enum MsgStatusEnum {
  /** 默认 */
  DEFAULT = 0,
  /** 发送中 */
  SENDING = 1,
  /** 发送成功 */
  SEND_SUCCEED = 2,
  /** 发送失败 */
  SEND_FAILED = 3
}

/**
 * WebSocket 消息类型 (长连接，对应文档 4.2.6)
 */
export enum SocketMsgTypeEnum {
  /** 建立连接 */
  CONNECT = 1,
  /** 断开连接 */
  DISCONNECT = 2,
  /** 心跳 */
  HEARTBEAT = 3,
  /** 聊天消息 */
  CHAT = 5,
  /** 推送消息 */
  PUSH = 6,
  /** 消息已读 */
  READED = 7,
  /** 用户在线状态变更 */
  ONLINE_CHANGE = 8,
  /** 群成员变更 */
  MEMBER_CHANGE = 9,
  /** 会话置顶 */
  SESSION_TOP = 10,
  /** 未读数变更 */
  UNREAD_CHANGE = 11,
  /** 消息撤回 */
  WITHDRAW = 16,
  /** 连接设备变更 */
  DEVICE_CHANGE = 17,
  /** 消息提醒 */
  REMIND = 18,
  /** 退出设备 */
  LOGOUT = 19,
  /** 删除会话 */
  SESSION_DEL = 20,
  /** 版本更新 */
  VERSION_UPDATE = 32,
  /** 视频会议通知 */
  MEETING_NOTIFY = 33,
  /** 系统通知 */
  SYSTEM_NOTIFY = 48
}

/**
 * 在线状态
 */
export enum OnlineEnum {
  /** 在线 */
  ONLINE = 1,
  /** 离线 */
  OFFLINE
}

/**
 * 成员角色 1群主 2管理员 3普通成员 4机器人
 */
export enum RoleEnum {
  /** 群主 */
  OWNER = 1,
  /** 管理员 */
  ADMIN,
  /** 普通成员 */
  MEMBER,
  /** 机器人 */
  BOT
}

/**
 * AI类型 0无 1机器人 2智能体
 */
export enum AITypeEnum {
  /** 无AI */
  NONE,
  /** 机器人 */
  BOT,
  /** 智能体 */
  AGENT
}

/** 插件状态 */
export enum PluginStatusEnum {
  /** 已内置 */
  BUILTIN,
  /** 已安装 */
  INSTALLED,
  /** 未安装 */
  NOT_INSTALLED,
  /** 下载中 */
  DOWNLOADING
}

/** 视图模式 */
export enum ViewModeEnum {
  /** 列表模式 */
  LIST,
  /** 网格模式 */
  GRID
}

/**请求响应码类型*/
export enum RCodeEnum {
  /**成功请求*/
  OK = '200',
  /**请求错误*/
  FAIL = '400',
  /**服务器出现问题*/
  SERVE_EXCEPTION = '500',
  /**业务出现问题*/
  BUSINESS_EXCEPTION = '600'
}

/** URL路径枚举 */
export enum URLEnum {
  /** 用户 */
  USER = '/api/user',
  /** 聊天 */
  CHAT = '/api/chat',
  /** 日程 */
  SCHEDULE = '/api/schedule',
  /** 机器人 */
  ROBOT = '/api/robot',
  /** 智能体 */
  AGENT = '/api/agent',
  /** 插件 */
  PLUGIN = '/api/plugin'
}
