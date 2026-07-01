<template>
  <div class="chat-page">
    <!-- ========== 左侧对话列表栏 ========== -->
    <div class="center-panel" :class="{ 'hidden-mobile': isMobileListHidden }">
      <div class="resize-handle" @mousedown="startResize" />
      <ChatList
        :list="filteredChats"
        :current-id="currentChatId"
        :current-filter="currentFilter"
        @select="handleSelectChat"
        @filter="handleFilter"
        @search="handleSearch"
        @add="showCreateMenu" />
    </div>

    <!-- ========== 右侧聊天区域 ========== -->
    <template v-if="currentChat">
      <div class="right-panel">
        <!-- 对话头部 -->
        <div class="content-header">
          <div class="content-title-area">
            <div class="header-avatar" :style="headerAvatarStyle">{{ currentChat.avatar }}</div>
            <div>
              <div class="content-title">{{ currentChat.name }}</div>
              <div class="content-subtitle">{{ currentChat.status }}</div>
            </div>
          </div>
          <div class="content-actions">
            <n-tooltip trigger="hover">
              <template #trigger>
                <button class="action-btn" @click="showAIAssistantBar = !showAIAssistantBar">🤖</button>
              </template>
              AI助手
            </n-tooltip>
            <n-tooltip v-if="currentChat.type === 'group'" trigger="hover">
              <template #trigger>
                <button class="action-btn" @click="showMemberSidebar = !showMemberSidebar">👥</button>
              </template>
              成员管理
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <button class="action-btn" @click="handleSettings">⚙️</button>
              </template>
              设置
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <button class="action-btn" @click="handleClearChat">🗑️</button>
              </template>
              清空
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <button class="action-btn" @click="showMoreOptions = true">⋯</button>
              </template>
              更多
            </n-tooltip>
          </div>
        </div>

        <!-- AI助手选择栏 -->
        <div v-if="showAIAssistantBar" class="ai-assistant-bar">
          <span class="ai-assistant-label">🤖 AI助手:</span>
          <n-select
            v-model:value="currentAIValue"
            :options="aiAssistantOptions"
            size="small"
            class="ai-assistant-select" />
          <div class="ai-toggle">
            <span>启用</span>
            <n-switch :value="aiEnabled" size="small" @update:value="toggleAI" />
          </div>
        </div>

        <!-- 消息区 -->
        <ChatMessages :messages="currentMessages" />

        <!-- 输入区 -->
        <ChatInput
          ref="chatInputRef"
          :is-group="currentChat.type === 'group'"
          @send="handleSend"
          @at-mention="handleAtMention" />

        <!-- 成员管理侧边栏 -->
        <MemberSidebar
          v-model:show="showMemberSidebar"
          :members="currentGroupMembers"
          :ai-enabled="currentChat.aiEnabled"
          :available-contacts="availableContacts"
          @invite="inviteMember"
          @add-ai="addGroupAI"
          @manage-ai="handleManageAI"
          @group-settings="handleGroupSettings"
          @leave-group="handleLeaveGroup" />
      </div>
    </template>

    <!-- 空状态 -->
    <template v-else>
      <div class="right-panel empty-chat">
        <span class="text-64px opacity-20">💬</span>
        <p class="text-14px opacity-40 mt-16px">选择一个对话开始聊天</p>
      </div>
    </template>

    <!-- ========== 创建对话菜单弹窗 ========== -->
    <n-modal v-model:show="showCreateMenuModal" preset="card" title="新建对话" style="width: 380px; max-width: 90vw" :bordered="false">
      <div class="chat-type-selector">
        <div class="chat-type-card" @click="startCreateChat('single')">
          <div class="chat-type-icon">👤</div>
          <div class="chat-type-name">单人对话</div>
          <div class="chat-type-desc">与联系人发起私聊</div>
        </div>
        <div class="chat-type-card" @click="startCreateChat('group')">
          <div class="chat-type-icon">👥</div>
          <div class="chat-type-name">群组对话</div>
          <div class="chat-type-desc">创建多人群组聊天</div>
        </div>
      </div>
      <n-button block @click="showJoinGroupModal = true">通过ID/邀请码加入群组</n-button>
    </n-modal>

    <!-- ========== 选择联系人弹窗(单人对话) ========== -->
    <n-modal v-model:show="showSelectContactModal" preset="card" title="选择联系人" style="width: 380px; max-width: 90vw" :bordered="false">
      <div class="member-select-list">
        <div
          v-for="contact in availableContacts"
          :key="contact.id"
          class="member-select-item"
          @click="handleCreateSingleChat(contact.id)">
          <div class="select-avatar" :style="{ background: contact.avatarBg }">{{ contact.avatar }}</div>
          <div class="member-info">
            <div class="member-name">{{ contact.name }}</div>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- ========== 创建群组弹窗 ========== -->
    <CreateGroupModal
      v-model:show="showCreateGroupModal"
      :contacts="availableContacts"
      @create="handleCreateGroup" />

    <!-- ========== 加入群组弹窗 ========== -->
    <n-modal v-model:show="showJoinGroupModal" preset="card" title="加入群组" style="width: 380px; max-width: 90vw" :bordered="false">
      <n-input v-model:value="joinGroupCode" placeholder="请输入群组ID或邀请码" />
      <p class="join-hint">输入好友分享的群组ID或邀请码加入群组</p>
      <template #footer>
        <div class="flex-end-center">
          <n-button type="primary" @click="handleJoinGroup">加入</n-button>
        </div>
      </template>
    </n-modal>

    <!-- ========== @提及成员弹窗 ========== -->
    <n-modal v-model:show="showAtMentionModal" preset="card" title="@提及成员" style="width: 340px; max-width: 90vw" :bordered="false">
      <div class="member-select-list">
        <div
          v-for="member in currentGroupMembers"
          :key="member.id"
          class="member-select-item"
          @click="insertMention(member.name)">
          <div class="select-avatar" :style="memberStyle(member)">{{ member.avatar }}</div>
          <div class="member-info">
            <div class="member-name">{{ member.name }}</div>
          </div>
        </div>
        <div class="member-select-item" @click="insertMention('所有人')">
          <div class="select-avatar" style="background: #f0a020">📢</div>
          <div class="member-info">
            <div class="member-name">所有人</div>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- ========== 更多选项弹窗 ========== -->
    <n-modal v-model:show="showMoreOptions" preset="card" title="更多选项" style="width: 300px; max-width: 90vw" :bordered="false">
      <div class="more-options">
        <div class="more-option-item" @click="handleMoreAction('pin')">
          <span>📍</span><span>标记重要</span>
        </div>
        <div class="more-option-item" @click="handleMoreAction('export')">
          <span>📤</span><span>导出对话</span>
        </div>
        <div class="more-option-item" @click="handleMoreAction('copy')">
          <span>📋</span><span>复制对话</span>
        </div>
        <div v-if="currentChat?.type === 'group'" class="more-divider" />
        <div v-if="currentChat?.type === 'group'" class="more-option-item" @click="handleMoreAction('join')">
          <span>➕</span><span>加入群组</span>
        </div>
      </div>
    </n-modal>

    <!-- ========== 清空对话确认弹窗 ========== -->
    <n-modal v-model:show="showClearConfirm" preset="dialog" title="清空对话" type="warning" positive-text="清空" negative-text="取消" @positive-click="confirmClearChat">
      <p>确定要清空当前对话记录吗？清空后无法恢复。</p>
    </n-modal>

    <!-- ========== 退出群组确认弹窗 ========== -->
    <n-modal v-model:show="showLeaveConfirm" preset="dialog" title="退出群组" type="error" positive-text="退出" negative-text="取消" @positive-click="confirmLeaveGroup">
      <p>确定要退出此群组吗？退出后将不再接收群组消息。</p>
    </n-modal>

    <!-- ========== 移除会话确认弹窗 ========== -->
    <n-modal v-model:show="showRemoveConfirm" preset="dialog" title="移除会话" type="warning" positive-text="移除" negative-text="取消" @positive-click="confirmRemoveSession">
      <p>确定要移除该会话吗？移除后将清空聊天记录。</p>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useChat, aiAssistantOptions, type AIAssistantType, type Member } from '@/hooks/useChat'
