import { AITypeEnum, ChatTypeEnum, MsgEnum, OnlineEnum, PluginStatusEnum, RoleEnum } from '@/enums'
import type {
  Agent,
  GroupMember,
  MessageType,
  Plugin,
  Schedule,
  Session,
  UserInfo,
  Workflow
} from '@/services/types'

/** 模拟当前登录用户 */
export const mockCurrentUser: UserInfo = {
  uid: 1001,
  name: '当前用户',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  email: 'current@example.com',
  phone: '13800000001',
  onlineStatus: OnlineEnum.ONLINE,
  lastOptTime: Date.now()
}

/** 模拟联系人列表 */
export const mockContacts: UserInfo[] = [
  {
    uid: 2001,
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    email: 'zhangsan@example.com',
    phone: '13800000002',
    onlineStatus: OnlineEnum.ONLINE,
    lastOptTime: Date.now() - 60000
  },
  {
    uid: 2002,
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    email: 'lisi@example.com',
    phone: '13800000003',
    onlineStatus: OnlineEnum.OFFLINE,
    lastOptTime: Date.now() - 3600000
  },
  {
    uid: 2003,
    name: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    email: 'wangwu@example.com',
    phone: '13800000004',
    onlineStatus: OnlineEnum.ONLINE,
    lastOptTime: Date.now() - 120000
  },
  {
    uid: 2004,
    name: '赵六',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    email: 'zhaoliu@example.com',
    phone: '13800000005',
    onlineStatus: OnlineEnum.OFFLINE,
    lastOptTime: Date.now() - 7200000
  }
]

/** 模拟会话列表 */
export const mockSessions: Session[] = [
  {
    id: 1,
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    type: ChatTypeEnum.SINGLE,
    lastMsg: '你好，最近怎么样？',
    time: Date.now() - 300000,
    unread: 2,
    aiEnabled: false
  },
  {
    id: 2,
    name: '技术交流群',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techgroup',
    type: ChatTypeEnum.GROUP,
    lastMsg: '有人用过 Tauri 2.0 吗？',
    time: Date.now() - 600000,
    unread: 5,
    aiEnabled: true
  },
  {
    id: 3,
    name: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    type: ChatTypeEnum.SINGLE,
    lastMsg: '[图片]',
    time: Date.now() - 86400000,
    unread: 0,
    aiEnabled: false
  },
  {
    id: 4,
    name: '项目讨论组',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=project',
    type: ChatTypeEnum.GROUP,
    lastMsg: '明天上午十点开会',
    time: Date.now() - 172800000,
    unread: 0,
    aiEnabled: true
  }
]

