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
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    icon: w.avatar || '🤖',
    apiKey: (w as any).apiKey || '',
    endpoint: (w as any).endpoint || '',
    status: w.enabled ? WorkflowStatusEnum.RUNNING : WorkflowStatusEnum.PENDING
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
      const res = await apis.createWorkflow({
        name: workflow.name,
        description: workflow.description,
        avatar: workflow.icon || '🤖',
        prompt: '',
        modelConfig: { model: 'dify', temperature: 0.7, maxTokens: 2048 },
        enabled: workflow.status === WorkflowStatusEnum.RUNNING
      })
      const item = mapWorkflow(res)
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
   * 打开工作流（标记为运行中）
   * @param id 工作流ID
   */
  function openWorkflow(id: number) {
    const workflow = workflowList.value.find((w) => w.id === id)
    if (workflow) {
      if (workflow.status === WorkflowStatusEnum.PENDING) {
        window.$message.warning('请先配置工作流')
        return false
      }
      workflow.status = WorkflowStatusEnum.RUNNING
      return true
    }
    return false
  }

  return {
    workflowList,
    fetchList,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    openWorkflow
  }
})
