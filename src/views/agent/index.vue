<template>
  <div class="size-full flex overflow-hidden">
    <!-- 左侧列表栏 -->
    <div class="center-panel flex flex-col border-r-1 border-[--line-color]">
      <!-- 搜索栏 -->
      <div class="search-bar flex items-center gap-8px">
        <n-input v-model:value="searchKeyword" placeholder="搜索智能体..." clearable size="small" class="flex-1" />
        <button class="add-btn" @click="openCreateModal">+</button>
      </div>

      <!-- 列表区域 -->
      <n-scrollbar class="flex-1">
        <div
          v-for="item in filteredAgentList"
          :key="item.id"
          :class="['list-item', { active: activeAgentId === item.id }]"
          @click="activeAgentId = item.id">
          <div :class="['list-avatar', 'flex-center', `list-avatar--${item.type}`]">{{ item.icon }}</div>
          <div class="list-content flex-1 min-w-0">
            <div class="list-title">{{ item.name }}</div>
            <div class="list-subtitle">{{ item.subtitle || item.description }}</div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-panel flex-1 flex flex-col min-w-0">
      <!-- 内容头部 -->
      <div class="content-header flex-between-center">
        <div class="content-title-area flex items-center gap-8px">
          <div class="list-avatar flex-center" style="width: 36px; height: 36px; background: linear-gradient(135deg, #fd79a8, #e84393)">🧠</div>
          <div>
            <div class="content-title">智能体管理</div>
            <div class="content-subtitle">AI Agent 配置</div>
          </div>
        </div>
        <div class="content-actions flex gap-8px">
          <button class="action-btn" @click="openCreateModal" title="创建智能体">+</button>
          <button class="action-btn" @click="showAgentSettings" title="设置">⚙</button>
        </div>
      </div>

      <!-- 智能体卡片网格 -->
      <n-scrollbar class="flex-1">
        <div class="agent-container">
          <div class="agent-grid">
            <!-- 智能体卡片 -->
            <div v-for="agent in filteredAgentList" :key="agent.id" class="agent-card">
              <!-- 卡片头部 -->
              <div class="agent-header flex items-center gap-12px mb-12px">
                <div :class="['agent-icon', `agent-icon--${agent.type}`]">{{ agent.icon }}</div>
                <div class="agent-info flex-1">
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-model">{{ agent.model }}</div>
                </div>
                <div :class="['agent-status', { 'agent-status--offline': agent.status === AgentStatusEnum.OFFLINE }]">
                  <div class="agent-status-dot"></div>
                  <span>{{ agent.status === AgentStatusEnum.ONLINE ? '在线' : '待配置' }}</span>
                </div>
              </div>

              <!-- 描述 -->
              <div class="agent-desc mb-12px">{{ agent.description }}</div>

              <!-- 标签 -->
              <div class="agent-tags flex flex-wrap gap-8px mb-12px">
                <span v-for="tag in agent.tags" :key="tag" class="n-tag">{{ tag }}</span>
              </div>

              <!-- 操作按钮 -->
              <div class="agent-actions flex gap-8px">
                <button
                  v-if="agent.status === AgentStatusEnum.ONLINE"
                  class="n-btn n-btn--primary-type"
                  @click="startAgentChat(agent.name)">
                  开始对话
                </button>
                <button
                  v-else
                  class="n-btn n-btn--primary-type"
                  @click="openCreateModal">
                  创建配置
                </button>
                <button class="n-btn" @click="openConfigModal(agent)">配置</button>
                <button class="n-btn n-btn--error-type" @click="confirmDelete(agent)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <!-- 创建智能体弹窗 -->
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="创建智能体"
      style="width: 420px"
      :bordered="false">
      <n-form :model="createForm" label-placement="top" size="small">
        <n-form-item label="智能体名称" path="name">
          <n-input v-model:value="createForm.name" placeholder="请输入智能体名称" />
        </n-form-item>
        <n-form-item label="智能体描述" path="description">
          <n-input v-model:value="createForm.description" type="textarea" placeholder="请输入智能体描述" :autosize="{ minRows: 3 }" />
        </n-form-item>
        <n-form-item label="智能体类型" path="type">
          <n-select v-model:value="createForm.type" :options="typeOptions" placeholder="选择类型" />
        </n-form-item>
        <n-form-item label="标签 (逗号分隔)" path="tags">
          <n-input v-model:value="createTagsText" placeholder="例如: 代码生成,文本创作,推理分析" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <n-button @click="showCreateModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreate">创建</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 配置智能体弹窗 -->
    <n-modal
      v-model:show="showConfigModal"
      preset="card"
      :title="`${configAgentName} 配置`"
      style="width: 480px"
      :bordered="false">
      <n-form :model="configForm" label-placement="top" size="small">
        <n-form-item label="API Endpoint" path="endpoint">
          <n-input v-model:value="configForm.endpoint" placeholder="https://api.anthropic.com/v1" />
        </n-form-item>
        <n-form-item label="API Key" path="apiKey">
          <n-input v-model:value="configForm.apiKey" type="password" show-password-on="click" placeholder="sk-..." />
        </n-form-item>
        <n-form-item label="模型" path="model">
          <n-select v-model:value="configForm.model" :options="modelOptions" placeholder="选择模型" />
        </n-form-item>
        <n-form-item label="System Prompt" path="systemPrompt">
          <n-input v-model:value="configForm.systemPrompt" type="textarea" placeholder="你是一个..." :autosize="{ minRows: 4 }" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <n-button @click="showConfigModal = false">取消</n-button>
          <n-button type="primary" @click="handleConfigSave">保存</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 智能体设置弹窗 -->
    <n-modal
      v-model:show="showSettingsModal"
      preset="card"
      title="智能体设置"
      style="width: 380px"
      :bordered="false">
      <n-form :model="settingsForm" label-placement="top" size="small">
        <n-form-item label="默认智能体" path="defaultAgent">
          <n-select v-model:value="settingsForm.defaultAgent" :options="agentOptions" placeholder="选择默认智能体" />
        </n-form-item>
        <n-form-item label="响应模式" path="responseMode">
          <n-select v-model:value="settingsForm.responseMode" :options="responseModeOptions" placeholder="选择响应模式" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <n-button @click="showSettingsModal = false">取消</n-button>
          <n-button type="primary" @click="handleSettingsSave">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useAgentStore, AgentStatusEnum, AgentTypeEnum, type AgentItem } from '@/stores/agent'
