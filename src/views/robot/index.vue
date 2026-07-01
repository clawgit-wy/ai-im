<template>
  <div class="size-full flex overflow-hidden">
    <!-- 左侧列表栏 -->
    <div class="center-panel flex flex-col border-r-1 border-[--line-color]">
      <!-- 搜索栏 -->
      <div class="search-bar flex items-center gap-8px">
        <n-input v-model:value="searchKeyword" placeholder="搜索机器人..." clearable size="small" class="flex-1" />
      </div>

      <!-- 列表区域 -->
      <n-scrollbar class="flex-1">
        <div
          v-for="(item, index) in filteredWorkflowList"
          :key="item.id"
          :class="['list-item', { active: activeRobotId === item.id }]"
          @click="activeRobotId = item.id">
          <div class="list-avatar flex-center">{{ item.icon }}</div>
          <div class="list-content flex-1 min-w-0">
            <div class="list-title">{{ item.name }}</div>
            <div class="list-subtitle">{{ item.description }}</div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-panel flex-1 flex flex-col min-w-0">
      <!-- 内容头部 -->
      <div class="content-header flex-between-center">
        <div class="content-title-area flex items-center gap-8px">
          <div class="list-avatar flex-center" style="width: 36px; height: 36px">🤖</div>
          <div>
            <div class="content-title">机器人工作流</div>
            <div class="content-subtitle">Dify智能流程</div>
          </div>
        </div>
        <div class="content-actions flex gap-8px">
          <button class="action-btn" @click="openCreateModal" title="创建工作流">+</button>
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
              @click="handleOpenWorkflow(item)">
              <div class="workflow-icon flex-center">{{ item.icon }}</div>
              <div class="workflow-name">{{ item.name }}</div>
              <div class="workflow-desc">{{ item.description }}</div>
              <span :class="['workflow-badge', `workflow-badge--${item.status}`]">
                {{ statusText(item.status) }}
              </span>
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
    </div>

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
/** 当前选中的机器人ID */
const activeRobotId = ref<number>(robotStore.workflowList[0]?.id || 0)

/** 创建弹窗 */
const showCreateModal = ref(false)
/** 配置弹窗 */
const showConfigModal = ref(false)
/** 设置弹窗 */
const showSettingsModal = ref(false)

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

/** 设置表单 */
const settingsForm = reactive({
  apiKey: '',
  endpoint: ''
})

/** 过滤后的工作流列表 */
const filteredWorkflowList = computed(() => {
  if (!searchKeyword.value) return robotStore.workflowList
  return robotStore.workflowList.filter(
    (w) => w.name.includes(searchKeyword.value) || w.description.includes(searchKeyword.value)
  )
})

/** 状态文本 */
function statusText(status: WorkflowStatusEnum) {
  const map: Record<WorkflowStatusEnum, string> = {
    [WorkflowStatusEnum.RUNNING]: '运行中',
    [WorkflowStatusEnum.PENDING]: '待配置',
    [WorkflowStatusEnum.CONFIGURED]: '已配置'
  }
  return map[status]
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

/** 打开工作流 */
function handleOpenWorkflow(item: WorkflowItem) {
  if (item.status === WorkflowStatusEnum.PENDING) {
    // 打开配置弹窗
    configWorkflow.value = item
    configForm.name = item.name
    configForm.description = item.description
    configForm.apiKey = item.apiKey
    configForm.endpoint = item.endpoint
    configForm.icon = item.icon
    showConfigModal.value = true
  } else {
    const success = robotStore.openWorkflow(item.id)
    if (success) {
      window.$message.success(`${item.name} 已启动`)
    }
  }
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
</script>

<style scoped>
.center-panel {
  width: 250px;
  min-width: 160px;
  max-width: 300px;
  background: var(--center-bg-color, #fff);
}

.search-bar {
  padding: 16px 12px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
}

.add-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--n-tertiary-color, #f0f0f0);
  border: none;
  color: var(--n-text-color, #18181c);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.add-btn:hover {
  background: #13987f;
  color: #fff;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  gap: 8px;
  position: relative;
  transition: background 0.2s ease;
}
.list-item:hover {
  background: var(--list-hover-color, rgba(99, 99, 99, 0.1));
}
.list-item.active {
  background: var(--bg-msg-hover, #f3f3f3);
}

.list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00b894, #00cec9);
  font-size: 18px;
  flex-shrink: 0;
}

.list-content {
  min-width: 0;
}
.list-title {
  font-size: 13px;
  color: var(--n-text-color, #18181c);
  margin-bottom: 3px;
}
.list-subtitle {
  font-size: 11px;
  color: var(--n-text-color-3, #5c6166);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right-panel {
  background: var(--right-bg-color, #f1f1f1);
}

.content-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
  background: var(--n-base-color, #fff);
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
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  margin-top: 12px;
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
</style>
