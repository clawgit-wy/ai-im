import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum, ChatTypeEnum, MsgEnum } from '@/enums'
import apis from '@/services/apis'
import { computedToken } from '@/services/http'
import type { Session, MessageType, GroupMember, SendMsgReq } from '@/services/types'

export const useChatStore = defineStore(StoresEnum.CHAT, () => {
  /** 会话列表 */
  const sessionList = ref<Session[]>([])
  /** 当前选中的会话ID */
  const currentSessionId = ref<number>(0)
  /** 消息列表 Map<sessionId, Message[]> */
  const messages = reactive<Map<number, MessageType[]>>(new Map())
  /** 群成员列表 Map<groupId, Member[]> */
  const groupMembers = reactive<Map<number, GroupMember[]>>(new Map())

  /** 当前会话信息 */
  const currentSession = () => sessionList.value.find((s) => s.id === currentSessionId.value)

  /** 当前会话消息列表 */
  const currentMessages = () => messages.get(currentSessionId.value) || []

  /**
   * 选择会话
   * @param sessionId 会话ID
   */
  function selectSession(sessionId: number) {
    currentSessionId.value = sessionId
    // 标记已读
    const session = sessionList.value.find((s) => s.id === sessionId)
    if (session) {
      session.unread = 0
    }
    apis.markMsgRead({ sessionId }).catch(() => {})
  }

  /**
   * 发送消息
   * @param content 消息内容
   * @param msgType 消息类型
   */
  async function sendMessage(content: string, msgType: MsgEnum = MsgEnum.TEXT) {
    if (!currentSessionId.value) return
    const data: SendMsgReq = {
      sessionId: currentSessionId.value,
      msgType,
      body: { content }
    }
    const res = await apis.sendMsg(data)
    // 将消息添加到列表
    const list = messages.get(currentSessionId.value) || []
    list.push(res)
    messages.set(currentSessionId.value, list)
    // 更新会话最后消息
    const session = sessionList.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      session.lastMsg = content
      session.time = Date.now()
    }
    return res
  }

  /**
   * 创建会话
   * @param session 会话信息
   */
  async function createSession(session: Partial<Session>) {
    const res = await apis.createSession(session)
    sessionList.value.unshift(res)
    currentSessionId.value = res.id
    messages.set(res.id, [])
    return res
  }

  /**
   * 创建群组
   * @param groupName 群名称
   * @param avatar 群头像
   * @param uidList 成员uid列表
   */
  async function createGroup(groupName: string, avatar: string, uidList: number[]) {
    const res = await apis.createGroup({ groupName, avatar, uidList })
    // 创建成功后刷新会话列表
    const session = await apis.sessionDetail({ id: res.id })
    sessionList.value.unshift(session)
    currentSessionId.value = session.id
    messages.set(session.id, [])
    return res
  }

  /**
   * 添加群成员
   * @param groupId 群组ID
   * @param uidList 成员uid列表
   */
  async function addMember(groupId: number, uidList: number[]) {
    await apis.addMember({ sessionId: groupId, uidList })
    // 重新获取群成员
    const res = await apis.getGroupMembers({ sessionId: groupId })
    groupMembers.set(groupId, res.list)
  }

  /**
   * 退出群组
   * @param groupId 群组ID
   */
  async function leaveGroup(groupId: number) {
    await apis.leaveGroup({ sessionId: groupId })
    // 从会话列表中移除
    const index = sessionList.value.findIndex((s) => s.id === groupId)
    if (index > -1) {
      sessionList.value.splice(index, 1)
    }
    messages.delete(groupId)
    groupMembers.delete(groupId)
    if (currentSessionId.value === groupId) {
      currentSessionId.value = sessionList.value[0]?.id || 0
    }
  }

  /**
   * 切换会话AI开关
   * @param sessionId 会话ID
   * @param enabled 是否启用
   */
  function toggleAI(sessionId: number, enabled: boolean) {
    const session = sessionList.value.find((s) => s.id === sessionId)
    if (session) {
      session.aiEnabled = enabled
    }
  }

  /**
   * 清空消息记录
   * @param sessionId 会话ID
   */
  function clearMessages(sessionId: number) {
    messages.set(sessionId, [])
  }

  /**
   * 接收新消息
   * @param msg 消息内容
   */
  function receiveMessage(msg: MessageType) {
    const sessionId = msg.message.sessionId
    const list = messages.get(sessionId) || []
    list.push(msg)
    messages.set(sessionId, list)
    // 更新未读数
    if (currentSessionId.value !== sessionId) {
      const session = sessionList.value.find((s) => s.id === sessionId)
      if (session) {
        session.unread++
      }
    }
  }

  /**
   * 获取群成员列表
   * @param groupId 群组ID
   */
  async function getGroupMembers(groupId: number) {
    const res = await apis.getGroupMembers({ sessionId: groupId })
    groupMembers.set(groupId, res.list)
    return res.list
  }

  return {
    sessionList,
    currentSessionId,
    messages,
    groupMembers,
    currentSession,
    currentMessages,
    selectSession,
    sendMessage,
    createSession,
    createGroup,
    addMember,
    leaveGroup,
    toggleAI,
    clearMessages,
    receiveMessage,
    getGroupMembers
  }
})
