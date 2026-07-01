import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { ChatTypeEnum, MsgEnum } from '@/enums'
import type { Session, MessageType, GroupMember } from '@/services/types'

// mock apis 模块，避免真实网络请求
vi.mock('@/services/apis', () => ({
  default: {
    createSession: vi.fn().mockResolvedValue(undefined),
    createGroup: vi.fn().mockResolvedValue(undefined),
    sessionDetail: vi.fn().mockResolvedValue(undefined),
    sendMsg: vi.fn().mockResolvedValue(undefined),
    markMsgRead: vi.fn().mockResolvedValue(undefined),
    addMember: vi.fn().mockResolvedValue(undefined),
    getGroupMembers: vi.fn().mockResolvedValue(undefined),
    leaveGroup: vi.fn().mockResolvedValue(undefined)
  }
}))

// mock http 模块中的 computedToken，避免 localStorage 问题
vi.mock('@/services/http', () => ({
  computedToken: {
    get: vi.fn(() => ''),
    set: vi.fn(),
    clear: vi.fn()
  }
}))

import apis from '@/services/apis'

/** 构造一个单人会话 */
function makeSingleSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 1,
    name: '张三',
    avatar: 'https://example.com/avatar1.png',
    type: ChatTypeEnum.SINGLE,
    lastMsg: '',
    time: Date.now(),
    unread: 0,
    aiEnabled: false,
    ...overrides
  }
}

