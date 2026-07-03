import { ref } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum } from '@/enums'
import apis from '@/services/apis'
import type { Workflow } from '@/services/types'

/** 工作流状态 */
export enum WorkflowStatusEnum {
  /** 运行中 */
  RUNNING = 'running',
  /** 待配置 */
  PENDING = 'pending',
  /** 已配置 */
  CONFIGURED = 'configured'
}

/** 工作流项类型 */
export interface WorkflowItem {
  /** 工作流ID */
  id: number
  /** 工作流名称 */
  name: string
  /** 工作流描述 */
  description: string
  /** 工作流图标 */
  icon: string
  /** Dify API Key */
  apiKey: string
  /** 工作流 Endpoint URL */
  endpoint: string
  /** 工作流状态 */
  status: WorkflowStatusEnum
}

/** 后端 Workflow → 本地 WorkflowItem */
function mapWorkflow(w: Workflow): WorkflowItem {
  const hasConfig = !!(w.apiKey && w.endpoint)
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    icon: w.avatar || '🤖',
    apiKey: w.apiKey || '',
    endpoint: w.endpoint || '',
    status: w.enabled ? WorkflowStatusEnum.RUNNING : (hasConfig ? WorkflowStatusEnum.CONFIGURED : WorkflowStatusEnum.PENDING)
  }
}

export const useRobotStore = defineStore(StoresEnum.ROBOT, () => {
  /** 工作流列表 */
  const workflowList = ref<WorkflowItem[]>([])

  /**
   * 从后端加载工作流列表
   */
  async function fetchList() {
    try {
      const res = await apis.getWorkflowList()
      workflowList.value = (res.list || []).map(mapWorkflow)
    } catch (err) {
      console.error('加载工作流列表失败:', err)
    }
  }

  /**
   * 创建工作流
   * @param workflow 工作流信息
   */
  async function createWorkflow(workflow: Omit<WorkflowItem, 'id' | 'status'> & { status?: WorkflowStatusEnum }) {
    try {
      const hasConfig = !!(workflow.apiKey && workflow.endpoint)
      const res = await apis.createWorkflow({
        name: workflow.name,
        description: workflow.description,
        avatar: workflow.icon || '🤖',
        prompt: '',
        apiKey: workflow.apiKey || '',
        endpoint: workflow.endpoint || '',
        modelConfig: { model: 'dify', temperature: 0.7, maxTokens: 2048 },
        enabled: workflow.status === WorkflowStatusEnum.RUNNING
      })
      const item = mapWorkflow(res)
      // 如果创建时未指定状态但已填写配置，标记为已配置
      if (!workflow.status && hasConfig) {
        item.status = WorkflowStatusEnum.CONFIGURED
      }
      workflowList.value.push(item)
      return item
    } catch (err) {
      console.error('创建工作流失败:', err)
      return null
    }
  }

  /**
   * 更新工作流
   * @param id 工作流ID
   * @param data 更新数据
   */
  async function updateWorkflow(id: number, data: Partial<WorkflowItem>) {
    try {
      await apis.updateWorkflow({
        id,
        name: data.name || '',
        description: data.description || '',
        avatar: data.icon || '🤖',
        prompt: '',
        apiKey: data.apiKey || '',
        endpoint: data.endpoint || '',
        modelConfig: { model: 'dify', temperature: 0.7, maxTokens: 2048 },
        enabled: data.status === WorkflowStatusEnum.RUNNING
      })
      const index = workflowList.value.findIndex((w) => w.id === id)
      if (index > -1) {
        workflowList.value[index] = { ...workflowList.value[index], ...data }
      }
    } catch (err) {
      console.error('更新工作流失败:', err)
    }
  }

  /**
   * 删除工作流
   * @param id 工作流ID
   */
  async function deleteWorkflow(id: number) {
    try {
      await apis.deleteWorkflow({ id })
      const index = workflowList.value.findIndex((w) => w.id === id)
      if (index > -1) {
        workflowList.value.splice(index, 1)
      }
    } catch (err) {
      console.error('删除工作流失败:', err)
    }
  }

  /**
   * 启动工作流（标记为运行中）
   * @param id 工作流ID
   */
  function startWorkflow(id: number) {
    const workflow = workflowList.value.find((w) => w.id === id)
    if (workflow) {
      if (workflow.status === WorkflowStatusEnum.PENDING) {
        window.$message.warning('请先配置工作流的 Dify API Key 和 Endpoint')
        return false
      }
      workflow.status = WorkflowStatusEnum.RUNNING
      // 同步到后端
      apis.updateWorkflow({
        id,
        name: workflow.name,
        description: workflow.description,
        avatar: workflow.icon,
        prompt: '',
        apiKey: workflow.apiKey,
        endpoint: workflow.endpoint,
        modelConfig: { model: 'dify', temperature: 0.7, maxTokens: 2048 },
        enabled: true
      }).catch(() => {})
      return true
    }
    return false
  }

  /**
   * 停止工作流（标记为已配置）
   * @param id 工作流ID
   */
  function stopWorkflow(id: number) {
    const workflow = workflowList.value.find((w) => w.id === id)
    if (workflow) {
      workflow.status = WorkflowStatusEnum.CONFIGURED
      // 同步到后端
      apis.updateWorkflow({
        id,
        name: workflow.name,
        description: workflow.description,
        avatar: workflow.icon,
        prompt: '',
        apiKey: workflow.apiKey,
        endpoint: workflow.endpoint,
        modelConfig: { model: 'dify', temperature: 0.7, maxTokens: 2048 },
        enabled: false
      }).catch(() => {})
      return true
    }
    return false
  }

  /**
   * 打开工作流（兼容旧接口，内部调用 startWorkflow）
   */
  function openWorkflow(id: number) {
    return startWorkflow(id)
  }

  /**
   * 根据名称查找工作流
   * @param name 机器人名称
   */
  function findByName(name: string): WorkflowItem | undefined {
    return workflowList.value.find((w) => w.name === name)
  }

  return {
    workflowList,
    fetchList,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    stopWorkflow,
    openWorkflow,
    findByName
  }
})
