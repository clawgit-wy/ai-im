<template>
  <div class="notification-settings">
    <!-- 消息通知 -->
    <div class="settings-section">
      <div class="settings-title">消息通知</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">消息提醒</div>
            <div class="settings-desc">收到新消息时提醒</div>
          </div>
          <n-switch v-model:value="settingStore.notifyEnabled" />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">日程提醒</div>
            <div class="settings-desc">日程开始前提醒</div>
          </div>
          <n-switch v-model:value="settingStore.scheduleNotify" />
        </div>
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">声音提醒</div>
            <div class="settings-desc">播放提醒声音</div>
          </div>
          <n-switch v-model:value="settingStore.soundEnabled" />
        </div>
      </div>
    </div>

    <!-- 提醒时间 -->
    <div class="settings-section">
      <div class="settings-title">提醒时间</div>
      <div class="settings-group">
        <div class="settings-item">
          <div class="settings-item-label">
            <div class="settings-label">日程提前提醒</div>
            <div class="settings-desc">会议开始前多久提醒</div>
          </div>
          <n-select
            v-model:value="settingStore.scheduleRemindTime"
            :options="remindTimeOptions"
            class="settings-select"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingStore } from '@/stores/setting'

defineOptions({ name: 'NotificationSettings' })

const settingStore = useSettingStore()

/** 提醒时间选项 */
const remindTimeOptions = [
  { label: '5分钟', value: 5 },
  { label: '10分钟', value: 10 },
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 }
]
</script>

<style scoped>
.notification-settings {
  --ns-text-color: #18181c;
  --ns-text-color-3: #5c6166;
  --ns-base-color: #ffffff;
  --ns-line-color: #e3e3e3;
}

:global(html[data-theme='dark']) .notification-settings {
  --ns-text-color: #ffffff;
  --ns-text-color-3: #8b93a7;
  --ns-base-color: #1b1b1b;
  --ns-line-color: #404040;
}

.settings-section {
  margin-bottom: 16px;
}

.settings-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--ns-text-color);
}

.settings-group {
  background: var(--ns-base-color);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid var(--ns-line-color);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--ns-line-color);
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
  color: var(--ns-text-color);
}

.settings-desc {
  font-size: 11px;
  color: var(--ns-text-color-3);
  margin-top: 3px;
}

.settings-select {
  width: 150px;
}
</style>