import ChatList from './components/ChatList.vue'
import ChatMessages from './components/ChatMessages.vue'
import ChatInput from './components/ChatInput.vue'
import CreateGroupModal from './components/CreateGroupModal.vue'
import MemberSidebar from './components/MemberSidebar.vue'

defineOptions({ name: 'ChatPage' })

const {
  currentChatId,
  currentFilter,
  searchKeyword,
  aiEnabled,
  currentAI,
  showMemberSidebar,
  showCreateGroupModal,
  showJoinGroupModal,
  showAIAssistantBar,
  availableContacts,
  filteredChats,
  currentChat,
  currentMessages,
  currentGroupMembers,
  fetchChatList,
  selectChat,
  sendMessage,
  createSingleChat,
  createGroup,
  toggleAI,
  changeAIAssistant,
  inviteMember,
  addGroupAI,
  leaveGroup,
  clearMessages,
  joinGroup,
  togglePin,
  toggleMute,
  removeSession
} = useChat()

// 初始化：从后端加载会话列表
onMounted(() => {
  fetchChatList()
})

/** 组件引用 */
const chatInputRef = ref<InstanceType<typeof ChatInput>>()

/** 弹窗状态 */
const showCreateMenuModal = ref(false)
const showSelectContactModal = ref(false)
const showAtMentionModal = ref(false)
const showMoreOptions = ref(false)
const showClearConfirm = ref(false)
const showLeaveConfirm = ref(false)
const joinGroupCode = ref('')
const isMobileListHidden = ref(false)

