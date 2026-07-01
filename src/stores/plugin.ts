import { ref } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum } from '@/enums'
import apis from '@/services/apis'
import type { Plugin } from '@/services/types'

/** 插件项(扩展分类字段) */
export type PluginItem = Plugin & {
  /** 插件分类 */
  category: string
}

/** 后端 Plugin → 本地 PluginItem */
function mapPlugin(p: Plugin): PluginItem {
  const categories = ['实用工具', '开发工具', '编辑工具', '设计工具', '系统工具']
  const category = categories[p.id % categories.length] || '实用工具'
  return {
    ...p,
    downloadUrl: p.downloadUrl || '',
    config: p.config || {},
    category
  }
}

export const usePluginStore = defineStore(StoresEnum.PLUGIN, () => {
  /** 插件列表 */
  const pluginList = ref<PluginItem[]>([])

  /**
   * 从后端加载插件列表
   */
  async function fetchList() {
    try {
      const res = await apis.getPluginList()
      pluginList.value = (res.list || []).map(mapPlugin)
    } catch (err) {
      console.error('加载插件列表失败:', err)
    }
  }

  /**
   * 安装插件
   * @param pluginId 插件ID
   */
  async function installPlugin(pluginId: number) {
    try {
      const res = await apis.installPlugin({ pluginId })
      const item = mapPlugin(res)
      const index = pluginList.value.findIndex((p: PluginItem) => p.id === item.id)
      if (index === -1) {
        pluginList.value.push(item)
      } else {
        pluginList.value[index] = item
      }
      window.$message?.success(`插件 ${item.name} 安装成功`)
    } catch (err) {
      console.error('安装插件失败:', err)
    }
  }

  /**
   * 卸载插件
   * @param id 插件ID
   */
  async function uninstallPlugin(id: number) {
    try {
      await apis.uninstallPlugin({ id })
      const index = pluginList.value.findIndex((p: PluginItem) => p.id === id)
      if (index !== -1) {
        pluginList.value.splice(index, 1)
      }
      window.$message?.success('插件已卸载')
    } catch (err) {
      console.error('卸载插件失败:', err)
    }
  }

  /**
   * 启用/禁用插件
   * @param id 插件ID
   * @param enabled 是否启用
   */
  async function togglePlugin(id: number, enabled: boolean) {
    try {
      await apis.togglePlugin({ id, enabled })
      const plugin = pluginList.value.find((p: PluginItem) => p.id === id)
      if (plugin) {
        plugin.enabled = enabled
      }
    } catch (err) {
      console.error('切换插件状态失败:', err)
    }
  }

  /**
   * 更新插件
   * @param id 插件ID
   * @param data 更新数据
   */
  async function updatePlugin(id: number, data: Partial<PluginItem>) {
    try {
      await apis.updatePlugin({
        id,
        name: data.name || '',
        config: data.config || {},
        enabled: data.enabled ?? true
      })
      const index = pluginList.value.findIndex((p: PluginItem) => p.id === id)
      if (index !== -1) {
        pluginList.value[index] = { ...pluginList.value[index], ...data }
      }
    } catch (err) {
      console.error('更新插件失败:', err)
    }
  }

  return {
    pluginList,
    fetchList,
    installPlugin,
    uninstallPlugin,
    togglePlugin,
    updatePlugin
  }
})
