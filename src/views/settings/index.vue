<template>
  <div class="settings-view">
    <!-- 左侧面板 -->
    <div class="center-panel">
      <div class="list-area">
        <div
          v-for="tab in settingTabs"
          :key="tab.key"
          class="list-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <div class="list-avatar">{{ tab.icon }}</div>
          <div class="list-content">
            <div class="list-title">{{ tab.label }}</div>
            <div class="list-subtitle">{{ tab.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <div class="content-header">
        <div class="content-title-area">
          <div class="header-avatar">⚙️</div>
          <div>
            <div class="content-title">应用设置</div>
            <div class="content-subtitle">个性化配置</div>
          </div>
        </div>
      </div>

      <div class="settings-container">
        <component :is="currentComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AccountSettings from './components/AccountSettings.vue'
import AppearanceSettings from './components/AppearanceSettings.vue'
import NotificationSettings from './components/NotificationSettings.vue'
import UpdateSettings from './components/UpdateSettings.vue'

defineOptions({ name: 'SettingsView' })

type TabKey = 'account' | 'appearance' | 'notification' | 'update'

const settingTabs: { key: TabKey; label: string; desc: string; icon: string }[] = [
  { key: 'account', label: '账户设置', desc: '登录、个人信息', icon: '👤' },
  { key: 'appearance', label: '外观设置', desc: '主题、字体', icon: '🎨' },
  { key: 'notification', label: '通知设置', desc: '消息提醒', icon: '🔔' },
  { key: 'update', label: '应用更新', desc: '版本管理', icon: '🔄' }
]

const activeTab = ref<TabKey>('account')

const currentComponent = computed(() => {
  const map = {
    account: AccountSettings,
    appearance: AppearanceSettings,
    notification: NotificationSettings,
    update: UpdateSettings
  }
  return map[activeTab.value]
})
</script>

<style scoped>
.settings-view {
  display: flex;
  height: 100%;
  overflow: hidden;
  --sv-center-bg: #ffffff;
  --sv-right-bg: #f1f1f1;
  --sv-line-color: #e3e3e3;
  --sv-text-color: #18181c;
  --sv-text-color-3: #5c6166;
  --sv-base-color: #ffffff;
  --sv-list-hover: rgba(99, 99, 99, 0.1);
  --sv-msg-hover: #f3f3f3;
  --sv-primary-color: #13987f;
}

:global(html[data-theme='dark']) .settings-view {
  --sv-center-bg: #1b1b1b;
  --sv-right-bg: #161616;
  --sv-line-color: #404040;
  --sv-text-color: #ffffff;
  --sv-text-color-3: #8b93a7;
  --sv-base-color: #1b1b1b;
  --sv-list-hover: rgba(244, 244, 244, 0.1);
  --sv-msg-hover: #2d2d2d;
}

/* ========== 左侧面板 ========== */
.center-panel {
  width: 250px;
  min-width: 160px;
  max-width: 300px;
  background: var(--sv-center-bg);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--sv-line-color);
}

.list-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  gap: 8px;
  position: relative;
  transition: background 0.2s ease;
}

.list-item:hover {
  background: var(--sv-list-hover);
}

.list-item.active {
  background: var(--sv-msg-hover);
}

.list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--sv-primary-color), #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.list-content {
  flex: 1;
  min-width: 0;
}

.list-title {
  font-size: 13px;
  margin-bottom: 3px;
  color: var(--sv-text-color);
}

.list-subtitle {
  font-size: 11px;
  color: var(--sv-text-color-3);
}

/* ========== 右侧面板 ========== */
.right-panel {
  flex: 1;
  background: var(--sv-right-bg);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--sv-line-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--sv-base-color);
}

.content-title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--sv-primary-color), #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.content-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--sv-text-color);
}

.content-subtitle {
  font-size: 12px;
  color: var(--sv-text-color-3);
}

.settings-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>
