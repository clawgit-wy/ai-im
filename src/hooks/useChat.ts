import { ref, reactive, computed } from 'vue'
import apis from '@/services/apis'
import { useUserStore } from '@/stores/user'
import { ChatTypeEnum, MsgEnum, MittEnum } from '@/enums'
import Mitt from '@/utils/Bus'
import type { Session, MessageType } from '@/services/types'

/** AI助手类型 */
export type AIAssistantType = 'none' | 'ai-bot' | 'claude' | 'hermes' | 'schedule-bot' | 'translate-bot'

/** 对话列表项 */
export interface ChatItem {
  id: number
  name: string
  avatar: string
  avatarBg?: string
  avatarColor?: string
  status: string
  type: 'single' | 'group'
  aiEnabled: boolean
  lastMsg: string
  time: string
  unread: number
  memberCount?: number
  pinned?: boolean
  muted?: boolean
}

/** 聊天消息 */
export interface ChatMessage {
  id: number
  sender: 'user' | 'ai' | 'other'
  name: string
  avatar: string
  avatarBg?: string
  text: string
  time: string
  isAI?: boolean
  aiType?: 'bot' | 'agent'
  system?: boolean
}

/** 群成员 */
export interface Member {
  id: number
  name: string
  avatar: string
  avatarBg?: string
  role: 'owner' | 'admin' | 'member' | 'bot'
}

/** 联系人(用于创建对话) */
export interface Contact {
  id: number
  name: string
  avatar: string
  avatarBg?: string
}

/** 群组权限 */
export interface GroupPermissions {
  allowInvite: boolean
  allowModifyName: boolean
  allowAddBot: boolean
}

/** AI助手配置 */
export interface AIConfig {
  name: string
  avatar: string
  type: 'bot' | 'agent'
  avatarBg: string
  avatarColor?: string
}

/** AI助手选项 */
export const aiAssistantOptions = [
  { label: '不使用AI', value: 'none' },
  { label: 'AI助手 (内置)', value: 'ai-bot' },
  { label: 'Claude (claude-3-opus)', value: 'claude' },
  { label: 'Hermes (hermes-2-pro)', value: 'hermes' },
  { label: '日程机器人', value: 'schedule-bot' },
  { label: '翻译机器人', value: 'translate-bot' }
]

/** AI助手配置映射 */
const aiConfigMap: Record<string, AIConfig> = {
  'ai-bot': { name: 'AI助手', avatar: '🤖', type: 'bot', avatarBg: 'linear-gradient(135deg, #13987f, #6c5ce7)' },
  claude: { name: 'Claude', avatar: '🧠', type: 'agent', avatarBg: 'linear-gradient(135deg, #dfe6e9, #b2bec3)', avatarColor: '#333' },
  hermes: { name: 'Hermes', avatar: '🧠', type: 'agent', avatarBg: 'linear-gradient(135deg, #74b9ff, #0984e3)' },
  'schedule-bot': { name: '日程机器人', avatar: '🤖', type: 'bot', avatarBg: 'linear-gradient(135deg, #00b894, #00cec9)' },
  'translate-bot': { name: '翻译机器人', avatar: '🤖', type: 'bot', avatarBg: 'linear-gradient(135deg, #00b894, #00cec9)' }
}

