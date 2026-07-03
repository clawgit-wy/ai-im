<template>
  <NaiveProvider :message-max="3" :notific-max="3">
    <div id="app-container" data-tauri-drag-region>
      <router-view />
    </div>
  </NaiveProvider>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/stores/setting.ts'
import { StoresEnum, ThemeEnum } from '@/enums'
import Mitt from '@/utils/Bus'
import { MittEnum } from '@/enums'
import { isTauri } from '@/utils/tauri'

const settingStore = useSettingStore()
const { themes, windowShadow, fontSize } = storeToRefs(settingStore)

/** 控制窗口阴影 */
watch(
  () => windowShadow.value,
  (val) => {
    document.documentElement.style.setProperty('--shadow-enabled', val ? '0' : '1')
  },
  { immediate: true }
)

/** 控制字体大小 */
watch(
  () => fontSize.value,
  (val) => {
    document.documentElement.style.setProperty('--font-size', `${val}px`)
  },
  { immediate: true }
)

/** 监听主题切换事件 */
Mitt.on(MittEnum.TOGGLE_THEME, (theme: any) => {
  if (theme) {
    settingStore.toggleTheme(theme)
  } else {
    // 切换深色/浅色
    const current = themes.value.content
    settingStore.toggleTheme(current === ThemeEnum.DARK ? ThemeEnum.LIGHT : ThemeEnum.DARK)
  }
})

/**
 * DevTools 快捷键处理
 * - macOS: Cmd+Option+I 或 Cmd+D
 * - Windows/Linux: Ctrl+Shift+I 或 F12
 * 仅在 Tauri 环境下生效
 */
function handleDevtoolsShortcut(e: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().includes('MAC')
  const toggleKey =
    (isMac && (e.metaKey && (e.altKey || e.key === 'd'))) ||
    (!isMac && e.ctrlKey && e.shiftKey && e.key === 'I') ||
    e.key === 'F12'

  if (!toggleKey) return
  if (!isTauri()) return

  e.preventDefault()
  import('@tauri-apps/api/core')
    .then(({ invoke }) => invoke('toggle_devtools'))
    .catch((err) => console.error('[DevTools] 打开失败:', err))
}

onMounted(() => {
  // 判断localStorage中是否有设置主题
  if (!localStorage.getItem(StoresEnum.SETTING)) {
    settingStore.initTheme(ThemeEnum.OS)
  }
  document.documentElement.dataset.theme = themes.value.content
  // 注册 DevTools 快捷键
  window.addEventListener('keydown', handleDevtoolsShortcut)
})

onUnmounted(() => {
  Mitt.off(MittEnum.TOGGLE_THEME)
  window.removeEventListener('keydown', handleDevtoolsShortcut)
})
</script>

<style lang="scss">
#app-container {
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  transition: all 0.9s ease;
  border-radius: 10px;
}
</style>
