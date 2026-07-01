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

onMounted(() => {
  // 判断localStorage中是否有设置主题
  if (!localStorage.getItem(StoresEnum.SETTING)) {
    settingStore.initTheme(ThemeEnum.OS)
  }
  document.documentElement.dataset.theme = themes.value.content
})

onUnmounted(() => {
  Mitt.off(MittEnum.TOGGLE_THEME)
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