/** AI助手相关双向绑定 */
const currentAIValue = computed({
  get: () => currentAI.value,
  set: (val: AIAssistantType) => changeAIAssistant(val)
})

/** 头部头像样式 */
const headerAvatarStyle = computed(() => {
  if (!currentChat.value) return {}
  const style: Record<string, string> = {}
  if (currentChat.value.avatarBg) style.background = currentChat.value.avatarBg
  if (currentChat.value.avatarColor) style.color = currentChat.value.avatarColor
  return style
})

/** 拖拽调整宽度 */
const panelWidth = ref(250)
let isResizing = false

function startResize() {
  isResizing = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!isResizing) return
  const width = e.clientX
  if (width >= 160 && width <= 300) {
    panelWidth.value = width
  }
}

function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
})

/** 选择对话 */
function handleSelectChat(id: number) {
  selectChat(id)
  // 移动端隐藏列表
  if (window.innerWidth <= 768) {
    isMobileListHidden.value = true
  }
}

/** 筛选 */
function handleFilter(type: 'all' | 'single' | 'group') {
  currentFilter.value = type
}

/** 搜索 */
function handleSearch(keyword: string) {
  searchKeyword.value = keyword
}

/** 发送消息 */
function handleSend(text: string) {
  sendMessage(text)
}

/** 显示创建对话菜单 */
function showCreateMenu() {
  showCreateMenuModal.value = true
}

/** 开始创建对话 */
function startCreateChat(type: 'single' | 'group') {
  showCreateMenuModal.value = false
  if (type === 'single') {
    showSelectContactModal.value = true
  } else {
    showCreateGroupModal.value = true
  }
}

/** 创建单人对话 */
function handleCreateSingleChat(contactId: number) {
  showSelectContactModal.value = false
  createSingleChat(contactId)
}

/** 创建群组 */
function handleCreateGroup(name: string, members: number[], permissions: any) {
  createGroup(name, members, permissions)
}

/** 加入群组 */
function handleJoinGroup() {
  if (joinGroupCode.value.trim()) {
    joinGroup(joinGroupCode.value.trim())
    joinGroupCode.value = ''
  }
  showJoinGroupModal.value = false
}

/** @提及 */
function handleAtMention() {
  if (currentChat.value?.type === 'group') {
    showAtMentionModal.value = true
  } else {
    window.$message?.warning('仅群组对话支持@提及')
  }
}

/** 插入@提及 */
function insertMention(name: string) {
  chatInputRef.value?.insertMention(name)
  showAtMentionModal.value = false
}

/** 清空对话 */
function handleClearChat() {
  showClearConfirm.value = true
}

function confirmClearChat() {
  clearMessages()
}

/** 设置 */
function handleSettings() {
  window.$message?.info('对话设置')
}

/** 群组设置 */
function handleGroupSettings() {
  window.$message?.info('群组设置')
}

/** 管理群组AI */
function handleManageAI() {
  window.$message?.info('管理群组AI')
}

/** 退出群组 */
function handleLeaveGroup() {
  showLeaveConfirm.value = true
}

function confirmLeaveGroup() {
  leaveGroup()
}

/** 更多选项操作 */
function handleMoreAction(action: string) {
  showMoreOptions.value = false
  if (action === 'join') {
    showJoinGroupModal.value = true
  } else {
    const messages: Record<string, string> = {
      pin: '标记重要',
      export: '导出对话',
      copy: '复制对话'
    }
    window.$message?.info(messages[action] || '')
  }
}

/** 右键菜单操作 */
const showRemoveConfirm = ref(false)
const pendingRemoveId = ref<number>(0)

function handleContextAction(action: string, item: any) {
  if (action === 'pin') {
    togglePin(item.id)
  } else if (action === 'mute') {
    toggleMute(item.id)
  } else if (action === 'remove') {
    pendingRemoveId.value = item.id
    showRemoveConfirm.value = true
  }
}

function confirmRemoveSession() {
  removeSession(pendingRemoveId.value)
  pendingRemoveId.value = 0
}

