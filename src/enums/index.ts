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

/** 会话类型 1单聊 2群聊 */
export enum ChatTypeEnum {
  /** 单聊 */
  SINGLE = 1,
  /** 群聊 */
  GROUP
}

/**
 * 消息类型
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
