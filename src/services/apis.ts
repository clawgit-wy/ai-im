/**
 * API 接口层 (对齐 DESIGN.md 第五部分核心 API 接口索引)
 *
 * 设计原则：
 * 1. 所有接口路径、请求方法与文档定义完全一致(全部 POST)，为后续直接替换为
 *    yutong-im 现成后端接口做好准备。
 * 2. 通过适配器函数(adapter)在 yutong-im 原始类型(YT*)与应用内部类型之间转换，
 *    保证 stores/views 无需感知后端字段差异。
 * 3. 接口域名配置在 Rust 侧 config/base.yaml 的 IMPCUrl，前端通过 VITE_SERVICE_URL
 *    适配 Mock 环境。
 */
import request from '@/services/http'
import {
  ChatTypeListEnum,
  ChatTypeEnum,
  MsgEnum,
  MsgStatusEnum
} from '@/enums'
import type {
  Agent,
  AgentReq,
  CreateGroupReq,
  GroupMember,
  ListResponse,
  LoginReq,
  LoginRes,
  MessageType,
  Plugin,
  PluginReq,
  RegisterReq,
  ResetPasswordReq,
  Schedule,
  ScheduleReq,
  SendMsgReq,
  Session,
  UserInfo,
  Workflow,
  WorkflowReq,
  YTContactInfoReq,
  YTContactSearchReq,
  YTCreateGroupReq,
  YTGroupMemberReq,
  YTListResponse,
  YTLoginReq,
  YTLoginRes,
  YTMessage,
  YTMsgReadMsgReq,
  YTMsgReadReq,
  YTMsgSyncReq,
  YTMsgWithdrawReq,
  YTSession,
  YTSessionListReq,
  YTUserInfo
} from '@/services/types'

const POST = <T = any>(url: string, params?: any): Promise<T> => request.post<T>(url, params)
const GET = <T = any>(url: string, params?: any): Promise<T> => request.get<T>(url, params)
const PUT = <T = any>(url: string, params?: any): Promise<T> => request.put<T>(url, params)
const DELETE = <T = any>(url: string, params?: any): Promise<T> => request.delete<T>(url, params)

const { VITE_SERVICE_URL } = import.meta.env
/** yutong-im 接口前缀(文档第五部分)，Mock 环境下通过 Vite 代理转发 */
const prefix = VITE_SERVICE_URL

/* ======================================================== */
/*                适配器：yutong-im 原始类型 <-> 应用类型     */
/* ======================================================== */

/** chat_type 字符串 <-> 应用 ChatTypeEnum 数字 */
function toAppChatType(chatType: ChatTypeListEnum): ChatTypeEnum {
  return chatType === ChatTypeListEnum.GROUP ? ChatTypeEnum.GROUP : ChatTypeEnum.SINGLE
}

/** YTSession -> 应用 Session */
function adaptSession(raw: YTSession): Session {
  return {
    id: Number(raw.session_id?.split('@').pop()?.split('_')[0]) || 0,
    name: raw.chat_name,
    avatar: raw.headUrl,
    type: toAppChatType(raw.chat_type),
    lastMsg: raw.content,
    time: raw.time,
    unread: raw.unread_num,
    aiEnabled: false
  }
}

