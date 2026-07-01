import { ref } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum, OnlineEnum } from '@/enums'

export const useGlobalStore = defineStore(StoresEnum.GLOBAL, () => {
  /** 当前模块名称 */
  const currentModule = ref<string>('chat')
  /** 未读消息总数 */
  const unreadCount = ref<number>(0)
  /** 在线状态 */
  const onlineStatus = ref<OnlineEnum>(OnlineEnum.ONLINE)

  /**
   * 设置当前模块
   * @param module 模块名称
   */
  function setCurrentModule(module: string) {
    currentModule.value = module
  }

  /**
   * 更新未读消息数
   * @param count 未读数
   */
  function setUnreadCount(count: number) {
    unreadCount.value = count
  }

  /**
   * 增加未读消息数
   */
  function addUnreadCount() {
    unreadCount.value++
  }

  /**
   * 清零未读消息数
   */
  function clearUnreadCount() {
    unreadCount.value = 0
  }

  /**
   * 设置在线状态
   * @param status 在线状态
   */
  function setOnlineStatus(status: OnlineEnum) {
    onlineStatus.value = status
  }

  return {
    currentModule,
    unreadCount,
    onlineStatus,
    setCurrentModule,
    setUnreadCount,
    addUnreadCount,
    clearUnreadCount,
    setOnlineStatus
  }
})
