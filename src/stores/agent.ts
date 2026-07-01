import { ref } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum } from '@/enums'
import apis from '@/services/apis'
import type { Agent } from '@/services/types'

/** 智能体状态 */
export enum AgentStatusEnum {
  /** 在线 */
  ONLINE = 'online',
  /** 离线 */
  OFFLINE = 'offline',
  /** 待配置 */
  UNCONFIGURED = 'unconfigured'
}

/** 智能体类型 */
export enum AgentTypeEnum {
  /** Claude */
  CLAUDE = 'claude',
  /** Hermes */
  HERMES = 'hermes',
  /** 自定义 */
  CUSTOM = 'custom'
}

/** 智能体项类型 */
export interface AgentItem {
  /** 智能体ID */
  id: number
  /** 智能体名称 */
  name: string
  /** 智能体描述 */
  description: string
  /** 智能体图标 */
  icon: string
  /** 智能体类型 */
  type: AgentTypeEnum
  /** 模型名称 */
  model: string
  /** API Endpoint */
  endpoint: string
  /** API Key */
  apiKey: string
  /** System Prompt */
  systemPrompt: string
  /** 智能体状态 */
  status: AgentStatusEnum
  /** 标签列表 */
  tags: string[]
  /** 副标题(列表显示) */
  subtitle?: string
}

/** 后端 Agent → 本地 AgentItem */
function mapAgent(a: Agent): AgentItem {
  const name = a.name.toLowerCase()
  let type = AgentTypeEnum.CUSTOM
  if (name.includes('claude')) type = AgentTypeEnum.CLAUDE
  else if (name.includes('hermes')) type = AgentTypeEnum.HERMES

  return {
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.avatar || '🤖',
    type,
    model: a.modelConfig?.model || '',
    endpoint: '',
    apiKey: '',
    systemPrompt: a.systemPrompt || '',
    status: a.enabled ? AgentStatusEnum.ONLINE : AgentStatusEnum.UNCONFIGURED,
    tags: [],
    subtitle: a.description.slice(0, 20)
  }
}

export const useAgentStore = defineStore(StoresEnum.AGENT, () => {
  /** 智能体列表 */
  const agentList = ref<AgentItem[]>([])

  /** 模型选项 */
  const modelOptions = [
    { label: 'claude-3-opus', value: 'claude-3-opus' },
    { label: 'claude-3-sonnet', value: 'claude-3-sonnet' },
    { label: 'claude-3-haiku', value: 'claude-3-haiku' },
    { label: 'hermes-2-pro', value: 'hermes-2-pro' },
    { label: 'hermes-2-theta', value: 'hermes-2-theta' },
    { label: 'gpt-4o', value: 'gpt-4o' },
    { label: 'gpt-4-turbo', value: 'gpt-4-turbo' }
  ]

  /**
   * 从后端加载智能体列表
   */
  async function fetchList() {
    try {
      const res = await apis.getAgentList()
      agentList.value = (res.list || []).map(mapAgent)
    } catch (err) {
      console.error('加载智能体列表失败:', err)
    }
  }

  /**
   * 创建智能体
   * @param agent 智能体信息
   */
  async function createAgent(agent: Omit<AgentItem, 'id' | 'status'> & { status?: AgentStatusEnum }) {
    try {
      const res = await apis.createAgent({
        name: agent.name,
        description: agent.description,
        avatar: agent.icon || '🤖',
        systemPrompt: agent.systemPrompt || '',
        pluginIds: [],
        modelConfig: { model: agent.model || 'gpt-4', temperature: 0.7, maxTokens: 4096 },
        enabled: agent.status === AgentStatusEnum.ONLINE
      })
      const item = mapAgent(res)
      agentList.value.push(item)
      return item
    } catch (err) {
      console.error('创建智能体失败:', err)
      return null
    }
  }

  /**
   * 更新智能体
   * @param id 智能体ID
   * @param data 更新数据
   */
  async function updateAgent(id: number, data: Partial<AgentItem>) {
    try {
      await apis.updateAgent({
        id,
        name: data.name || '',
        description: data.description || '',
        avatar: data.icon || '🤖',
        systemPrompt: data.systemPrompt || '',
        pluginIds: [],
        modelConfig: { model: data.model || 'gpt-4', temperature: 0.7, maxTokens: 4096 },
        enabled: data.status === AgentStatusEnum.ONLINE
      })
      const index = agentList.value.findIndex((a) => a.id === id)
      if (index > -1) {
        agentList.value[index] = { ...agentList.value[index], ...data }
      }
    } catch (err) {
      console.error('更新智能体失败:', err)
    }
  }

  /**
   * 删除智能体
   * @param id 智能体ID
   */
  async function deleteAgent(id: number) {
    try {
      await apis.deleteAgent({ id })
      const index = agentList.value.findIndex((a) => a.id === id)
      if (index > -1) {
        agentList.value.splice(index, 1)
      }
    } catch (err) {
      console.error('删除智能体失败:', err)
    }
  }

  /**
   * 配置智能体
   * @param id 智能体ID
   * @param config 配置信息
   */
  function configAgent(id: number, config: Partial<Pick<AgentItem, 'endpoint' | 'apiKey' | 'model' | 'systemPrompt' | 'status'>>) {
    const agent = agentList.value.find((a) => a.id === id)
    if (agent) {
      Object.assign(agent, config)
      if (config.endpoint && config.apiKey && !config.status) {
        agent.status = AgentStatusEnum.ONLINE
      }
    }
  }

  return {
    agentList,
    modelOptions,
    fetchList,
    createAgent,
    updateAgent,
    deleteAgent,
    configAgent
  }
})