/** 构造一条消息 */
function makeMessage(sessionId: number, content: string): MessageType {
  return {
    fromUser: { uid: 1, username: '张三', avatar: 'https://example.com/avatar1.png' },
    message: {
      id: Math.floor(Math.random() * 100000),
      sessionId,
      type: MsgEnum.TEXT,
      body: { content },
      sendTime: Date.now(),
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: String(Date.now())
  }
}

/** 构造一个群成员 */
function makeMember(uid: number, username: string): GroupMember {
  return {
    uid,
    username,
    avatar: `https://example.com/u${uid}.png`,
    role: 3,
    onlineStatus: 1,
    joinTime: Date.now()
  }
}

describe('useChatStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('创建单人对话', () => {
    it('应创建单人会话并添加到会话列表', async () => {
      const session = makeSingleSession()
      vi.mocked(apis.createSession).mockResolvedValue(session)

      const store = useChatStore()
      const res = await store.createSession({ name: '张三', type: ChatTypeEnum.SINGLE })

      expect(apis.createSession).toHaveBeenCalledWith({ name: '张三', type: ChatTypeEnum.SINGLE })
      expect(res).toEqual(session)
      expect(store.sessionList).toHaveLength(1)
      expect(store.sessionList[0]).toEqual(session)
      expect(store.currentSessionId).toBe(session.id)
    })

    it('创建会话后应初始化空消息列表', async () => {
      const session = makeSingleSession()
      vi.mocked(apis.createSession).mockResolvedValue(session)

      const store = useChatStore()
      await store.createSession({ name: '张三' })

      expect(store.messages.get(session.id)).toEqual([])
    })
  })

  describe('创建群组', () => {
    it('应创建群组并将会话加入列表', async () => {
      const groupSession: Session = makeSingleSession({
        id: 100,
        name: '技术交流群',
        type: ChatTypeEnum.GROUP
      })
      vi.mocked(apis.createGroup).mockResolvedValue({ id: 100 })
      vi.mocked(apis.sessionDetail).mockResolvedValue(groupSession)

      const store = useChatStore()
      const res = await store.createGroup('技术交流群', 'https://example.com/g.png', [1, 2, 3])

      expect(apis.createGroup).toHaveBeenCalledWith({
        groupName: '技术交流群',
        avatar: 'https://example.com/g.png',
        uidList: [1, 2, 3]
      })
      expect(apis.sessionDetail).toHaveBeenCalledWith({ id: 100 })
      expect(res).toEqual({ id: 100 })
      expect(store.sessionList).toHaveLength(1)
      expect(store.sessionList[0].type).toBe(ChatTypeEnum.GROUP)
      expect(store.currentSessionId).toBe(100)
    })

    it('创建群组后应初始化空消息列表', async () => {
      const groupSession: Session = makeSingleSession({
        id: 100,
        name: '技术交流群',
        type: ChatTypeEnum.GROUP
      })
      vi.mocked(apis.createGroup).mockResolvedValue({ id: 100 })
      vi.mocked(apis.sessionDetail).mockResolvedValue(groupSession)

      const store = useChatStore()
      await store.createGroup('技术交流群', 'https://example.com/g.png', [1, 2])

      expect(store.messages.get(100)).toEqual([])
    })
  })

  describe('发送消息', () => {
    it('应在当前会话中发送文本消息', async () => {
      const session = makeSingleSession({ id: 1 })
      vi.mocked(apis.createSession).mockResolvedValue(session)

      const store = useChatStore()
      await store.createSession({ name: '张三' })

      const msg = makeMessage(1, '你好')
      vi.mocked(apis.sendMsg).mockResolvedValue(msg)

      const res = await store.sendMessage('你好')

      expect(apis.sendMsg).toHaveBeenCalledWith({
        sessionId: 1,
        msgType: MsgEnum.TEXT,
        body: { content: '你好' }
      })
      expect(res).toEqual(msg)
      expect(store.messages.get(1)).toHaveLength(1)
      expect(store.messages.get(1)![0]).toEqual(msg)
    })

    it('发送消息应更新会话最后消息内容和时间', async () => {
      const session = makeSingleSession({ id: 1, lastMsg: '', time: 1000 })
      vi.mocked(apis.createSession).mockResolvedValue(session)

      const store = useChatStore()
      await store.createSession({ name: '张三' })

      const msg = makeMessage(1, '新消息')
      vi.mocked(apis.sendMsg).mockResolvedValue(msg)

      await store.sendMessage('新消息')

      const current = store.sessionList[0]
      expect(current.lastMsg).toBe('新消息')
      expect(current.time).toBeGreaterThan(1000)
    })

    it('未选中会话时不应发送消息', async () => {
      const store = useChatStore()
      const res = await store.sendMessage('测试')
      expect(res).toBeUndefined()
      expect(apis.sendMsg).not.toHaveBeenCalled()
    })

    it('支持指定消息类型', async () => {
      const session = makeSingleSession({ id: 1 })
      vi.mocked(apis.createSession).mockResolvedValue(session)
      const store = useChatStore()
      await store.createSession({ name: '张三' })

      const msg = makeMessage(1, '[图片]')
      vi.mocked(apis.sendMsg).mockResolvedValue(msg)

      await store.sendMessage('[图片]', MsgEnum.IMAGE)

      expect(apis.sendMsg).toHaveBeenCalledWith(
        expect.objectContaining({ msgType: MsgEnum.IMAGE })
      )
    })
  })

  describe('切换AI助手', () => {
    it('应将会话的 aiEnabled 设置为 true', () => {
      const session = makeSingleSession({ id: 1, aiEnabled: false })
      const store = useChatStore()
      store.sessionList.push(session)

      store.toggleAI(1, true)

      expect(store.sessionList[0].aiEnabled).toBe(true)
    })

    it('应将会话的 aiEnabled 设置为 false', () => {
      const session = makeSingleSession({ id: 1, aiEnabled: true })
      const store = useChatStore()
      store.sessionList.push(session)

      store.toggleAI(1, false)

      expect(store.sessionList[0].aiEnabled).toBe(false)
    })

    it('会话不存在时不应报错', () => {
      const store = useChatStore()
      expect(() => store.toggleAI(999, true)).not.toThrow()
    })
  })

  describe('清空消息', () => {
    it('应清空指定会话的消息列表', async () => {
      const session = makeSingleSession({ id: 1 })
      vi.mocked(apis.createSession).mockResolvedValue(session)
      const store = useChatStore()
      await store.createSession({ name: '张三' })

      const msg = makeMessage(1, '你好')
      vi.mocked(apis.sendMsg).mockResolvedValue(msg)
      await store.sendMessage('你好')

      expect(store.messages.get(1)).toHaveLength(1)

      store.clearMessages(1)

      expect(store.messages.get(1)).toEqual([])
    })

    it('清空不存在的会话应创建空列表', () => {
      const store = useChatStore()
      store.clearMessages(999)
      expect(store.messages.get(999)).toEqual([])
    })
  })

  describe('群组成员管理', () => {
    it('应添加群成员并刷新成员列表', async () => {
      const groupSession: Session = makeSingleSession({ id: 100, type: ChatTypeEnum.GROUP })
      vi.mocked(apis.createGroup).mockResolvedValue({ id: 100 })
      vi.mocked(apis.sessionDetail).mockResolvedValue(groupSession)

      const store = useChatStore()
      await store.createGroup('群组', 'avatar', [1, 2])

      const members = [makeMember(1, '用户1'), makeMember(2, '用户2'), makeMember(3, '新用户')]
      vi.mocked(apis.addMember).mockResolvedValue(undefined)
      vi.mocked(apis.getGroupMembers).mockResolvedValue({
        cursor: '',
        isLast: true,
        list: members
      })

      await store.addMember(100, [3])

      expect(apis.addMember).toHaveBeenCalledWith({ sessionId: 100, uidList: [3] })
      expect(apis.getGroupMembers).toHaveBeenCalledWith({ sessionId: 100 })
      expect(store.groupMembers.get(100)).toHaveLength(3)
      expect(store.groupMembers.get(100)![2].username).toBe('新用户')
    })

    it('退出群组应从会话列表和消息中移除', async () => {
      const groupSession: Session = makeSingleSession({ id: 100, type: ChatTypeEnum.GROUP })
      vi.mocked(apis.createGroup).mockResolvedValue({ id: 100 })
      vi.mocked(apis.sessionDetail).mockResolvedValue(groupSession)
      vi.mocked(apis.leaveGroup).mockResolvedValue(undefined)

      const store = useChatStore()
      await store.createGroup('群组', 'avatar', [1, 2])

      // 添加一些消息
      store.messages.set(100, [makeMessage(100, 'hello')])
      // 添加一些成员
      store.groupMembers.set(100, [makeMember(1, '用户1')])

      await store.leaveGroup(100)

      expect(apis.leaveGroup).toHaveBeenCalledWith({ sessionId: 100 })
      expect(store.sessionList).toHaveLength(0)
      expect(store.messages.get(100)).toBeUndefined()
      expect(store.groupMembers.get(100)).toBeUndefined()
    })

    it('退出当前选中的群组后应切换 currentSessionId', async () => {
      const session1 = makeSingleSession({ id: 1, name: '单聊' })
      const groupSession = makeSingleSession({ id: 100, name: '群组', type: ChatTypeEnum.GROUP })

      vi.mocked(apis.createSession).mockResolvedValue(session1)
      vi.mocked(apis.createGroup).mockResolvedValue({ id: 100 })
      vi.mocked(apis.sessionDetail).mockResolvedValue(groupSession)
      vi.mocked(apis.leaveGroup).mockResolvedValue(undefined)

      const store = useChatStore()
      await store.createSession({ name: '单聊' })
      await store.createGroup('群组', 'avatar', [1])

      expect(store.currentSessionId).toBe(100)

      await store.leaveGroup(100)

      // 退出当前群组后应切换到列表中的第一个会话
      expect(store.currentSessionId).toBe(1)
    })

    it('退出最后一个群组后 currentSessionId 应为 0', async () => {
      const groupSession = makeSingleSession({ id: 100, name: '群组', type: ChatTypeEnum.GROUP })
      vi.mocked(apis.createGroup).mockResolvedValue({ id: 100 })
      vi.mocked(apis.sessionDetail).mockResolvedValue(groupSession)
      vi.mocked(apis.leaveGroup).mockResolvedValue(undefined)

      const store = useChatStore()
      await store.createGroup('群组', 'avatar', [1])

      await store.leaveGroup(100)

      expect(store.currentSessionId).toBe(0)
    })

    it('getGroupMembers 应获取并存储群成员列表', async () => {
      const members = [makeMember(1, '用户1'), makeMember(2, '用户2')]
      vi.mocked(apis.getGroupMembers).mockResolvedValue({
        cursor: '',
        isLast: true,
        list: members
      })

      const store = useChatStore()
      const result = await store.getGroupMembers(100)

      expect(apis.getGroupMembers).toHaveBeenCalledWith({ sessionId: 100 })
      expect(result).toHaveLength(2)
      expect(store.groupMembers.get(100)).toEqual(members)
    })
  })

  describe('接收消息', () => {
    it('应将消息添加到对应会话', () => {
      const store = useChatStore()
      store.messages.set(1, [])

      const msg = makeMessage(1, '新消息')
      store.receiveMessage(msg)

      expect(store.messages.get(1)).toHaveLength(1)
      expect(store.messages.get(1)![0]).toEqual(msg)
    })

    it('非当前会话接收消息应增加未读数', () => {
      const session = makeSingleSession({ id: 1, unread: 0 })
      const store = useChatStore()
      store.sessionList.push(session)
      store.currentSessionId = 2

      const msg = makeMessage(1, '新消息')
      store.receiveMessage(msg)

      expect(store.sessionList[0].unread).toBe(1)
    })

    it('当前会话接收消息不应增加未读数', () => {
      const session = makeSingleSession({ id: 1, unread: 0 })
      const store = useChatStore()
      store.sessionList.push(session)
      store.currentSessionId = 1

      const msg = makeMessage(1, '新消息')
      store.receiveMessage(msg)

      expect(store.sessionList[0].unread).toBe(0)
    })
  })

  describe('选择会话', () => {
    it('应切换当前会话ID', () => {
      const session = makeSingleSession({ id: 1 })
      const store = useChatStore()
      store.sessionList.push(session)

      store.selectSession(1)

      expect(store.currentSessionId).toBe(1)
    })

    it('选择会话应将未读数清零', () => {
      const session = makeSingleSession({ id: 1, unread: 5 })
      const store = useChatStore()
      store.sessionList.push(session)
      vi.mocked(apis.markMsgRead).mockResolvedValue(undefined)

      store.selectSession(1)

      expect(store.sessionList[0].unread).toBe(0)
      expect(apis.markMsgRead).toHaveBeenCalledWith({ sessionId: 1 })
    })
  })
})
