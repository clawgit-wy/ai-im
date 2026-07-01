<template>
  <n-modal
    :show="show"
    preset="card"
    title="创建群组"
    style="width: 480px; max-width: 90vw"
    :bordered="false"
    :mask-closable="false"
    @update:show="handleShowUpdate">
    <!-- 步骤指示器 -->
    <div class="create-steps">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="create-step"
        :class="{ active: currentStep === i + 1, completed: currentStep > i + 1 }">
        <div class="step-number">
          {{ currentStep > i + 1 ? '✓' : i + 1 }}
        </div>
        <span>{{ step }}</span>
      </div>
    </div>

    <!-- 步骤1: 群组命名 -->
    <div v-if="currentStep === 1" class="step-content">
      <label class="step-label">群组名称</label>
      <n-input
        v-model:value="groupName"
        placeholder="请输入群组名称"
        maxlength="20"
        show-count
        autofocus />
    </div>

    <!-- 步骤2: 选择成员 -->
    <div v-if="currentStep === 2" class="step-content">
      <label class="step-label">选择成员 ({{ selectedMembers.length }}人已选)</label>
      <div class="member-select-list">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="member-select-item"
          :class="{ selected: selectedMembers.includes(contact.id) }"
          @click="toggleMember(contact.id)">
          <div class="member-checkbox"></div>
          <div class="member-avatar" :style="{ background: contact.avatarBg }">
            {{ contact.avatar }}
          </div>
          <div class="member-info">
            <div class="member-name">{{ contact.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 步骤3: 权限设置 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="permission-item">
        <div>
          <div class="permission-label">允许成员邀请他人</div>
          <div class="permission-desc">群组成员可以邀请新成员加入</div>
        </div>
        <n-switch v-model:value="permissions.allowInvite" />
      </div>
      <div class="permission-item">
        <div>
          <div class="permission-label">允许成员修改群名</div>
          <div class="permission-desc">普通成员可以修改群组名称</div>
        </div>
        <n-switch v-model:value="permissions.allowModifyName" />
      </div>
      <div class="permission-item">
        <div>
          <div class="permission-label">允许添加机器人/智能体</div>
          <div class="permission-desc">成员可以在群组中添加AI助手</div>
        </div>
        <n-switch v-model:value="permissions.allowAddBot" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex-between-center">
        <n-button quaternary @click="handleCancel">取消</n-button>
        <div class="flex gap-8px">
          <n-button v-if="currentStep > 1" @click="prevStep">上一步</n-button>
          <n-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</n-button>
          <n-button v-if="currentStep === 3" type="primary" @click="handleCreate">创建群组</n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import type { Contact, GroupPermissions } from '@/hooks/useChat'

defineOptions({ name: 'CreateGroupModal' })

const props = defineProps<{
  /** 是否显示 */
  show: boolean
  /** 可选联系人列表 */
  contacts: Contact[]
}>()

const emit = defineEmits<{
  'update:show': [val: boolean]
  create: [name: string, members: number[], permissions: GroupPermissions]
}>()

const steps = ['群组命名', '选择成员', '权限设置']
const currentStep = ref(1)
const groupName = ref('')
const selectedMembers = ref<number[]>([])
const permissions = reactive<GroupPermissions>({
  allowInvite: true,
  allowModifyName: false,
  allowAddBot: true
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      currentStep.value = 1
      groupName.value = ''
      selectedMembers.value = []
      permissions.allowInvite = true
      permissions.allowModifyName = false
      permissions.allowAddBot = true
    }
  }
)

function handleShowUpdate(val: boolean) {
  emit('update:show', val)
}

function toggleMember(id: number) {
  const idx = selectedMembers.value.indexOf(id)
  if (idx > -1) {
    selectedMembers.value.splice(idx, 1)
  } else {
    selectedMembers.value.push(id)
  }
}

function nextStep() {
  if (currentStep.value === 1 && !groupName.value.trim()) {
    window.$message?.warning('请输入群组名称')
    return
  }
  if (currentStep.value === 2 && selectedMembers.value.length === 0) {
    window.$message?.warning('请至少选择一名成员')
    return
  }
  currentStep.value++
}

function prevStep() {
  currentStep.value--
}

function handleCancel() {
  emit('update:show', false)
}

function handleCreate() {
  emit('create', groupName.value.trim(), [...selectedMembers.value], { ...permissions })
  emit('update:show', false)
}
</script>

<style scoped>
.create-steps {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e3e3e3;
}

:global(html[data-theme='dark']) .create-steps {
  border-color: #404040;
}

.create-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #5c6166;
}

:global(html[data-theme='dark']) .create-step {
  color: #8b93a7;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #5c6166;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:global(html[data-theme='dark']) .step-number {
  background: #2d2d2d;
  color: #8b93a7;
}

.create-step.active .step-number {
  background: #13987f;
  color: #fff;
}

.create-step.completed .step-number {
  background: #18a058;
  color: #fff;
}

.create-step.active {
  color: #18181c;
}

:global(html[data-theme='dark']) .create-step.active {
  color: #ffffff;
}

.step-content {
  min-height: 200px;
}

.step-label {
  font-size: 13px;
  display: block;
  margin-bottom: 6px;
  color: #18181c;
}

:global(html[data-theme='dark']) .step-label {
  color: #ffffff;
}

.member-select-list {
  max-height: 240px;
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

.member-select-item.selected {
  background: rgba(19, 152, 127, 0.08);
}

.member-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 2px solid #d5d5d5;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

:global(html[data-theme='dark']) .member-checkbox {
  border-color: #575757;
}

.member-select-item.selected .member-checkbox {
  background: #13987f;
  border-color: #13987f;
}

.member-select-item.selected .member-checkbox::after {
  content: '✓';
  color: #fff;
  font-size: 11px;
  font-weight: bold;
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

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e3e3e3;
}

:global(html[data-theme='dark']) .permission-item {
  border-color: #404040;
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-label {
  font-size: 13px;
  color: #18181c;
}

:global(html[data-theme='dark']) .permission-label {
  color: #ffffff;
}

.permission-desc {
  font-size: 11px;
  color: #5c6166;
  margin-top: 2px;
}

:global(html[data-theme='dark']) .permission-desc {
  color: #8b93a7;
}
</style>