/** YTMessage -> 应用 MessageType */
function adaptMessage(raw: YTMessage): MessageType {
  const sendTime = Number(raw.time) || Date.now()
  return {
    fromUser: {
      uid: Number(raw.from_id) || 0,
      username: raw.name,
      avatar: raw.headUrl
    },
    message: {
      id: raw.msg_id,
      sessionId: Number(raw.session_id?.split('@').pop()?.split('_')[0]) || 0,
      type: MsgEnum.TEXT,
      body: { content: raw.content },
      sendTime,
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: new Date(sendTime).toLocaleTimeString(),
    loading: raw.status === MsgStatusEnum.SENDING
  }
}

/** 应用 Session -> YTSession (反向适配，用于创建等场景) */
function toYTSession(session: Partial<Session>): Partial<YTSession> {
  return {
    chat_name: session.name,
    headUrl: session.avatar,
    content: session.lastMsg,
    time: session.time,
    unread_num: session.unread,
    chat_type: session.type === ChatTypeEnum.GROUP ? ChatTypeListEnum.GROUP : ChatTypeListEnum.PERSON
  }
}

export default {
  /* ==================================================== */
  /*          5.1 认证相关 (POST /mercy/app/*)             */
  /* ==================================================== */

  /**
   * 用户登录
   * 文档：POST /mercy/app/auth/login.do (需要 appVersion/deviceId)
   */
  login: (data: LoginReq): Promise<LoginRes> =>
    POST(`${prefix}/mercy/app/auth/login.do`, {
      account: data.account,
      password: data.password,
      appVersion: import.meta.env.VITE_APP_VERSION || '2.0.0',
      deviceId: localStorage.getItem('DEVICE_ID') || generateDeviceId()
    } as YTLoginReq).then((res: YTLoginRes) => ({
      userInfo: {
        uid: Number(res.userInfo.uid) || 0,
        name: res.userInfo.name,
        avatar: res.userInfo.headUrl,
        email: res.userInfo.email,
        phone: res.userInfo.mobile,
        onlineStatus: 1,
        lastOptTime: Date.now()
      },
      token: res.token
    })),

  /**
   * 退出登录
   * 文档：POST /mercy/app/user/logout.do
   */
  logout: (): Promise<void> => POST(`${prefix}/mercy/app/user/logout.do`),

  /* ==================================================== */
  /*          5.2 会话管理 (POST /api/session/*)           */
  /* ==================================================== */

  /**
   * 获取会话列表
   * 文档：POST /api/session/list
   */
  getSessionList: (params?: any): Promise<ListResponse<Session>> =>
    POST(`${prefix}/api/session/list`, params as YTSessionListReq).then(
      (res: YTListResponse<YTSession>) => ({
        cursor: res.cursor || '',
        isLast: res.isLast ?? true,
        list: (res.list || []).map(adaptSession)
      })
    ),

  /** 删除会话 (文档：POST /api/session/del) */
  deleteSession: (data: { id: number }): Promise<void> =>
    POST(`${prefix}/api/session/del`, { session_id: String(data.id) }),

  /** 开启会话通知 (文档：POST /api/session/msgNotice/open) */
  openSessionNotice: (data: { sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/session/msgNotice/open`, { session_id: String(data.sessionId) }),

  /** 关闭会话通知 (文档：POST /api/session/msgNotice/close) */
  closeSessionNotice: (data: { sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/session/msgNotice/close`, { session_id: String(data.sessionId) }),

  /** 通知列表 (文档：POST /api/session/msgNotice/list) */
  getSessionNoticeList: (params?: any): Promise<ListResponse<Session>> =>
    POST(`${prefix}/api/session/msgNotice/list`, params).then(
      (res: YTListResponse<YTSession>) => ({
        cursor: res.cursor || '',
        isLast: res.isLast ?? true,
        list: (res.list || []).map(adaptSession)
      })
    ),

  /** 重置通知 (文档：POST /api/session/msgNotice/reset) */
  resetSessionNotice: (data: { sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/session/msgNotice/reset`, { session_id: String(data.sessionId) }),

  /** 获取会话详情 (复用 list 接口过滤) */
  sessionDetail: (params: { id: number }): Promise<Session> =>
    POST(`${prefix}/api/session/list`, { session_id: String(params.id) }).then(
      (res: YTListResponse<YTSession>) => {
        const raw = res.list?.[0]
        if (!raw) throw new Error('会话不存在')
        return adaptSession(raw)
      }
    ),

  /** 创建会话 (本地组装，无独立文档接口) */
  createSession: (data: Partial<Session>): Promise<Session> => {
    const yt = toYTSession(data)
    return POST(`${prefix}/api/session/list`).then(() => ({
      id: Date.now(),
      name: data.name || '',
      avatar: data.avatar || '',
      type: data.type || ChatTypeEnum.SINGLE,
      lastMsg: '',
      time: Date.now(),
      unread: 0,
      aiEnabled: false,
      ...(yt as any)
    }))
  },

  /* ==================================================== */
  /*          5.3 消息管理 (POST /api/msg/*)               */
  /* ==================================================== */

  /**
   * 消息同步 / 历史消息
   * 文档：POST /api/msg/sync.do
   */
  getMsgList: (params?: any): Promise<ListResponse<MessageType>> =>
    POST(`${prefix}/api/msg/sync.do`, {
      session_id: String(params?.sessionId),
      last_msg_id: params?.cursor ? Number(params.cursor) : 0,
      size: params?.size || 20
    } as YTMsgSyncReq).then((res: YTListResponse<YTMessage>) => {
      const list = (res.list || []).map(adaptMessage)
      return {
        cursor: list.length > 0 ? String(list[0].message.id) : '',
        isLast: res.isLast ?? list.length < (params?.size || 20),
        list
      }
    }),

  /** 离线消息 (文档：POST /api/msg/offlineAndTop.do) */
  getOfflineMsg: (params?: any): Promise<ListResponse<MessageType>> =>
    POST(`${prefix}/api/msg/offlineAndTop.do`, params).then((res: YTListResponse<YTMessage>) => ({
      cursor: res.cursor || '',
      isLast: res.isLast ?? true,
      list: (res.list || []).map(adaptMessage)
    })),

  /**
   * 发送消息
   * 调用 /api/chat/msg 接口，将消息写入数据库并通过 WebSocket 广播
   */
  sendMsg: (data: SendMsgReq): Promise<MessageType> =>
    POST(`${prefix}/api/chat/msg`, {
      sessionId: data.sessionId,
      msgType: data.msgType,
      body: data.body
    }).then((res: any) => {
      // 后端返回 { fromUser, message, sendTime } 结构
      return {
        fromUser: {
          uid: res.fromUser?.uid || 0,
          username: res.fromUser?.username || '',
          avatar: res.fromUser?.avatar || ''
        },
        message: {
          id: res.message?.id || 0,
          sessionId: res.message?.sessionId || data.sessionId,
          type: res.message?.type || MsgEnum.TEXT,
          body: res.message?.body || { content: data.body.content },
          sendTime: res.message?.sendTime || Date.now(),
          messageMark: res.message?.messageMark || { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
        },
        sendTime: res.sendTime || new Date().toLocaleTimeString(),
        loading: false
      } as MessageType
    }),

  /** 接收消息(轮询，复用 sync) */
  recvMsg: (params?: any): Promise<ListResponse<MessageType>> =>
    POST(`${prefix}/api/msg/sync.do`, params).then((res: YTListResponse<YTMessage>) => ({
      cursor: res.cursor || '',
      isLast: res.isLast ?? true,
      list: (res.list || []).map(adaptMessage)
    })),

  /** 消息已读 (文档：POST /api/msg/read.do) */
  markMsgRead: (data: { sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/msg/read.do`, { session_id: String(data.sessionId) } as YTMsgReadReq),

  /** 消息已读上报 (文档：POST /api/msg/readMsg.do) */
  reportMsgRead: (data: { msgIds: number[] }): Promise<void> =>
    POST(`${prefix}/api/msg/readMsg.do`, { msg_ids: data.msgIds } as YTMsgReadMsgReq),

  /** 消息已读状态 (文档：POST /api/msg/status.do) */
  getMsgReadStatus: (data: { sessionId: number }): Promise<any> =>
    POST(`${prefix}/api/msg/status.do`, { session_id: String(data.sessionId) }),

  /** 未读数量 (文档：POST /api/msg/unReadNum.do) */
  getUnreadNum: (params?: any): Promise<any> => POST(`${prefix}/api/msg/unReadNum.do`, params),

  /** 清空消息 (文档：POST /api/msg/clear.do) */
  clearMsg: (data: { sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/msg/clear.do`, { session_id: String(data.sessionId) }),

  /** 撤回消息 (文档：POST /api/msg/withdraw.do) */
  recallMsg: (data: { msgId: number; sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/msg/withdraw.do`, {
      msg_id: data.msgId,
      session_id: String(data.sessionId)
    } as YTMsgWithdrawReq),

  /** 会话置顶 (文档：POST /api/msg/top.do) */
  topSession: (data: { sessionId: number; top: boolean }): Promise<void> =>
    POST(`${prefix}/api/msg/top.do`, {
      session_id: String(data.sessionId),
      head: data.top ? 1 : 0
    }),

  /** 置顶列表 (文档：POST /api/msg/topList.do) */
  getTopList: (params?: any): Promise<ListResponse<MessageType>> =>
    POST(`${prefix}/api/msg/topList.do`, params).then((res: YTListResponse<YTMessage>) => ({
      cursor: res.cursor || '',
      isLast: res.isLast ?? true,
      list: (res.list || []).map(adaptMessage)
    })),

  /** 提醒列表 (文档：POST /api/msg/remindList.do) */
  getRemindList: (params?: any): Promise<any> => POST(`${prefix}/api/msg/remindList.do`, params),

  /** 设置提醒 (文档：POST /api/msg/remind.do) */
  setRemind: (data: { sessionId: number; remind: boolean }): Promise<void> =>
    POST(`${prefix}/api/msg/remind.do`, {
      session_id: String(data.sessionId),
      remind: data.remind ? 1 : 0
    }),

  /* ==================================================== */
  /*          5.4 群组管理 (POST /api/group/*)             */
  /* ==================================================== */

  /** 创建群组 (文档：POST /api/group/create.do) */
  createGroup: (data: CreateGroupReq): Promise<{ id: number }> =>
    POST(`${prefix}/api/group/create.do`, {
      name: data.groupName,
      avatar: data.avatar,
      uidList: data.uidList.map(String)
    } as YTCreateGroupReq).then((res: any) => ({ id: Number(res.group_id || res.id) || 0 })),

  /** 群组列表 (文档：POST /api/group/listNew.do) */
  getGroupList: (params?: any): Promise<ListResponse<any>> =>
    POST(`${prefix}/api/group/listNew.do`, params),

  /** 群组信息 (文档：POST /api/group/infoNew.do) */
  getGroupInfo: (data: { groupId: number }): Promise<any> =>
    POST(`${prefix}/api/group/infoNew.do`, { group_id: String(data.groupId) }),

  /** 修改群信息 (文档：POST /api/group/update.do) */
  updateGroup: (data: any): Promise<void> => POST(`${prefix}/api/group/update.do`, data),

  /** 退出群组 (文档：POST /api/group/quit.do) */
  leaveGroup: (data: { sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/group/quit.do`, { group_id: String(data.sessionId) }),

  /** 添加群成员 (文档：POST /api/group/add.do) */
  addMember: (data: { sessionId: number; uidList: number[] }): Promise<void> =>
    POST(`${prefix}/api/group/add.do`, {
      group_id: String(data.sessionId),
      uidList: data.uidList.map(String)
    } as YTGroupMemberReq),

  /** 移除群成员 (文档：POST /api/group/remove.do) */
  removeMember: (data: { sessionId: number; uid: number }): Promise<void> =>
    POST(`${prefix}/api/group/remove.do`, {
      group_id: String(data.sessionId),
      uidList: [String(data.uid)]
    } as YTGroupMemberReq),

  /** 搜索群组 (文档：POST /api/group/searchPage.do) */
  searchGroup: (params?: any): Promise<ListResponse<any>> =>
    POST(`${prefix}/api/group/searchPage.do`, params),

  /** 移交群主 (文档：POST /api/group/changeAdmin) */
  changeGroupAdmin: (data: { groupId: number; uid: number }): Promise<void> =>
    POST(`${prefix}/api/group/changeAdmin`, {
      group_id: String(data.groupId),
      uid: String(data.uid)
    }),

  /** 解散群组 (文档：POST /api/group/disband.do) */
  disbandGroup: (data: { groupId: number }): Promise<void> =>
    POST(`${prefix}/api/group/disband.do`, { group_id: String(data.groupId) }),

  /** 修改群公告 (文档：POST /api/group/updateNotice.do) */
  updateGroupNotice: (data: { groupId: number; notice: string }): Promise<void> =>
    POST(`${prefix}/api/group/updateNotice.do`, {
      group_id: String(data.groupId),
      notice: data.notice
    }),

  /** 获取群成员列表 (复用 group/infoNew.do) */
  getGroupMembers: (params: { sessionId: number }): Promise<ListResponse<GroupMember>> =>
    POST(`${prefix}/api/group/infoNew.do`, { group_id: String(params.sessionId) }).then(
      (res: any) => ({
        cursor: '',
        isLast: true,
        list: (res.members || res.list || []) as GroupMember[]
      })
    ),

  /* ==================================================== */
  /*          5.5 联系人管理 (POST /api/contact/*)         */
  /* ==================================================== */

  /** 获取用户信息 (文档：POST /api/contact/info.do) */
  getContactInfo: (data: { uid: number }): Promise<UserInfo> =>
    POST(`${prefix}/api/contact/info.do`, { uid: String(data.uid) } as YTContactInfoReq).then(
      (res: YTUserInfo) => ({
        uid: Number(res.uid) || 0,
        name: res.name,
        avatar: res.headUrl,
        email: res.email,
        phone: res.mobile,
        onlineStatus: 1,
        lastOptTime: Date.now()
      })
    ),

  /** 搜索人员 (文档：POST /api/contact/search.do) */
  searchContact: (data: { keyword: string; page?: number; size?: number }): Promise<ListResponse<UserInfo>> =>
    POST(`${prefix}/api/contact/search.do`, data as YTContactSearchReq).then(
      (res: YTListResponse<YTUserInfo>) => ({
        cursor: res.cursor || '',
        isLast: res.isLast ?? true,
        list: (res.list || []).map((u) => ({
          uid: Number(u.uid) || 0,
          name: u.name,
          avatar: u.headUrl,
          email: u.email,
          phone: u.mobile,
          onlineStatus: 1,
          lastOptTime: Date.now()
        }))
      })
    ),

  /** 常用联系人 (文档：POST /api/contact/list) */
  getContactList: (params?: any): Promise<ListResponse<UserInfo>> =>
    POST(`${prefix}/api/contact/list`, params).then((res: YTListResponse<YTUserInfo>) => ({
      cursor: res.cursor || '',
      isLast: res.isLast ?? true,
      list: (res.list || []).map((u) => ({
        uid: Number(u.uid) || 0,
        name: u.name,
        avatar: u.headUrl,
        email: u.email,
        phone: u.mobile,
        onlineStatus: 1,
        lastOptTime: Date.now()
      }))
    })),

  /** 添加联系人 (文档：POST /api/contact/add) */
  addContact: (data: { uid: number }): Promise<void> =>
    POST(`${prefix}/api/contact/add`, { uid: String(data.uid) }),

  /** 更新联系人 (文档：POST /api/contact/change) */
  updateContact: (data: any): Promise<void> => POST(`${prefix}/api/contact/change`, data),

  /** 删除联系人 (文档：POST /api/contact/del) */
  deleteContact: (data: { uid: number }): Promise<void> =>
    POST(`${prefix}/api/contact/del`, { uid: String(data.uid) }),

  /** 更新签名 (文档：POST /api/contact/updateSign.do) */
  updateSign: (data: { sign: string }): Promise<void> =>
    POST(`${prefix}/api/contact/updateSign.do`, data),

  /** 手机号查询 (文档：POST /api/contact/phoneByAccount) */
  queryPhoneByAccount: (data: { account: string }): Promise<any> =>
    POST(`${prefix}/api/contact/phoneByAccount`, data),

  /* ==================================================== */
  /*          5.6 其他 (POST /api/org|user|yml|chatTopUp)  */
  /* ==================================================== */

  /** 组织树 (文档：POST /api/org/listYxt.do) */
  getOrgTree: (params?: any): Promise<any> => POST(`${prefix}/api/org/listYxt.do`, params),

  /** 查询组织下人员 (文档：POST /api/org/emp.do) */
  getOrgEmployees: (params?: any): Promise<any> => POST(`${prefix}/api/org/emp.do`, params),

  /** 查询在线设备 (文档：POST /api/user/onlines.do) */
  getOnlineDevices: (params?: any): Promise<any> => POST(`${prefix}/api/user/onlines.do`, params),

  /** 在线状态查询 (文档：POST /api/user/onlineStatus) */
  getOnlineStatus: (params?: any): Promise<any> => POST(`${prefix}/api/user/onlineStatus`, params),

  /** 获取会议列表 (文档：POST /api/yml/meetingInfo) */
  getMeetingList: (params?: any): Promise<any> => POST(`${prefix}/api/yml/meetingInfo`, params),

  /** 群管理员置顶消息 (文档：POST /api/chatTopUp/topUpMsg) */
  topUpMsg: (data: { msgId: number; sessionId: number }): Promise<void> =>
    POST(`${prefix}/api/chatTopUp/topUpMsg`, {
      msg_id: data.msgId,
      session_id: String(data.sessionId)
    }),

  /* ==================================================== */
  /*          用户信息 (兼容原有 /api/user/info)            */
  /* ==================================================== */

  /** 获取用户信息 (复用 contact/info.do，传入当前 uid) */
  getUserInfo: (): Promise<UserInfo> => {
    const uid = Number(localStorage.getItem('UID')) || 0
    return POST(`${prefix}/api/contact/info.do`, { uid: String(uid) } as YTContactInfoReq).then(
      (res: YTUserInfo) => ({
        uid: Number(res.uid) || 0,
        name: res.name,
        avatar: res.headUrl,
        email: res.email,
        phone: res.mobile,
        onlineStatus: 1,
        lastOptTime: Date.now()
      })
    )
  },

  /** 修改用户信息 (复用 contact/change) */
  updateUserInfo: (data: Partial<UserInfo>): Promise<void> =>
    POST(`${prefix}/api/contact/change`, data),

  /* ==================================================== */
  /*          兼容接口：注册/验证码/重置密码                */
  /*  (文档未定义，保留 Mock 用，yutong-im 后端无此能力)    */
  /* ==================================================== */

  /** 用户注册 (Mock 专用，yutong-im 后端无此接口) */
  register: (data: RegisterReq): Promise<UserInfo> => POST(`${prefix}/api/user/register`, data),

  /** 发送验证码 (Mock 专用) */
  sendVerifyCode: (data: { email: string }): Promise<void> =>
    POST(`${prefix}/api/user/send-code`, data),

  /** 重置密码 (Mock 专用) */
  resetPassword: (data: ResetPasswordReq): Promise<void> =>
    POST(`${prefix}/api/user/reset-password`, data),

  /* ==================================================== */
  /*          兼容接口：日程 (P2，文档第六部分预留)         */
  /* ==================================================== */

  getScheduleList: (params?: any): Promise<ListResponse<Schedule>> =>
    GET(`${prefix}/api/schedule/list`, params),
  getScheduleDetail: (params: { id: number }): Promise<Schedule> =>
    GET(`${prefix}/api/schedule/detail`, params),
  createSchedule: (data: ScheduleReq): Promise<Schedule> => POST(`${prefix}/api/schedule`, data),
  updateSchedule: (data: ScheduleReq & { id: number }): Promise<void> =>
    PUT(`${prefix}/api/schedule`, data),
  deleteSchedule: (params: { id: number }): Promise<void> =>
    DELETE(`${prefix}/api/schedule`, params),

  /* ==================================================== */
  /*          兼容接口：机器人/智能体/插件 (P2)            */
  /* ==================================================== */

  getWorkflowList: (params?: any): Promise<ListResponse<Workflow>> =>
    GET(`${prefix}/api/robot/list`, params),
  getWorkflowDetail: (params: { id: number }): Promise<Workflow> =>
    GET(`${prefix}/api/robot/detail`, params),
  createWorkflow: (data: WorkflowReq): Promise<Workflow> => POST(`${prefix}/api/robot`, data),
  updateWorkflow: (data: WorkflowReq & { id: number }): Promise<void> =>
    PUT(`${prefix}/api/robot`, data),
  deleteWorkflow: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/robot`, params),

  getAgentList: (params?: any): Promise<ListResponse<Agent>> =>
    GET(`${prefix}/api/agent/list`, params),
  getAgentDetail: (params: { id: number }): Promise<Agent> => GET(`${prefix}/api/agent/detail`, params),
  createAgent: (data: AgentReq): Promise<Agent> => POST(`${prefix}/api/agent`, data),
  updateAgent: (data: AgentReq & { id: number }): Promise<void> => PUT(`${prefix}/api/agent`, data),
  deleteAgent: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/agent`, params),

  getPluginList: (params?: any): Promise<ListResponse<Plugin>> =>
    GET(`${prefix}/api/plugin/list`, params),
  getPluginDetail: (params: { id: number }): Promise<Plugin> => GET(`${prefix}/api/plugin/detail`, params),
  installPlugin: (data: { pluginId: number }): Promise<Plugin> =>
    POST(`${prefix}/api/plugin/install`, data),
  uninstallPlugin: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/plugin/uninstall`, params),
  updatePlugin: (data: PluginReq & { id: number }): Promise<void> => PUT(`${prefix}/api/plugin`, data),
  togglePlugin: (data: { id: number; enabled: boolean }): Promise<void> =>
    PUT(`${prefix}/api/plugin/toggle`, data)
}

/** 生成设备ID (对应文档 4.3.1 deviceId) */
function generateDeviceId(): string {
  const id = `im_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem('DEVICE_ID', id)
  return id
}
