<template>
  <div class="appearance-settings">
    <!-- 主题设置 -->
    <div class="settings-section">
      <div class="settings-title">主题设置</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">主题模式</div>
            <div class="settings-desc">浅色、深色或跟随系统</div>
          </div>
          <n-select
            v-model:value="themeMode"
            :options="themeModeOptions"
            class="settings-select"
            @update:value="handleThemeChange"
          />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">主题色</div>
            <div class="settings-desc">应用主色调</div>
          </div>
          <div class="color-picker">
            <div
              v-for="color in themeColors"
              :key="color.value"
              class="color-dot"
              :class="{ active: settingStore.themeColor === color.value }"
              :style="{ background: color.value }"
              @click="handleColorChange(color.value)"
            />
          </div>
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">字体大小</div>
            <div class="settings-desc">界面文字大小</div>
          </div>
          <n-select
            v-model:value="fontSizeValue"
            :options="fontSizeOptions"
            class="settings-select"
            @update:value="handleFontSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- 窗口设置 -->
    <div class="settings-section">
      <div class="settings-title">窗口设置</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">窗口透明度</div>
            <div class="settings-desc">背景透明程度</div>
          </div>
          <n-slider
            v-model:value="settingStore.windowOpacity"
            :min="80"
            :max="100"
            :step="1"
            :format-tooltip="(val: number) => `${val}%`"
            class="settings-slider"
            @update:value="handleOpacityChange"
          />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">窗口阴影</div>
            <div class="settings-desc">是否显示窗口阴影</div>
          </div>
          <n-switch v-model:value="settingStore.windowShadow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingStore } from '@/stores/setting'
import { ThemeEnum } from '@/enums'

defineOptions({ name: 'AppearanceSettings' })

const settingStore = useSettingStore()

/** 主题模式 */
const themeMode = ref<string>(settingStore.themes.pattern || ThemeEnum.OS)
/** 字体大小 */
const fontSizeValue = ref<string>(
  settingStore.fontSize <= 12 ? 'small' : settingStore.fontSize >= 16 ? 'large' : 'medium'
)

/** 主题模式选项 */
const themeModeOptions = [
  { label: '浅色模式', value: ThemeEnum.LIGHT },
  { label: '深色模式', value: ThemeEnum.DARK },
  { label: '跟随系统', value: ThemeEnum.OS }
]

/** 主题色选项 */
const themeColors = [
  { label: '青绿色', value: '#13987f' },
  { label: '紫色', value: '#6c5ce7' },
  { label: '蓝色', value: '#0984e3' },
  { label: '橙色', value: '#f39c12' }
]

/** 字体大小选项 */
const fontSizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]

/** 切换主题模式 */
function handleThemeChange(theme: string) {
  settingStore.toggleTheme(theme)
  const themeName = theme === ThemeEnum.DARK ? '深色' : theme === ThemeEnum.LIGHT ? '浅色' : '跟随系统'
  window.$message?.success(`已切换到${themeName}模式`)
}

/** 切换主题色 */
function handleColorChange(color: string) {
  settingStore.setThemeColor(color)
  window.$message?.success('主题色已更新')
}

/** 切换字体大小 */
function handleFontSizeChange(size: string) {
  const sizeMap: Record<string, number> = { small: 12, medium: 14, large: 16 }
  settingStore.fontSize = sizeMap[size]
  window.$message?.success('字体大小已更新')
}

/** 窗口透明度变化 */
function handleOpacityChange(val: number) {
  document.documentElement.style.setProperty('--window-opacity', `${val}%`)
}
</script>

<style scoped>
.appearance-settings {
  --ap-text-color: #18181c;
  --ap-text-color-3: #5c6166;
  --ap-base-color: #ffffff;
  --ap-line-color: #e3e3e3;
  --ap-primary-color: #13987f;
}

:global(html[data-theme='dark']) .appearance-settings {
  --ap-text-color: #ffffff;
  --ap-text-color-3: #8b93a7;
  --ap-base-color: #1b1b1b;
  --ap-line-color: #404040;
}

.settings-section {
  margin-bottom: 16px;
}

.settings-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--ap-text-color);
}

.settings-group {
  background: var(--ap-base-color);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--ap-line-color);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--ap-line-color);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item-label {
  display: flex;
  flex-direction: column;
}

.settings-label {
  font-size: 13px;
  color: var(--ap-text-color);
}

.settings-desc {
  font-size: 11px;
  color: var(--ap-text-color-3);
  margin-top: 3px;
}

.settings-select {
  width: 150px;
}

.settings-slider {
  width: 120px;
}

/* 主题色选择器 */
.color-picker {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  border-color: var(--ap-text-color);
  box-shadow: 0 0 0 2px var(--ap-base-color), 0 0 0 4px var(--ap-primary-color);
}
</style>
