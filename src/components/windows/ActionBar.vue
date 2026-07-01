<template>
  <!-- 仅保留置顶按钮，移除窗口控制按钮（由系统标题栏管理） -->
  <div
    data-tauri-drag-region
    class="action-bar flex items-center justify-end select-none w-full h-28px px-12px box-border">
    <div v-if="topWinLabel !== void 0" class="pin-btn" @click="handleAlwaysOnTop" @mousedown.stop>
      <n-popover trigger="hover" placement="bottom">
        <template #trigger>
          <svg
            class="size-14px color-[--action-bar-icon-color] outline-none cursor-pointer"
            viewBox="0 0 24 24"
            fill="none">
            <path
              v-if="alwaysOnTopStatus"
              d="M9 4V2H15V4H18V6H17L16 12L19 15V17H13V22H11V17H5V15L8 12L7 6H6V4H9Z"
              fill="currentColor" />
            <path
              v-else
              d="M9 4V2H15V4H18V6H17L16 12L19 15V17H5V15L8 12L7 6H6V4H9ZM12 12L13 6H11L12 12Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round" />
          </svg>
        </template>
        <span v-if="alwaysOnTopStatus">取消置顶</span>
        <span v-else>置顶</span>
      </n-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentWindowSafe } from '@/utils/tauri'

// 浏览器 / Mock 环境下为 null
const appWindow = getCurrentWindowSafe()

const { topWinLabel } = defineProps<{
  topWinLabel?: string
}>()

/** 窗口是否置顶状态 */
const alwaysOnTopStatus = ref(false)

/** 设置窗口置顶 */
const handleAlwaysOnTop = async () => {
  if (!appWindow) return
  alwaysOnTopStatus.value = !alwaysOnTopStatus.value
  await appWindow.setAlwaysOnTop(alwaysOnTopStatus.value)
}
</script>

<style scoped lang="scss">
.action-bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
}

.pin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: var(--action-bar-icon-hover);
  }
}
</style>