/** 模拟联系人数据(后端暂无联系人接口，使用本地数据) */
const mockContacts: Contact[] = [
  { id: 2, name: '张三', avatar: '👨', avatarBg: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' },
  { id: 3, name: '李四', avatar: '👩', avatarBg: 'linear-gradient(135deg, #fd79a8, #e84393)' },
  { id: 5, name: '小明', avatar: '🧑', avatarBg: 'linear-gradient(135deg, #fdcb6e, #f39c12)' },
  { id: 8, name: '王五', avatar: '👨', avatarBg: 'linear-gradient(135deg, #74b9ff, #0984e3)' },
  { id: 9, name: '赵六', avatar: '👩', avatarBg: 'linear-gradient(135deg, #a29bfe, #6c5ce7)' }
]

let messageIdCounter = 1000

/** 时间戳转 HH:MM */
function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

/** 后端 Session → 前端 ChatItem */
function mapSession(s: Session): ChatItem {
  return {
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    status: s.aiEnabled ? 'AI已启用' : '在线',
    type: s.type === ChatTypeEnum.GROUP ? 'group' : 'single',
    aiEnabled: s.aiEnabled,
    lastMsg: s.lastMsg,
    time: formatTime(s.time),
    unread: s.unread,
    memberCount: s.type === ChatTypeEnum.GROUP ? 4 : undefined
  }
}

/** 后端 MessageType → 前端 ChatMessage */
function mapMessage(msg: MessageType, currentUid: number): ChatMessage {
  const content = msg.message?.body?.content || ''
  const isSystem = msg.message?.type === MsgEnum.SYSTEM
  const isOwn = msg.fromUser?.uid === currentUid

  return {
    id: msg.message?.id || ++messageIdCounter,
    sender: isSystem ? 'other' : isOwn ? 'user' : 'other',
    name: msg.fromUser?.username || '',
    avatar: msg.fromUser?.avatar || '',
    text: content,
    time: msg.sendTime || formatTime(msg.message?.sendTime || Date.now()),
    system: isSystem
  }
}

/**
 * 对话模块Hook
 * 封装对话相关逻辑，从后端 API 获取真实数据
 */
export function useChat() {
  const userStore = useUserStore()

  /** 对话列表 */
  const chatList = ref<ChatItem[]>([])
  /** 当前选中的对话ID */
  const currentChatId = ref<number>(0)
  /** 消息记录 Map<chatId, ChatMessage[]> */
  const messagesMap = reactive<Record<number, ChatMessage[]>>({})
  /** 群成员 Map<chatId, Member[]> */
  const groupMembersMap = reactive<Record<number, Member[]>>({})

  /** 当前筛选类型 */
  const currentFilter = ref<'all' | 'single' | 'group'>('all')
  /** 搜索关键词 */
  const searchKeyword = ref('')
  /** AI是否启用 */
  const aiEnabled = ref(true)
  /** 当前AI助手 */
  const currentAI = ref<AIAssistantType>('ai-bot')
  /** 是否显示成员侧边栏 */
  const showMemberSidebar = ref(false)
  /** 是否显示创建群组弹窗 */
  const showCreateGroupModal = ref(false)
  /** 是否显示加入群组弹窗 */
  const showJoinGroupModal = ref(false)
  /** 是否显示AI助手栏 */
  const showAIAssistantBar = ref(true)
  /** 可选联系人列表 */
  const availableContacts = ref<Contact[]>([...mockContacts])
  /** 加载状态 */
  const loading = ref(false)

  // 监听WebSocket推送的实时消息
  Mitt.on(MittEnum.SEND_MESSAGE, (msg: any) => {
    if (!msg || !msg.message) return
    const sessionId = msg.message.sessionId
    const chatMsg = mapMessage(msg, currentUid.value)
    if (!messagesMap[sessionId]) {
      messagesMap[sessionId] = []
    }
    // 避免重复添加
    if (!messagesMap[sessionId].some((m) => m.id === chatMsg.id)) {
      messagesMap[sessionId].push(chatMsg)
    }
    // 更新会话列表最后消息
    const chat = chatList.value.find((c) => c.id === sessionId)
    if (chat) {
      chat.lastMsg = chatMsg.text
      chat.time = chatMsg.time
      // 如果不是当前会话，增加未读
      if (currentChatId.value !== sessionId) {
        chat.unread = (chat.unread || 0) + 1
      }
    }
  })

  /** 筛选后的对话列表 */
  const filteredChats = computed<ChatItem[]>(() => {
    const keyword = searchKeyword.value.toLowerCase()
    return chatList.value.filter((c) => {
      if (currentFilter.value === 'single' && c.type !== 'single') return false
      if (currentFilter.value === 'group' && c.type !== 'group') return false
      if (keyword && !c.name.toLowerCase().includes(keyword) && !c.lastMsg.toLowerCase().includes(keyword)) return false
      return true
    })
  })

  /** 当前对话 */
  const currentChat = computed<ChatItem | undefined>(() => {
    return chatList.value.find((c) => c.id === currentChatId.value)
  })

  /** 当前消息列表 */
  const currentMessages = computed<ChatMessage[]>(() => {
    return messagesMap[currentChatId.value] || []
  })

  /** 当前群成员列表 */
  const currentGroupMembers = computed<Member[]>(() => {
    return groupMembersMap[currentChatId.value] || []
  })

  /** 获取当前用户ID */
  const currentUid = computed(() => userStore.userInfo?.uid || 1)

  /**
   * 从后端加载会话列表
   */
  async function fetchChatList() {
    loading.value = true
    try {
      const res = await apis.getSessionList()
      chatList.value = (res.list || []).map(mapSession)
      // 默认选中第一个会话
      if (chatList.value.length > 0 && !currentChatId.value) {
        await selectChat(chatList.value[0].id)
      }
    } catch (err) {
      console.error('加载会话列表失败:', err)
      window.$message?.error('加载会话列表失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 从后端加载历史消息
   * @param chatId 会话ID
   */
  async function fetchMessages(chatId: number) {
    try {
      const res = await apis.getMsgList({ sessionId: chatId, size: 50 })
      messagesMap[chatId] = (res.list || []).map((m: MessageType) => mapMessage(m, currentUid.value))
    } catch (err) {
      console.error('加载消息失败:', err)
      messagesMap[chatId] = []
    }
  }

  /**
   * 从后端加载群成员
   * @param chatId 会话ID
   */
  async function fetchGroupMembers(chatId: number) {
    try {
      const res = await apis.getGroupMembers({ sessionId: chatId })
      groupMembersMap[chatId] = (res.list || []).map((m: any) => ({
        id: m.uid,
        name: m.username,
        avatar: m.avatar,
        role: m.role === 1 ? 'owner' : m.role === 2 ? 'admin' : m.role === 4 ? 'bot' : 'member'
      }))
    } catch (err) {
      console.error('加载群成员失败:', err)
      groupMembersMap[chatId] = []
    }
  }

  /**
   * 选择对话
   * @param id 对话ID
   */
  async function selectChat(id: number) {
    currentChatId.value = id
    const chat = chatList.value.find((c) => c.id === id)
    if (chat) {
      chat.unread = 0
    }
    showMemberSidebar.value = false
    // 加载该会话的消息
    await fetchMessages(id)
    // 如果是群组，加载群成员
    if (chat?.type === 'group') {
      await fetchGroupMembers(id)
    }
    // 标记已读
    apis.markMsgRead({ sessionId: id }).catch(() => {})
  }

  /**
   * 发送消息
   * @param text 消息内容
   */
  async function sendMessage(text: string) {
    const content = text.trim()
    if (!content || !currentChatId.value) return

    const chatId = currentChatId.value
    if (!messagesMap[chatId]) {
      messagesMap[chatId] = []
    }

    try {
      // 调用后端发送消息
      const res = await apis.sendMsg({
        sessionId: chatId,
        msgType: MsgEnum.TEXT,
        body: { content }
      })
      // 将返回的消息添加到列表
      messagesMap[chatId].push(mapMessage(res, currentUid.value))

      // 更新对话列表最后消息
      const chat = chatList.value.find((c) => c.id === chatId)
      if (chat) {
        chat.lastMsg = content
        chat.time = formatTime(Date.now())
      }

      // AI自动回复（仅当启用AI且当前AI不为none时）
      if (aiEnabled.value && currentAI.value !== 'none' && chat?.aiEnabled) {
        setTimeout(() => simulateAIReply(chatId, content), 800)
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      window.$message?.error('发送失败')
    }
  }

  /**
   * 模拟AI回复
   * @param chatId 对话ID
   * @param userText 用户消息
   */
  function simulateAIReply(chatId: number, userText: string) {
    const ai = aiConfigMap[currentAI.value]
    if (!ai) return

    const replies: Record<string, string> = {
      'ai-bot': `收到你的消息："${userText}"。我是AI助手，可以帮你处理各种任务。`,
      claude: `作为Claude智能体，我分析了你的输入："${userText}"。需要我进行代码生成、文本创作或推理分析吗？`,
      hermes: `Hermes已接收消息："${userText}"。我可以为你提供快速的知识问答和对话交互。`,
      'schedule-bot': `我已记录你的请求："${userText}"。需要我帮你添加到日程安排中吗？`,
      'translate-bot': `翻译结果：${userText} (Translation feature simulated)`
    }

    if (!messagesMap[chatId]) {
      messagesMap[chatId] = []
    }
    messagesMap[chatId].push({
      id: ++messageIdCounter,
      sender: 'ai',
      name: ai.name,
      avatar: ai.avatar,
      avatarBg: ai.avatarBg,
      text: replies[currentAI.value] || '收到',
      time: formatTime(Date.now()),
      isAI: true,
      aiType: ai.type
    })

    // 更新对话列表最后消息
    const chat = chatList.value.find((c) => c.id === chatId)
    if (chat) {
      chat.lastMsg = `${ai.name}: ${replies[currentAI.value] || '收到'}`
      chat.time = formatTime(Date.now())
    }
  }

  /**
   * 创建单人对话
   * @param contactId 联系人ID
   */
  async function createSingleChat(contactId: number) {
    const contact = availableContacts.value.find((c) => c.id === contactId)
    if (!contact) return

    // 检查是否已存在
    let chat = chatList.value.find((c) => c.name === contact.name && c.type === 'single')
    if (chat) {
      await selectChat(chat.id)
      window.$message?.success(`已打开与 ${contact.name} 的对话`)
      return
    }

    try {
      // 调用后端创建会话
      const res = await apis.createSession({
        name: contact.name,
        avatar: contact.avatar,
        type: ChatTypeEnum.SINGLE,
        aiEnabled: false
      })
      const newChat = mapSession(res)
      chatList.value.unshift(newChat)
      messagesMap[newChat.id] = []
      await selectChat(newChat.id)
      window.$message?.success(`已开始与 ${contact.name} 的对话`)
    } catch (err) {
      console.error('创建对话失败:', err)
    }
  }

  /**
   * 创建群组
   * @param name 群组名称
   * @param memberIds 成员ID列表
   * @param permissions 权限设置
   */
  async function createGroup(name: string, memberIds: number[], _permissions: GroupPermissions) {
    try {
      // 调用后端创建群组
      const res = await apis.createGroup({
        groupName: name,
        avatar: '👥',
        uidList: memberIds
      })
      // 获取群组会话详情
      const session = await apis.sessionDetail({ id: res.id })
      const newChat = mapSession(session)
      chatList.value.unshift(newChat)
      messagesMap[newChat.id] = []
      await selectChat(newChat.id)
      window.$message?.success(`群组「${name}」创建成功`)
    } catch (err) {
      console.error('创建群组失败:', err)
    }
  }

  /**
   * 切换AI启用状态
   * @param enabled 是否启用
   */
  function toggleAI(enabled: boolean) {
    aiEnabled.value = enabled
    window.$message?.info(enabled ? 'AI助手已启用' : 'AI助手已禁用')
  }

  /**
   * 切换AI助手
   * @param type AI助手类型
   */
  function changeAIAssistant(type: AIAssistantType) {
    currentAI.value = type
    if (type !== 'none') {
      const ai = aiConfigMap[type]
      window.$message?.success(`已切换到 ${ai.name}`)
    }
  }

  /**
   * 处理@提及
   * @param name 被提及的用户名
   * @returns 拼接了@提及的文本
   */
  function handleAtMention(name: string): string {
    return `@${name} `
  }

  /**
   * 邀请成员加入群组
   * @param contactId 联系人ID
   */
  async function inviteMember(contactId: number) {
    const chatId = currentChatId.value
    const contact = availableContacts.value.find((c) => c.id === contactId)
    if (!contact) return

    try {
      await apis.addMember({ sessionId: chatId, uidList: [contactId] })
      // 重新加载群成员
      await fetchGroupMembers(chatId)
      // 添加系统消息
      if (!messagesMap[chatId]) messagesMap[chatId] = []
      messagesMap[chatId].push({
        id: ++messageIdCounter,
        system: true,
        sender: 'other',
        name: '',
        avatar: '',
        text: `${contact.name} 加入了群组`,
        time: ''
      })
      const chat = chatList.value.find((c) => c.id === chatId)
      if (chat) {
        chat.memberCount = (chat.memberCount || 0) + 1
        chat.status = `${chat.memberCount}人在线`
      }
      window.$message?.success(`已邀请 ${contact.name}`)
    } catch (err) {
      console.error('邀请成员失败:', err)
    }
  }

  /**
   * 添加AI助手到群组
   */
  function addGroupAI() {
    const chatId = currentChatId.value
    const chat = chatList.value.find((c) => c.id === chatId)
    if (chat) {
      chat.aiEnabled = true
    }
    window.$message?.success('AI助手已添加到群组')
  }

  /**
   * 退出群组
   */
  async function leaveGroup() {
    const chatId = currentChatId.value
    try {
      await apis.leaveGroup({ sessionId: chatId })
      const idx = chatList.value.findIndex((c) => c.id === chatId)
      if (idx > -1) {
        chatList.value.splice(idx, 1)
      }
      delete messagesMap[chatId]
      delete groupMembersMap[chatId]
      showMemberSidebar.value = false
      if (chatList.value.length > 0) {
        await selectChat(chatList.value[0].id)
      }
      window.$message?.success('已退出群组')
    } catch (err) {
      console.error('退出群组失败:', err)
    }
  }

  /**
   * 清空当前对话消息
   */
  function clearMessages() {
    const chatId = currentChatId.value
    messagesMap[chatId] = []
    window.$message?.success('对话已清空')
  }

  /**
   * 加入群组(通过ID/邀请码)
   * @param code 群组ID或邀请码
   */
  function joinGroup(_code: string) {
    window.$message?.success('已发送加入请求')
  }

  /**
   * 置顶/取消置顶对话
   * @param id 对话ID
   */
  function togglePin(id: number) {
    const chat = chatList.value.find((c) => c.id === id)
    if (chat) {
      chat.pinned = !chat.pinned
      // 置顶的对话排到前面
      if (chat.pinned) {
        const idx = chatList.value.findIndex((c) => c.id === id)
        if (idx > -1) {
          chatList.value.splice(idx, 1)
          chatList.value.unshift(chat)
        }
        window.$message?.success(`已置顶 ${chat.name}`)
      } else {
        window.$message?.info(`已取消置顶 ${chat.name}`)
      }
    }
  }

  /**
   * 消息免打扰
   * @param id 对话ID
   */
  function toggleMute(id: number) {
    const chat = chatList.value.find((c) => c.id === id)
    if (chat) {
      chat.muted = !chat.muted
      if (chat.muted) {
        chat.unread = 0
        window.$message?.success(`已开启 ${chat.name} 的消息免打扰`)
      } else {
        window.$message?.info(`已关闭 ${chat.name} 的消息免打扰`)
      }
    }
  }

  /**
   * 移除会话
   * @param id 对话ID
   */
  async function removeSession(id: number) {
    try {
      await apis.deleteSession({ id })
      const idx = chatList.value.findIndex((c) => c.id === id)
      if (idx > -1) {
        chatList.value.splice(idx, 1)
      }
      delete messagesMap[id]
      delete groupMembersMap[id]
      // 如果移除的是当前会话，切换到第一个
      if (currentChatId.value === id) {
        currentChatId.value = 0
        if (chatList.value.length > 0) {
          await selectChat(chatList.value[0].id)
        }
      }
      window.$message?.success('会话已移除')
    } catch (err) {
      console.error('移除会话失败:', err)
    }
  }

  /**
   * 导出当前对话消息为文本文件
   * @param chatId 对话ID
   */
  function exportChat(chatId: number) {
    const chat = chatList.value.find((c) => c.id === chatId)
    const msgs = messagesMap[chatId] || []
    if (msgs.length === 0) {
      window.$message?.warning('当前对话没有消息可导出')
      return
    }
    const lines = msgs.map((m) => {
      const sender = m.system ? '[系统]' : m.name || '未知'
      return `[${m.time}] ${sender}: ${m.text}`
    })
    const content = `对话: ${chat?.name || '未知'}\n导出时间: ${new Date().toLocaleString()}\n共 ${msgs.length} 条消息\n${'='.repeat(40)}\n${lines.join('\n')}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chat?.name || '对话'}_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
    window.$message?.success(`已导出 ${msgs.length} 条消息`)
  }

  /**
   * 复制当前对话消息到剪贴板
   * @param chatId 对话ID
   */
  async function copyChat(chatId: number) {
    const msgs = messagesMap[chatId] || []
    if (msgs.length === 0) {
      window.$message?.warning('当前对话没有消息可复制')
      return
    }
    const text = msgs.map((m) => {
      const sender = m.system ? '[系统]' : m.name || '未知'
      return `[${m.time}] ${sender}: ${m.text}`
    }).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      window.$message?.success(`已复制 ${msgs.length} 条消息`)
    } catch {
      window.$message?.error('复制失败，请检查浏览器剪贴板权限')
    }
  }

  /**
   * 切换筛选类型并同步当前选中对话
   * 切换后若当前对话不在过滤结果中，自动选中第一个匹配的对话
   * @param type 筛选类型
   */
  async function changeFilter(type: 'all' | 'single' | 'group') {
    currentFilter.value = type
    // 等待响应式更新后检查当前对话是否仍可见
    await nextTick()
    const visible = filteredChats.value.some((c) => c.id === currentChatId.value)
    if (!visible) {
      if (filteredChats.value.length > 0) {
        await selectChat(filteredChats.value[0].id)
      } else {
        currentChatId.value = 0
      }
    }
  }

  return {
    // 状态
    chatList,
    currentChatId,
    messagesMap,
    groupMembersMap,
    currentFilter,
    searchKeyword,
    aiEnabled,
    currentAI,
    showMemberSidebar,
    showCreateGroupModal,
    showJoinGroupModal,
    showAIAssistantBar,
    availableContacts,
    loading,
    // 计算属性
    filteredChats,
    currentChat,
    currentMessages,
    currentGroupMembers,
    // 方法
    fetchChatList,
    fetchMessages,
    selectChat,
    sendMessage,
    createSingleChat,
    createGroup,
    toggleAI,
    changeAIAssistant,
    handleAtMention,
    inviteMember,
    addGroupAI,
    leaveGroup,
    clearMessages,
    joinGroup,
    togglePin,
    toggleMute,
    removeSession,
    exportChat,
    copyChat,
    changeFilter
  }
}
