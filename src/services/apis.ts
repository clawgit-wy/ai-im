import request from '@/services/http'
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
  WorkflowReq
} from '@/services/types'

const GET = <T>(url: string, params?: any) => request.get<T>(url, params)
const POST = <T>(url: string, params?: any) => request.post<T>(url, params)
const PUT = <T>(url: string, params?: any) => request.put<T>(url, params)
const DELETE = <T>(url: string, params?: any) => request.delete<T>(url, params)

const { VITE_SERVICE_URL } = import.meta.env
const prefix = VITE_SERVICE_URL

export default {
  // ----------------------- 用户相关 -----------------------
  /** 用户登录 */
  login: (data: LoginReq): Promise<LoginRes> => POST(`${prefix}/api/user/login`, data),
  /** 用户注册 */
  register: (data: RegisterReq): Promise<UserInfo> => POST(`${prefix}/api/user/register`, data),
  /** 获取用户信息 */
  getUserInfo: (): Promise<UserInfo> => GET(`${prefix}/api/user/info`),
  /** 修改用户信息 */
  updateUserInfo: (data: Partial<UserInfo>): Promise<void> => PUT(`${prefix}/api/user/info`, data),
  /** 退出登录 */
  logout: (): Promise<void> => POST(`${prefix}/api/user/logout`),
  /** 发送验证码 */
  sendVerifyCode: (data: { email: string }): Promise<void> => POST(`${prefix}/api/user/send-code`, data),
  /** 重置密码 */
  resetPassword: (data: ResetPasswordReq): Promise<void> => POST(`${prefix}/api/user/reset-password`, data),

  // ----------------------- 消息相关 -----------------------
  /** 发送消息 */
  sendMsg: (data: SendMsgReq): Promise<MessageType> => POST(`${prefix}/api/chat/msg`, data),
  /** 接收消息(轮询) */
  recvMsg: (params?: any): Promise<ListResponse<MessageType>> => GET(`${prefix}/api/chat/msg/recv`, params),
  /** 获取历史消息列表 */
  getMsgList: (params?: any): Promise<ListResponse<MessageType>> => GET(`${prefix}/api/chat/msg/page`, params),
  /** 撤回消息 */
  recallMsg: (data: { msgId: number; sessionId: number }): Promise<void> => PUT(`${prefix}/api/chat/msg/recall`, data),
  /** 标记消息已读 */
  markMsgRead: (data: { sessionId: number }): Promise<void> => PUT(`${prefix}/api/chat/msg/read`, data),

  // ----------------------- 会话相关 -----------------------
  /** 获取会话列表 */
  getSessionList: (params?: any): Promise<ListResponse<Session>> => GET(`${prefix}/api/chat/session/page`, params),
  /** 获取会话详情 */
  sessionDetail: (params: { id: number }): Promise<Session> => GET(`${prefix}/api/chat/session/detail`, params),
  /** 创建会话 */
  createSession: (data: Partial<Session>): Promise<Session> => POST(`${prefix}/api/chat/session`, data),
  /** 删除会话 */
  deleteSession: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/chat/session`, params),

  // ----------------------- 群组相关 -----------------------
  /** 创建群组 */
  createGroup: (data: CreateGroupReq): Promise<{ id: number }> => POST(`${prefix}/api/chat/group`, data),
  /** 获取群成员列表 */
  getGroupMembers: (params: { sessionId: number }): Promise<ListResponse<GroupMember>> =>
    GET(`${prefix}/api/chat/group/members`, params),
  /** 添加群成员 */
  addMember: (data: { sessionId: number; uidList: number[] }): Promise<void> =>
    POST(`${prefix}/api/chat/group/member`, data),
  /** 移除群成员 */
  removeMember: (data: { sessionId: number; uid: number }): Promise<void> =>
    DELETE(`${prefix}/api/chat/group/member`, data),
  /** 退出群组 */
  leaveGroup: (params: { sessionId: number }): Promise<void> => DELETE(`${prefix}/api/chat/group/exit`, params),

  // ----------------------- 日程相关 -----------------------
  /** 获取日程列表 */
  getScheduleList: (params?: any): Promise<ListResponse<Schedule>> => GET(`${prefix}/api/schedule/list`, params),
  /** 获取日程详情 */
  getScheduleDetail: (params: { id: number }): Promise<Schedule> => GET(`${prefix}/api/schedule/detail`, params),
  /** 创建日程 */
  createSchedule: (data: ScheduleReq): Promise<Schedule> => POST(`${prefix}/api/schedule`, data),
  /** 更新日程 */
  updateSchedule: (data: ScheduleReq & { id: number }): Promise<void> => PUT(`${prefix}/api/schedule`, data),
  /** 删除日程 */
  deleteSchedule: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/schedule`, params),

  // ----------------------- 工作流(机器人)相关 -----------------------
  /** 获取工作流列表 */
  getWorkflowList: (params?: any): Promise<ListResponse<Workflow>> => GET(`${prefix}/api/robot/list`, params),
  /** 获取工作流详情 */
  getWorkflowDetail: (params: { id: number }): Promise<Workflow> => GET(`${prefix}/api/robot/detail`, params),
  /** 创建工作流 */
  createWorkflow: (data: WorkflowReq): Promise<Workflow> => POST(`${prefix}/api/robot`, data),
  /** 更新工作流 */
  updateWorkflow: (data: WorkflowReq & { id: number }): Promise<void> => PUT(`${prefix}/api/robot`, data),
  /** 删除工作流 */
  deleteWorkflow: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/robot`, params),

  // ----------------------- 智能体相关 -----------------------
  /** 获取智能体列表 */
  getAgentList: (params?: any): Promise<ListResponse<Agent>> => GET(`${prefix}/api/agent/list`, params),
  /** 获取智能体详情 */
  getAgentDetail: (params: { id: number }): Promise<Agent> => GET(`${prefix}/api/agent/detail`, params),
  /** 创建智能体 */
  createAgent: (data: AgentReq): Promise<Agent> => POST(`${prefix}/api/agent`, data),
  /** 更新智能体配置 */
  updateAgent: (data: AgentReq & { id: number }): Promise<void> => PUT(`${prefix}/api/agent`, data),
  /** 删除智能体 */
  deleteAgent: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/agent`, params),

  // ----------------------- 插件相关 -----------------------
  /** 获取插件列表 */
  getPluginList: (params?: any): Promise<ListResponse<Plugin>> => GET(`${prefix}/api/plugin/list`, params),
  /** 获取插件详情 */
  getPluginDetail: (params: { id: number }): Promise<Plugin> => GET(`${prefix}/api/plugin/detail`, params),
  /** 安装插件 */
  installPlugin: (data: { pluginId: number }): Promise<Plugin> => POST(`${prefix}/api/plugin/install`, data),
  /** 卸载插件 */
  uninstallPlugin: (params: { id: number }): Promise<void> => DELETE(`${prefix}/api/plugin/uninstall`, params),
  /** 更新插件配置 */
  updatePlugin: (data: PluginReq & { id: number }): Promise<void> => PUT(`${prefix}/api/plugin`, data),
  /** 启用/禁用插件 */
  togglePlugin: (data: { id: number; enabled: boolean }): Promise<void> => PUT(`${prefix}/api/plugin/toggle`, data)
}