/** 构造消息的辅助函数 */
function makeMsg(
  sessionId: number,
  msgId: number,
  fromUid: number,
  fromName: string,
  content: string,
  sendTime: number
): MessageType {
  return {
    fromUser: {
      uid: fromUid,
      username: fromName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fromName}`
    },
    message: {
      id: msgId,
      sessionId,
      type: MsgEnum.TEXT,
      body: { content },
      sendTime,
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: String(sendTime)
  }
}

/** 模拟会话消息列表 Map<sessionId, MessageType[]> */
export const mockMessages: Map<number, MessageType[]> = new Map([
  [
    1,
    [
      makeMsg(1, 1001, 2001, '张三', '你好！', Date.now() - 3600000),
      makeMsg(1, 1002, 1001, '当前用户', '你好，张三！', Date.now() - 3500000),
      makeMsg(1, 1003, 2001, '张三', '最近怎么样？', Date.now() - 3400000),
      makeMsg(1, 1004, 1001, '当前用户', '挺好的，在做一个 AI IM 项目', Date.now() - 3300000),
      makeMsg(1, 1005, 2001, '张三', '听起来不错，用的什么技术栈？', Date.now() - 3200000)
    ]
  ],
  [
    2,
    [
      makeMsg(2, 2001, 2001, '张三', '大家好，这是一个技术交流群', Date.now() - 7200000),
      makeMsg(2, 2002, 2002, '李四', '有人用过 Tauri 2.0 吗？', Date.now() - 7000000),
      makeMsg(2, 2003, 2003, '王五', '用过，性能不错', Date.now() - 6800000),
      makeMsg(2, 2004, 2001, '张三', '前端配合 Vue3 挺好用的', Date.now() - 6600000)
    ]
  ],
  [
    3,
    [
      makeMsg(3, 3001, 2002, '李四', '看一下这个图', Date.now() - 90000000),
      makeMsg(3, 3002, 1001, '当前用户', '收到', Date.now() - 89000000)
    ]
  ],
  [
    4,
    [
      makeMsg(4, 4001, 2001, '张三', '明天上午十点开会', Date.now() - 180000000),
      makeMsg(4, 4002, 2003, '王五', '好的', Date.now() - 179000000),
      makeMsg(4, 4003, 2004, '赵六', '收到', Date.now() - 178000000)
    ]
  ]
])

/** 模拟群组成员列表 Map<groupId, GroupMember[]> */
export const mockGroupMembers: Map<number, GroupMember[]> = new Map([
  [
    2,
    [
      {
        uid: 1001,
        username: '当前用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
        role: RoleEnum.OWNER,
        onlineStatus: OnlineEnum.ONLINE,
        joinTime: Date.now() - 86400000 * 30
      },
      {
        uid: 2001,
        username: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        role: RoleEnum.ADMIN,
        onlineStatus: OnlineEnum.ONLINE,
        joinTime: Date.now() - 86400000 * 25
      },
      {
        uid: 2002,
        username: '李四',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
        role: RoleEnum.MEMBER,
        onlineStatus: OnlineEnum.OFFLINE,
        joinTime: Date.now() - 86400000 * 20
      },
      {
        uid: 2003,
        username: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
        role: RoleEnum.MEMBER,
        onlineStatus: OnlineEnum.ONLINE,
        joinTime: Date.now() - 86400000 * 15
      }
    ]
  ],
  [
    4,
    [
      {
        uid: 1001,
        username: '当前用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
        role: RoleEnum.OWNER,
        onlineStatus: OnlineEnum.ONLINE,
        joinTime: Date.now() - 86400000 * 60
      },
      {
        uid: 2001,
        username: '张三',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
        role: RoleEnum.MEMBER,
        onlineStatus: OnlineEnum.ONLINE,
        joinTime: Date.now() - 86400000 * 55
      },
      {
        uid: 2003,
        username: '王五',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
        role: RoleEnum.MEMBER,
        onlineStatus: OnlineEnum.ONLINE,
        joinTime: Date.now() - 86400000 * 50
      },
      {
        uid: 2004,
        username: '赵六',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
        role: RoleEnum.MEMBER,
        onlineStatus: OnlineEnum.OFFLINE,
        joinTime: Date.now() - 86400000 * 45
      }
    ]
  ]
])

/** 模拟日程数据 */
export const mockSchedules: Schedule[] = [
  {
    id: 1,
    title: '项目周会',
    content: '讨论本周开发进度和下周计划',
    startTime: Date.now() + 3600000,
    endTime: Date.now() + 7200000,
    allDay: false,
    remindTime: 15,
    type: 'meeting',
    completed: false,
    createTime: Date.now() - 86400000
  },
  {
    id: 2,
    title: '代码评审',
    content: '评审 AI IM 项目的聊天模块代码',
    startTime: Date.now() + 86400000,
    endTime: Date.now() + 86400000 + 3600000,
    allDay: false,
    remindTime: 30,
    type: 'review',
    completed: false,
    createTime: Date.now() - 172800000
  },
  {
    id: 3,
    title: '发布版本 v1.0',
    content: '正式发布 AI IM 桌面应用 v1.0',
    startTime: Date.now() + 86400000 * 3,
    endTime: Date.now() + 86400000 * 3,
    allDay: true,
    remindTime: 60,
    type: 'milestone',
    completed: false,
    createTime: Date.now() - 259200000
  },
  {
    id: 4,
    title: '需求分析',
    content: '完成智能体功能的需求分析文档',
    startTime: Date.now() - 86400000,
    endTime: Date.now() - 86400000 + 7200000,
    allDay: false,
    remindTime: 10,
    type: 'task',
    completed: true,
    createTime: Date.now() - 345600000
  }
]

/** 模拟工作流（机器人）数据 */
export const mockWorkflows: Workflow[] = [
  {
    id: 1,
    name: '智能客服',
    description: '自动回复用户常见问题的客服机器人',
    aiType: AITypeEnum.BOT,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-service',
    prompt: '你是一个专业的客服助手，请友好地回答用户的问题。',
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048
    },
    enabled: true,
    createTime: Date.now() - 86400000 * 10
  },
  {
    id: 2,
    name: '代码助手',
    description: '辅助编程的 AI 机器人，支持代码生成和审查',
    aiType: AITypeEnum.BOT,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=coder',
    prompt: '你是一个专业的编程助手，擅长 Vue3、TypeScript 和 Rust。',
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 4096
    },
    enabled: true,
    createTime: Date.now() - 86400000 * 7
  },
  {
    id: 3,
    name: '翻译机器人',
    description: '中英文互译的翻译机器人',
    aiType: AITypeEnum.BOT,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=translator',
    prompt: '你是一个专业的翻译助手，支持中英文互译。',
    modelConfig: {
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      maxTokens: 2048
    },
    enabled: false,
    createTime: Date.now() - 86400000 * 5
  }
]

/** 模拟智能体数据 */
export const mockAgents: Agent[] = [
  {
    id: 1,
    name: '项目管理智能体',
    description: '辅助项目管理的 AI 智能体，支持任务分配和进度追踪',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pm-agent',
    systemPrompt: '你是一个项目管理专家，擅长敏捷开发和任务规划。',
    pluginIds: [1, 2],
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 4096
    },
    enabled: true,
    createTime: Date.now() - 86400000 * 15
  },
  {
    id: 2,
    name: '数据分析智能体',
    description: '擅长数据分析和可视化的 AI 智能体',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=data-agent',
    systemPrompt: '你是一个数据分析专家，擅长使用 Python 和 SQL 进行数据分析。',
    pluginIds: [3],
    modelConfig: {
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 8192
    },
    enabled: true,
    createTime: Date.now() - 86400000 * 8
  },
  {
    id: 3,
    name: '文档写作智能体',
    description: '辅助技术文档和方案撰写的 AI 智能体',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=doc-agent',
    systemPrompt: '你是一个技术写作专家，擅长撰写清晰准确的技术文档。',
    pluginIds: [],
    modelConfig: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048
    },
    enabled: false,
    createTime: Date.now() - 86400000 * 3
  }
]

/** 模拟插件数据 */
export const mockPlugins: Plugin[] = [
  {
    id: 1,
    name: '天气查询',
    description: '查询指定城市的实时天气信息',
    icon: '🌤️',
    version: '1.0.0',
    author: '官方',
    status: PluginStatusEnum.BUILTIN,
    downloadUrl: '',
    config: { defaultCity: '北京', units: 'metric' },
    enabled: true,
    installTime: Date.now() - 86400000 * 30,
    updateTime: Date.now() - 86400000 * 30
  },
  {
    id: 2,
    name: '日历同步',
    description: '将应用内日程同步到系统日历',
    icon: '📅',
    version: '1.2.0',
    author: '官方',
    status: PluginStatusEnum.INSTALLED,
    downloadUrl: '',
    config: { syncInterval: 30, calendarId: 'primary' },
    enabled: true,
    installTime: Date.now() - 86400000 * 20,
    updateTime: Date.now() - 86400000 * 5
  },
  {
    id: 3,
    name: '代码运行器',
    description: '在线运行 Python、JavaScript 等代码片段',
    icon: '💻',
    version: '2.0.1',
    author: '社区',
    status: PluginStatusEnum.NOT_INSTALLED,
    downloadUrl: 'https://plugins.example.com/code-runner-2.0.1.tar.gz',
    config: {},
    enabled: false,
    installTime: 0,
    updateTime: Date.now() - 86400000 * 2
  },
  {
    id: 4,
    name: '图片处理',
    description: '图片压缩、格式转换和简单编辑',
    icon: '🖼️',
    version: '1.5.0',
    author: '社区',
    status: PluginStatusEnum.DOWNLOADING,
    downloadUrl: 'https://plugins.example.com/image-processor-1.5.0.tar.gz',
    config: {},
    enabled: false,
    installTime: 0,
    updateTime: Date.now() - 3600000
  }
]

export default {
  mockCurrentUser,
  mockContacts,
  mockSessions,
  mockMessages,
  mockGroupMembers,
  mockSchedules,
  mockWorkflows,
  mockAgents,
  mockPlugins
}