import { MittEnum } from '@/enums'
import Mitt from '@/utils/Bus'

const agentStore = useAgentStore()

// 初始化：从后端加载智能体列表
onMounted(() => {
  agentStore.fetchList()
})

/** 搜索关键词 */
const searchKeyword = ref('')
/** 当前选中的智能体ID */
const activeAgentId = ref(1)

/** 弹窗显示状态 */
const showCreateModal = ref(false)
const showConfigModal = ref(false)
const showSettingsModal = ref(false)

/** 配置中的智能体名称 */
const configAgentName = ref('')
/** 配置中的智能体ID */
const configAgentId = ref<number | null>(null)

/** 创建表单 */
const createForm = reactive({
  name: '',
  description: '',
  type: AgentTypeEnum.CUSTOM as AgentTypeEnum
})
const createTagsText = ref('')

/** 配置表单 */
const configForm = reactive({
  endpoint: '',
  apiKey: '',
  model: '',
  systemPrompt: ''
})

/** 设置表单 */
const settingsForm = reactive({
  defaultAgent: '',
  responseMode: 'standard'
})

/** 类型选项 */
const typeOptions = [
  { label: 'Claude', value: AgentTypeEnum.CLAUDE },
  { label: 'Hermes', value: AgentTypeEnum.HERMES },
  { label: '自定义', value: AgentTypeEnum.CUSTOM }
]

/** 模型选项 */
const modelOptions = [
  { label: 'claude-3-opus', value: 'claude-3-opus' },
  { label: 'claude-3-sonnet', value: 'claude-3-sonnet' },
  { label: 'claude-3-haiku', value: 'claude-3-haiku' },
  { label: 'hermes-2-pro', value: 'hermes-2-pro' },
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini' }
]

/** 智能体选项 */
const agentOptions = computed(() =>
  agentStore.agentList.map((a) => ({ label: a.name, value: a.name }))
)

/** 响应模式选项 */
const responseModeOptions = [
  { label: '快速', value: 'fast' },
  { label: '标准', value: 'standard' },
  { label: '详细', value: 'detailed' }
]

/** 过滤后的智能体列表 */
const filteredAgentList = computed(() => {
  if (!searchKeyword.value) return agentStore.agentList
  return agentStore.agentList.filter(
    (a) => a.name.includes(searchKeyword.value) || a.description.includes(searchKeyword.value)
  )
})

/** 打开创建弹窗 */
function openCreateModal() {
  createForm.name = ''
  createForm.description = ''
  createForm.type = AgentTypeEnum.CUSTOM
  createTagsText.value = ''
  showCreateModal.value = true
}

