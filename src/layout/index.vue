<template>
  <div id="layout" class="flex size-full min-w-310px" data-tauri-drag-region>
    <Left />
    <!-- 主内容区：渲染各模块视图（每个视图自带列表+详情双栏布局） -->
    <main
      v-if="!shrinkStatus"
      class="right-panel flex-1 h-full flex flex-col overflow-hidden"
      style="background: var(--right-bg-color)">
      <!-- 窗口操作栏 -->
      <ActionBar />
      <!-- 内容区域：路由视图（padding-top 避免被 ActionBar 遮挡） -->
      <div class="flex-1 overflow-hidden" style="padding-top: 28px">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Left from './left/index.vue'
import ActionBar from '@/components/windows/ActionBar.vue'
import Mitt from '@/utils/Bus'
import { MittEnum } from '@/enums'
import { getCurrentWindowSafe } from '@/utils/tauri'
import { useGlobalStore } from '@/stores/global'
import { useWebSocket } from '@/hooks/useWebSocket'

const globalStore = useGlobalStore()
// 清空未读消息
globalStore.clearUnreadCount()
const shrinkStatus = ref(false)

// 初始化WebSocket连接，接收实时消息推送
const { connect: connectWs } = useWebSocket()

/**
 * event默认如果没有传递值就为true，所以shrinkStatus的值为false就会发生值的变化
 * 因为shrinkStatus的值为false，所以v-if="!shrinkStatus" 否则right组件刚开始渲染的时候不会显示
 * */
Mitt.on(MittEnum.SHRINK_WINDOW, (event: any) => {
  shrinkStatus.value = event as boolean
})

onMounted(async () => {
  // 浏览器 / Mock 环境下无 Tauri 窗口，跳过 show 调用
  const win = getCurrentWindowSafe()
  await win?.show()
  // 建立WebSocket连接
  connectWs()
})
</script>