/** 成员头像样式 */
function memberStyle(member: Member) {
  return member.avatarBg ? { background: member.avatarBg } : {}
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* ========== 左侧列表栏 ========== */
.center-panel {
  width: v-bind(panelWidth + 'px');
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e3e3e3;
  min-width: 160px;
  max-width: 300px;
  position: relative;
  flex-shrink: 0;
  transition: width 0.1s ease;
}

:global(html[data-theme='dark']) .center-panel {
  background: #1b1b1b;
  border-color: #404040;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  transition: background 0.2s ease;
  z-index: 5;
}

.resize-handle:hover {
  background: #13987f;
}

/* ========== 右侧聊天区 ========== */
.right-panel {
  flex: 1;
  background: #f1f1f1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

:global(html[data-theme='dark']) .right-panel {
  background: #161616;
}

.empty-chat {
  align-items: center;
  justify-content: center;
}

/* ========== 头部 ========== */
.content-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

:global(html[data-theme='dark']) .content-header {
  background: #1b1b1b;
  border-color: #404040;
}

.content-title-area {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #13987f, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.content-title {
  font-size: 16px;
  font-weight: 500;
  color: #18181c;
}

:global(html[data-theme='dark']) .content-title {
  color: #ffffff;
}

.content-subtitle {
  font-size: 12px;
  color: #5c6166;
  display: flex;
  align-items: center;
  gap: 4px;
}

:global(html[data-theme='dark']) .content-subtitle {
  color: #8b93a7;
}

.content-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f0f0f0;
  border: none;
  color: #18181c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
}

:global(html[data-theme='dark']) .action-btn {
  background: #2d2d2d;
  color: #ffffff;
}

.action-btn:hover {
  background: #f3f3f3;
  color: #13987f;
}

:global(html[data-theme='dark']) .action-btn:hover {
  background: #353535;
}

/* ========== AI助手选择栏 ========== */
.ai-assistant-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #f7f7f7;
  border-bottom: 1px solid #e3e3e3;
}

:global(html[data-theme='dark']) .ai-assistant-bar {
  background: #252525;
  border-color: #404040;
}

.ai-assistant-label {
  font-size: 12px;
  color: #5c6166;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

:global(html[data-theme='dark']) .ai-assistant-label {
  color: #8b93a7;
}

.ai-assistant-select {
  flex: 1;
  max-width: 240px;
}

.ai-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5c6166;
  flex-shrink: 0;
}

:global(html[data-theme='dark']) .ai-toggle {
  color: #8b93a7;
}

/* ========== 弹窗内通用样式 ========== */
.chat-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.chat-type-card {
  padding: 16px;
  border: 2px solid #e3e3e3;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

:global(html[data-theme='dark']) .chat-type-card {
  border-color: #404040;
}

.chat-type-card:hover {
  border-color: #13987f;
}

.chat-type-card.selected {
  border-color: #13987f;
  background: rgba(19, 152, 127, 0.04);
}

.chat-type-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.chat-type-name {
  font-size: 14px;
  font-weight: 500;
  color: #18181c;
}

:global(html[data-theme='dark']) .chat-type-name {
  color: #ffffff;
}

.chat-type-desc {
  font-size: 11px;
  color: #5c6166;
  margin-top: 4px;
}

:global(html[data-theme='dark']) .chat-type-desc {
  color: #8b93a7;
}

.member-select-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e3e3e3;
  border-radius: 6px;
  padding: 4px;
}

:global(html[data-theme='dark']) .member-select-list {
  border-color: #404040;
}

.member-select-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.member-select-item:hover {
  background: rgba(99, 99, 99, 0.1);
}

.select-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #13987f, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 13px;
  color: #18181c;
}

:global(html[data-theme='dark']) .member-name {
  color: #ffffff;
}

.join-hint {
  font-size: 12px;
  color: #5c6166;
  margin-top: 8px;
}

:global(html[data-theme='dark']) .join-hint {
  color: #8b93a7;
}

.more-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.more-option-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #18181c;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  transition: background 0.2s ease;
}

:global(html[data-theme='dark']) .more-option-item {
  color: #ffffff;
}

.more-option-item:hover {
  background: rgba(99, 99, 99, 0.1);
}

.more-divider {
  height: 1px;
  background: #e3e3e3;
  margin: 4px 0;
}

:global(html[data-theme='dark']) .more-divider {
  background: #404040;
}

/* ========== 响应式布局 ========== */
@media (max-width: 768px) {
  .center-panel {
    width: 100% !important;
    max-width: none;
    position: absolute;
    z-index: 20;
    height: 100%;
    transition: transform 0.3s ease;
  }

  .center-panel.hidden-mobile {
    transform: translateX(-100%);
  }

  .right-panel {
    width: 100%;
  }

  .content-header {
    padding: 12px;
  }

  .ai-assistant-bar {
    padding: 8px 12px;
    flex-wrap: wrap;
  }

  .chat-type-selector {
    grid-template-columns: 1fr;
  }
}
</style>
