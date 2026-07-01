<template>
  <transition name="slide">
    <div v-if="show" class="member-sidebar">
      <!-- 头部 -->
      <div class="sidebar-header">
        <span class="sidebar-title">群组成员</span>
        <n-button quaternary circle size="small" @click="emit('update:show', false)">
          <span class="text-16px">×</span>
        </n-button>
      </div>

      <!-- 内容区 -->
      <div class="sidebar-body">
        <!-- 成员列表 -->
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            <span>群组成员 ({{ members.length }})</span>
            <n-button size="tiny" type="primary" @click="showInviteModal = true">邀请</n-button>
          </div>
          <div
            v-for="member in members"
            :key="member.id"
            class="member-item"
            @click="handleMemberAction(member)">
            <div class="member-avatar" :style="avatarStyle(member)">
              {{ member.avatar }}
            </div>
            <div class="member-info">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-role">{{ roleNames[member.role] }}</div>
            </div>
            <span class="member-role-badge" :class="member.role">
              {{ roleNames[member.role] }}
            </span>
          </div>
        </div>

        <!-- AI集成 -->
        <div class="sidebar-section">
          <div class="sidebar-section-title">AI集成</div>
          <div v-if="aiEnabled" class="member-item">
            <div class="member-avatar" style="background: linear-gradient(135deg, #00b894, #00cec9)">🤖</div>
            <div class="member-info">
              <div class="member-name">AI助手已启用</div>
              <div class="member-role">机器人</div>
            </div>
            <n-button size="tiny" @click="emit('manage-ai')">管理</n-button>
          </div>
          <div v-else>
            <n-button size="small" type="primary" block @click="emit('add-ai')">添加AI助手</n-button>
          </div>
        </div>

        <!-- 群组操作 -->
        <div class="sidebar-section">
          <div class="sidebar-section-title">群组操作</div>
          <n-button block style="margin-bottom: 8px" @click="emit('group-settings')">群组设置</n-button>
          <n-button block type="error" @click="emit('leave-group')">退出群组</n-button>
        </div>
      </div>

      <!-- 邀请成员弹窗 -->
      <n-modal
        v-model:show="showInviteModal"
        preset="card"
        title="邀请成员"
        style="width: 380px; max-width: 90vw"
        :bordered="false">
        <div class="member-select-list">
          <template v-if="invitableContacts.length">
            <div
              v-for="contact in invitableContacts"
              :key="contact.id"
              class="member-select-item"
              @click="handleInvite(contact.id)">
              <div class="member-avatar" :style="{ background: contact.avatarBg }">
                {{ contact.avatar }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ contact.name }}</div>
              </div>
              <n-button size="tiny" type="primary">邀请</n-button>
            </div>
          </template>
          <p v-else class="empty-invite">所有联系人已在群组中</p>
        </div>
      </n-modal>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Member, Contact } from '@/hooks/useChat'

defineOptions({ name: 'MemberSidebar' })

const props = defineProps<{
  /** 是否显示 */
  show: boolean
  /** 成员列表 */
  members: Member[]
  /** 是否启用AI */
  aiEnabled: boolean
  /** 可选联系人列表 */
  availableContacts: Contact[]
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  invite: [contactId: number]
  'add-ai': []
  'manage-ai': []
  'group-settings': []
  'leave-group': []
}>()

const showInviteModal = ref(false)

const roleNames: Record<Member['role'], string> = {
  owner: '群主',
  admin: '管理员',
  member: '成员',
  bot: '机器人'
}

/** 可邀请的联系人(排除已在群组中的) */
const invitableContacts = computed<Contact[]>(() => {
  const memberIds = props.members.map((m) => m.id)
  return props.availableContacts.filter((c) => !memberIds.includes(c.id))
})

function avatarStyle(member: Member) {
  return member.avatarBg ? { background: member.avatarBg } : {}
}

function handleMemberAction(member: Member) {
  window.$message?.info(`查看 ${member.name} 详情`)
}

function handleInvite(contactId: number) {
  emit('invite', contactId)
  showInviteModal.value = false
}
</script>

<style scoped>
.member-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: #ffffff;
  border-left: 1px solid #e3e3e3;
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.06);
}

:global(html[data-theme='dark']) .member-sidebar {
  background: #1b1b1b;
  border-color: #404040;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:global(html[data-theme='dark']) .sidebar-header {
  border-color: #404040;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 500;
  color: #18181c;
}

:global(html[data-theme='dark']) .sidebar-title {
  color: #ffffff;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-section {
  margin-bottom: 16px;
}

.sidebar-section-title {
  font-size: 12px;
  color: #5c6166;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:global(html[data-theme='dark']) .sidebar-section-title {
  color: #8b93a7;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.member-item:hover {
  background: rgba(99, 99, 99, 0.1);
}

.member-avatar {
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

.member-role {
  font-size: 11px;
  color: #5c6166;
}

:global(html[data-theme='dark']) .member-role {
  color: #8b93a7;
}

.member-role-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.member-role-badge.owner {
  background: rgba(240, 160, 32, 0.12);
  color: #f0a020;
}

.member-role-badge.admin {
  background: rgba(32, 128, 240, 0.12);
  color: #2080f0;
}

.member-role-badge.member {
  background: rgba(99, 99, 99, 0.12);
  color: #5c6166;
}

.member-role-badge.bot {
  background: rgba(0, 184, 148, 0.12);
  color: #00b894;
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

.empty-invite {
  text-align: center;
  padding: 20px;
  color: #5c6166;
  font-size: 13px;
}

:global(html[data-theme='dark']) .empty-invite {
  color: #8b93a7;
}

@media (max-width: 768px) {
  .member-sidebar {
    width: 100%;
  }
}
</style>