/** 处理创建 */
function handleCreate() {
  if (!createForm.name.trim()) {
    window.$message.warning('请输入智能体名称')
    return
  }
  const tags = createTagsText.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const iconMap = {
    [AgentTypeEnum.CLAUDE]: '🤖',
    [AgentTypeEnum.HERMES]: '🧠',
    [AgentTypeEnum.CUSTOM]: '🎯'
  }

  agentStore.createAgent({
    name: createForm.name,
    description: createForm.description || '用户自定义的智能体',
    icon: iconMap[createForm.type],
    type: createForm.type,
    model: createForm.type === AgentTypeEnum.CLAUDE ? 'claude-3-opus' : createForm.type === AgentTypeEnum.HERMES ? 'hermes-2-pro' : '自定义配置',
    endpoint: '',
    apiKey: '',
    systemPrompt: '',
    tags: tags.length ? tags : ['自定义', '可扩展'],
    subtitle: '用户配置的智能体'
  })
  window.$message.success('智能体已创建')
  showCreateModal.value = false
}

/** 打开配置弹窗 */
function openConfigModal(agent: AgentItem) {
  configAgentId.value = agent.id
  configAgentName.value = agent.name
  configForm.endpoint = agent.endpoint
  configForm.apiKey = agent.apiKey
  configForm.model = agent.model
  configForm.systemPrompt = agent.systemPrompt
  showConfigModal.value = true
}

/** 处理配置保存 */
function handleConfigSave() {
  if (configAgentId.value !== null) {
    const status = configForm.endpoint && configForm.apiKey ? AgentStatusEnum.ONLINE : AgentStatusEnum.OFFLINE
    agentStore.configAgent(configAgentId.value, { ...configForm, status })
    window.$message.success('配置已保存')
    showConfigModal.value = false
  }
}

/** 确认删除 */
function confirmDelete(agent: AgentItem) {
  window.$dialog.warning({
    title: '确认删除',
    content: `确定要删除 ${agent.name} 吗？删除后无法恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      agentStore.deleteAgent(agent.id)
      window.$message.success('智能体已删除')
    }
  })
}

/** 开始对话 */
function startAgentChat(name: string) {
  window.$message.success(`已切换到对话模块，开始与 ${name} 对话`)
  Mitt.emit(MittEnum.SWITCH_MODULE, 'chat')
}

/** 显示智能体设置 */
function showAgentSettings() {
  showSettingsModal.value = true
}

/** 处理设置保存 */
function handleSettingsSave() {
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
  background: linear-gradient(135deg, #fd79a8, #e84393);
  font-size: 18px;
  flex-shrink: 0;
}
.list-avatar--claude {
  background: linear-gradient(135deg, #dfe6e9, #b2bec3);
  color: #333;
}
.list-avatar--hermes {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}
.list-avatar--custom {
  background: linear-gradient(135deg, #fd79a8, #e84393);
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

.agent-container {
  padding: 20px;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.agent-card {
  background: var(--n-base-color, #fff);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--line-color, #e3e3e3);
  position: relative;
  overflow: hidden;
}
.agent-card:hover {
  border-color: #13987f;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

.agent-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}
.agent-icon--claude {
  background: linear-gradient(135deg, #dfe6e9, #b2bec3);
  color: #333;
}
.agent-icon--hermes {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}
.agent-icon--custom {
  background: linear-gradient(135deg, #fd79a8, #e84393);
}

.agent-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--n-text-color, #18181c);
}
.agent-model {
  font-size: 12px;
  color: var(--n-text-color-3, #5c6166);
}

.agent-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--n-success-color, #18a058);
}
.agent-status--offline {
  color: var(--n-text-color-3, #5c6166);
}
.agent-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.agent-desc {
  font-size: 13px;
  color: var(--n-text-color-3, #5c6166);
  line-height: 1.5;
}

.n-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 3px;
  background: var(--n-tertiary-color, #f0f0f0);
  color: var(--n-text-color-2, #333639);
  font-size: 12px;
  line-height: 1.5;
}

.n-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid var(--n-border-color, #efeff5);
  background: var(--n-base-color, #fff);
  color: var(--n-text-color, #18181c);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.n-btn:hover {
  border-color: #13987f;
  color: #13987f;
}
.n-btn--primary-type {
  background: #13987f;
  color: #fff;
  border-color: #13987f;
}
.n-btn--primary-type:hover {
  background: #1ab292;
  border-color: #1ab292;
  color: #fff;
}
.n-btn--error-type {
  background: var(--n-error-color, #d03050);
  color: #fff;
  border-color: var(--n-error-color, #d03050);
}
.n-btn--error-type:hover {
  background: #de5168;
  border-color: #de5168;
  color: #fff;
}
</style>
