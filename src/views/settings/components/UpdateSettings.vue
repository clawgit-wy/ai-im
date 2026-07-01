<template>
  <div class="update-settings">
    <!-- 应用更新 -->
    <div class="settings-section">
      <div class="settings-title">应用更新</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">当前版本</div>
            <div class="settings-desc">v{{ currentVersion }}</div>
          </div>
          <n-button size="small" type="primary" :loading="checking" @click="checkUpdate">
            检查更新
          </n-button>
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">自动更新</div>
            <div class="settings-desc">有新版本时自动下载安装</div>
          </div>
          <n-switch v-model:value="settingStore.autoUpdate" />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">更新通道</div>
            <div class="settings-desc">稳定版或测试版</div>
          </div>
          <n-select
            v-model:value="settingStore.updateChannel"
            :options="channelOptions"
            class="settings-select"
          />
        </div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="version-info">
      智能助手桌面应用 v{{ currentVersion }}<br />
      基于 Tauri 2.0 + Vue 3 构建
    </div>

    <!-- 检查更新弹窗 -->
    <n-modal v-model:show="showUpdateModal" preset="card" title="检查更新" class="update-modal">
      <div class="update-content">
        <p class="update-current">当前版本：v{{ currentVersion }}</p>
        <p class="update-latest">最新版本：v{{ latestVersion }}</p>
        <p class="update-tip" :class="{ 'update-tip--available': hasUpdate }">
          {{ hasUpdate ? '有新版本可用，建议更新。' : '当前已是最新版本。' }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showUpdateModal = false">稍后再说</n-button>
          <n-button v-if="hasUpdate" type="primary" @click="handleUpdate">立即更新</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingStore } from '@/stores/setting'

defineOptions({ name: 'UpdateSettings' })

const settingStore = useSettingStore()

/** 当前版本 */
const currentVersion = ref('1.0.0')
/** 最新版本 */
const latestVersion = ref('1.0.0')
/** 是否有更新 */
const hasUpdate = ref(false)
/** 检查中 */
const checking = ref(false)
/** 更新弹窗 */
const showUpdateModal = ref(false)

/** 更新通道选项 */
const channelOptions = [
  { label: '稳定版', value: 'stable' },
  { label: '测试版', value: 'beta' }
]

/** 检查更新 */
function checkUpdate() {
  checking.value = true
  // 模拟检查更新
  setTimeout(() => {
    checking.value = false
    latestVersion.value = '1.0.1'
    hasUpdate.value = true
    showUpdateModal.value = true
  }, 1500)
}

/** 立即更新 */
function handleUpdate() {
  showUpdateModal.value = false
  window.$message?.success('正在下载更新...')
}
</script>

<style scoped>
.update-settings {
  --us-text-color: #18181c;
  --us-text-color-3: #5c6166;
  --us-base-color: #ffffff;
  --us-line-color: #e3e3e3;
  --us-success-color: #18a058;
}

:global(html[data-theme='dark']) .update-settings {
  --us-text-color: #ffffff;
  --us-text-color-3: #8b93a7;
  --us-base-color: #1b1b1b;
  --us-line-color: #404040;
}

.settings-section {
  margin-bottom: 16px;
}

.settings-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--us-text-color);
}

.settings-group {
  background: var(--us-base-color);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--us-line-color);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--us-line-color);
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
  color: var(--us-text-color);
}

.settings-desc {
  font-size: 11px;
  color: var(--us-text-color-3);
  margin-top: 3px;
}

.settings-select {
  width: 150px;
}

.version-info {
  text-align: center;
  padding: 20px;
  color: var(--us-text-color-3);
  font-size: 12px;
  line-height: 1.8;
}

.update-modal {
  width: 420px;
}

.update-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.update-current,
.update-latest {
  font-size: 14px;
  color: var(--us-text-color);
}

.update-tip {
  font-size: 13px;
  color: var(--us-text-color-3);
  margin-top: 4px;
}

.update-tip--available {
  color: var(--us-success-color);
}
</style>
