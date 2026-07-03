<template>
  <div class="size-full flex flex-col overflow-hidden">
    <!-- 内容头部 -->
    <div class="content-header flex-between-center">
      <div class="content-title-area flex items-center gap-8px">
        <div class="header-avatar flex-center">🤖</div>
        <div>
          <div class="content-title">机器人工作流</div>
          <div class="content-subtitle">Dify智能流程</div>
        </div>
      </div>
      <div class="header-actions flex items-center gap-8px">
        <n-input v-model:value="searchKeyword" placeholder="搜索机器人..." clearable size="small" class="search-input" />
        <button class="action-btn" @click="openCreateModal" title="新增机器人">+</button>
        <button class="action-btn" @click="showWorkflowSettings" title="设置">⚙</button>
      </div>
    </div>

    <!-- 工作流卡片网格 -->
    <n-scrollbar class="flex-1">
      <div class="robot-container">
        <div class="robot-workflows">
          <div
            v-for="item in filteredWorkflowList"
            :key="item.id"
            class="workflow-card"
            @click="handleCardClick(item)"
            @contextmenu.prevent="handleContextMenu($event, item)">
            <!-- 状态徽章 -->
            <span :class="['workflow-badge', `workflow-badge--${item.status}`]">
              {{ statusText(item.status) }}
            </span>
            <div class="workflow-icon flex-center">{{ item.icon }}</div>
            <div class="workflow-name">{{ item.name }}</div>
            <div class="workflow-desc">{{ item.description }}</div>
          </div>

          <!-- 创建新工作流卡片 -->
          <div class="workflow-card workflow-card--create" @click="openCreateModal">
            <div class="workflow-icon workflow-icon--create flex-center">+</div>
            <div class="workflow-name">创建新工作流</div>
            <div class="workflow-desc">自定义Dify工作流程</div>
          </div>
        </div>
      </div>
    </n-scrollbar>

    <!-- 右键菜单 -->
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="contextMenuX"
      :y="contextMenuY"
      :options="contextMenuOptions"
      :show="showContextMenu"
      :on-clickoutside="closeContextMenu"
      @select="handleContextMenuSelect" />

    <!-- 创建工作流弹窗 -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="创建工作流"
      style="width: 460px"
      :bordered="false">
      <n-form :model="createForm" label-placement="top" size="small">
        <n-form-item label="工作流名称">
          <n-input v-model:value="createForm.name" placeholder="请输入工作流名称" />
        </n-form-item>
        <n-form-item label="工作流描述">
          <n-input v-model:value="createForm.description" type="textarea" placeholder="请输入工作流描述" :autosize="{ minRows: 3 }" />
        </n-form-item>
        <n-form-item label="Dify API Key">
          <n-input v-model:value="createForm.apiKey" placeholder="请输入 Dify API Key" />
        </n-form-item>
        <n-form-item label="工作流 Endpoint URL">
          <n-input v-model:value="createForm.endpoint" placeholder="请输入 Endpoint URL" />
        </n-form-item>
        <n-form-item label="图标">
          <n-input v-model:value="createForm.icon" placeholder="输入一个 Emoji 作为图标" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreate">创建</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 工作流配置弹窗 -->
    <n-modal
      v-model:show="showConfigModal"
      preset="card"
      :title="`${configWorkflow?.name || '工作流'} 配置`"
      style="width: 460px"
      :bordered="false">
      <n-form :model="configForm" label-placement="top" size="small">
        <n-form-item label="工作流名称">
          <n-input v-model:value="configForm.name" placeholder="请输入工作流名称" />
        </n-form-item>
        <n-form-item label="工作流描述">
          <n-input v-model:value="configForm.description" type="textarea" placeholder="请输入工作流描述" :autosize="{ minRows: 2 }" />
        </n-form-item>
        <n-form-item label="Dify API Key">
          <n-input v-model:value="configForm.apiKey" placeholder="请输入 Dify API Key" />
        </n-form-item>
        <n-form-item label="工作流 Endpoint URL">
          <n-input v-model:value="configForm.endpoint" placeholder="请输入 Endpoint URL" />
        </n-form-item>
        <n-form-item label="图标">
          <n-input v-model:value="configForm.icon" placeholder="输入一个 Emoji 作为图标" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-between">
          <n-button type="error" @click="handleDelete">删除工作流</n-button>
          <div class="flex gap-8px">
            <n-button @click="showConfigModal = false">取消</n-button>
            <n-button type="primary" @click="handleSaveConfig">保存</n-button>
          </div>
        </div>
      </template>
    </n-modal>

    <!-- 工作流设置弹窗 -->
    <n-modal
      v-model:show="showSettingsModal"
      preset="card"
      title="工作流设置"
      style="width: 420px"
      :bordered="false">
      <n-form :model="settingsForm" label-placement="top" size="small">
        <n-form-item label="Dify API Key">
          <n-input v-model:value="settingsForm.apiKey" placeholder="Dify API Key" />
        </n-form-item>
        <n-form-item label="工作流 Endpoint">
          <n-input v-model:value="settingsForm.endpoint" placeholder="Endpoint URL" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <n-button @click="showSettingsModal = false">取消</n-button>
          <n-button type="primary" @click="handleSaveSettings">保存</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 工作流详情弹窗 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="`${detailWorkflow?.name || '工作流'} 详情`"
      style="width: 460px"
      :bordered="false">
      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">名称</span>
          <span class="detail-value">{{ detailWorkflow?.name || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">描述</span>
          <span class="detail-value">{{ detailWorkflow?.description || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">图标</span>
          <span class="detail-value">{{ detailWorkflow?.icon || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">API Key</span>
          <span class="detail-value">{{ maskApiKey(detailWorkflow?.apiKey || '') }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Endpoint</span>
          <span class="detail-value">{{ detailWorkflow?.endpoint || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态</span>
          <span :class="['detail-badge', `workflow-badge--${detailWorkflow?.status}`]">
            {{ statusText(detailWorkflow?.status) }}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间</span>
          <span class="detail-value">—</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <n-button @click="showDetailModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useRobotStore, WorkflowStatusEnum, type WorkflowItem } from '@/stores/robot'

const robotStore = useRobotStore()

// 初始化：从后端加载工作流列表
onMounted(() => {
  robotStore.fetchList()
})

/** 搜索关键词 */
const searchKeyword = ref('')

/** 创建弹窗 */
const showCreateModal = ref(false)
/** 配置弹窗 */
const showConfigModal = ref(false)
/** 设置弹窗 */
const showSettingsModal = ref(false)
/** 详情弹窗 */
const showDetailModal = ref(false)

/** 创建表单 */
const createForm = reactive({
  name: '',
  description: '',
  apiKey: '',
  endpoint: '',
  icon: '🤖'
})

/** 配置中的工作流 */
const configWorkflow = ref<WorkflowItem | null>(null)
/** 配置表单 */
const configForm = reactive({
  name: '',
  description: '',
  apiKey: '',
  endpoint: '',
  icon: ''
})

/** 详情中的工作流 */
const detailWorkflow = ref<WorkflowItem | null>(null)

/** 设置表单 */
const settingsForm = reactive({
  apiKey: '',
  endpoint: ''
})

/** 右键菜单状态 */
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuWorkflow = ref<WorkflowItem | null>(null)

/** 过滤后的工作流列表 */
const filteredWorkflowList = computed(() => {
  if (!searchKeyword.value) return robotStore.workflowList
  return robotStore.workflowList.filter(
    (w) => w.name.includes(searchKeyword.value) || w.description.includes(searchKeyword.value)
  )
})

/** 右键菜单选项 */
const contextMenuOptions = computed(() => {
  if (!contextMenuWorkflow.value) return []
  const isRunning = contextMenuWorkflow.value.status === WorkflowStatusEnum.RUNNING
  return [
    { label: '编辑', key: 'edit', disabled: isRunning },
    { label: isRunning ? '停止' : '启动', key: 'toggle' },
    { label: '详情', key: 'detail' },
    { label: '删除', key: 'delete' }
  ]
})

/** 状态文本 */
function statusText(status?: WorkflowStatusEnum) {
  if (!status) return '—'
  const map: Record<WorkflowStatusEnum, string> = {
    [WorkflowStatusEnum.RUNNING]: '运行中',
    [WorkflowStatusEnum.PENDING]: '待配置',
    [WorkflowStatusEnum.CONFIGURED]: '已配置'
  }
  return map[status]
}

/** API Key 脱敏显示 */
function maskApiKey(key: string) {
  if (!key) return '—'
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

/** 打开创建弹窗 */
function openCreateModal() {
  createForm.name = ''
  createForm.description = ''
  createForm.apiKey = ''
  createForm.endpoint = ''
  createForm.icon = '🤖'
  showCreateModal.value = true
}

/** 处理创建 */
function handleCreate() {
  if (!createForm.name.trim()) {
    window.$message.warning('请输入工作流名称')
    return
  }
  robotStore.createWorkflow({ ...createForm })
  window.$message.success('工作流已创建')
  showCreateModal.value = false
}

/** 卡片点击处理 */
function handleCardClick(item: WorkflowItem) {
  if (item.status === WorkflowStatusEnum.PENDING) {
    openConfigModal(item)
  } else if (item.status === WorkflowStatusEnum.CONFIGURED) {
    const success = robotStore.startWorkflow(item.id)
    if (success) {
      window.$message.success(`${item.name} 已启动`)
    }
  } else if (item.status === WorkflowStatusEnum.RUNNING) {
    window.$message.warning('机器人运行中，请先停止再编辑')
  }
}

/** 打开配置弹窗 */
function openConfigModal(item: WorkflowItem) {
  configWorkflow.value = item
  configForm.name = item.name
  configForm.description = item.description
  configForm.apiKey = item.apiKey
  configForm.endpoint = item.endpoint
  configForm.icon = item.icon
  showConfigModal.value = true
}

/** 保存配置 */
function handleSaveConfig() {
  if (!configWorkflow.value) return
  if (!configForm.name.trim()) {
    window.$message.warning('请输入工作流名称')
    return
  }
  const status = configForm.apiKey && configForm.endpoint ? WorkflowStatusEnum.CONFIGURED : WorkflowStatusEnum.PENDING
  robotStore.updateWorkflow(configWorkflow.value.id, {
    name: configForm.name,
    description: configForm.description,
    apiKey: configForm.apiKey,
    endpoint: configForm.endpoint,
    icon: configForm.icon,
    status
  })
  window.$message.success('工作流已更新')
  showConfigModal.value = false
}

/** 删除工作流 */
function handleDelete() {
  if (!configWorkflow.value) return
  robotStore.deleteWorkflow(configWorkflow.value.id)
  window.$message.success('工作流已删除')
  showConfigModal.value = false
}

/** 显示工作流设置 */
function showWorkflowSettings() {
  settingsForm.apiKey = ''
  settingsForm.endpoint = ''
  showSettingsModal.value = true
}

/** 保存设置 */
function handleSaveSettings() {
  window.$message.success('设置已保存')
  showSettingsModal.value = false
}

/** 右键菜单触发 */
function handleContextMenu(e: MouseEvent, item: WorkflowItem) {
  contextMenuWorkflow.value = item
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  showContextMenu.value = true
}

/** 关闭右键菜单 */
function closeContextMenu() {
  showContextMenu.value = false
}

/** 右键菜单选择处理 */
function handleContextMenuSelect(key: string) {
  const workflow = contextMenuWorkflow.value
  if (!workflow) return
  showContextMenu.value = false

  switch (key) {
    case 'edit':
      if (workflow.status === WorkflowStatusEnum.RUNNING) {
        window.$message.warning('运行中无法编辑')
        return
      }
      openConfigModal(workflow)
      break
    case 'toggle':
      if (workflow.status === WorkflowStatusEnum.RUNNING) {
        robotStore.stopWorkflow(workflow.id)
        window.$message.success(`${workflow.name} 已停止`)
      } else {
        const success = robotStore.startWorkflow(workflow.id)
        if (success) {
          window.$message.success(`${workflow.name} 已启动`)
        }
      }
      break
    case 'detail':
      detailWorkflow.value = workflow
      showDetailModal.value = true
      break
    case 'delete':
      robotStore.deleteWorkflow(workflow.id)
      window.$message.success('工作流已删除')
      break
  }
}
</script>

<style scoped>
.content-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
  background: var(--n-base-color, #fff);
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00b894, #00cec9);
  font-size: 18px;
  flex-shrink: 0;
}

.content-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color, #18181c);
}
.content-subtitle {
  font-size: 12px;
  color: var(--n-text-color-3, #5c6166);
}

.header-actions {
  flex: 1;
  justify-content: flex-end;
}

.search-input {
  width: 240px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--n-tertiary-color, #f0f0f0);
  border: none;
  color: var(--n-text-color, #18181c);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.action-btn:hover {
  background: var(--bg-msg-hover, #f3f3f3);
  color: #13987f;
}

.robot-container {
  padding: 20px;
}

.robot-workflows {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.workflow-card {
  position: relative;
  background: var(--n-base-color, #fff);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--line-color, #e3e3e3);
}
.workflow-card:hover {
  border-color: #13987f;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.workflow-card--create {
  border-style: dashed;
}

.workflow-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00b894, #00cec9);
  font-size: 24px;
  margin-bottom: 12px;
}
.workflow-icon--create {
  background: var(--n-tertiary-color, #f0f0f0);
}

.workflow-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--n-text-color, #18181c);
}
.workflow-desc {
  font-size: 12px;
  color: var(--n-text-color-3, #5c6166);
  line-height: 1.4;
}

.workflow-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
}
.workflow-badge--running {
  background: rgba(24, 160, 88, 0.12);
  color: #18a058;
}
.workflow-badge--pending {
  background: rgba(240, 160, 32, 0.12);
  color: #f0a020;
}
.workflow-badge--configured {
  background: rgba(32, 128, 240, 0.12);
  color: #2080f0;
}

/* 详情弹窗 */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.detail-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--n-text-color-3, #5c6166);
}
.detail-value {
  font-size: 13px;
  color: var(--n-text-color, #18181c);
  word-break: break-all;
}
.detail-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
}
</style>
