<template>
  <div class="chat-list-container">
    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <div
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: currentFilterValue === tab.value }"
        @click="handleFilter(tab.value)">
        {{ tab.label }}
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <n-input
        v-model:value="searchValue"
        placeholder="搜索对话..."
        size="small"
        clearable
        class="search-input">
        <template #prefix>
          <span class="text-12px opacity-60">🔍</span>
        </template>
      </n-input>
      <n-button class="add-btn" quaternary circle size="small" @click="emit('add')">
        <span class="text-18px">+</span>
      </n-button>
    </div>

    <!-- 对话列表 -->
    <div class="list-area">
      <div
        v-for="item in list"
        :key="item.id"
        class="list-item"
        :class="{ active: item.id === currentId }"
        @click="emit('select', item.id)">
        <!-- 头像 -->
        <div
          class="list-avatar"
          :class="{ group: item.type === 'group', 'ai-enabled': item.aiEnabled }"
          :style="avatarStyle(item)">
          {{ item.avatar }}
        </div>

        <!-- 内容 -->
        <div class="list-content">
          <div class="list-title-row">
            <span class="list-title">{{ item.name }}</span>
            <span v-if="item.type === 'group'" class="chat-type-badge group">群</span>
            <span v-if="item.aiEnabled" class="chat-type-badge ai">AI</span>
          </div>
          <div class="list-subtitle">{{ item.lastMsg }}</div>
        </div>

        <!-- 元信息 -->
        <div class="list-meta">
          <span class="list-time">{{ item.time }}</span>
          <n-badge v-if="item.unread > 0" :value="item.unread" :max="99" type="error" />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="list.length === 0" class="empty-state">
        <span class="text-40px opacity-30">📭</span>
        <p class="text-12px opacity-50 mt-8px">暂无对话</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatItem } from '@/hooks/useChat'

type FilterType = 'all' | 'single' | 'group'

defineOptions({ name: 'ChatList' })

const props = defineProps<{
  /** 对话列表数据 */
  list: ChatItem[]
  /** 当前选中的对话ID */
  currentId: number
  /** 当前筛选类型 */
  currentFilter: FilterType
}>()

const emit = defineEmits<{
  select: [id: number]
  filter: [type: FilterType]
  search: [keyword: string]
  add: []
}>()

const filterTabs = [
  { label: '全部', value: 'all' as FilterType },
  { label: '单人', value: 'single' as FilterType },
  { label: '群组', value: 'group' as FilterType }
]

const currentFilterValue = ref<FilterType>(props.currentFilter)
const searchValue = ref('')

watch(() => props.currentFilter, (val) => {
  currentFilterValue.value = val
})

watch(searchValue, (val) => {
  emit('search', val)
})

function handleFilter(type: FilterType) {
  currentFilterValue.value = type
  emit('filter', type)
}

function avatarStyle(item: ChatItem) {
  const style: Record<string, string> = {}
  if (item.avatarBg) {
    style.background = item.avatarBg
  }
  if (item.avatarColor) {
    style.color = item.avatarColor
  }
  return style
}
</script>

<style scoped>
.chat-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-tabs {
  display: flex;
  padding: 8px 12px;
  gap: 4px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
}

.filter-tab {
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #5c6166;
  transition: all 0.2s ease;
  flex: 1;
  text-align: center;
}

.filter-tab:hover {
  background: rgba(99, 99, 99, 0.1);
}

.filter-tab.active {
  background: #13987f;
  color: #fff;
}

.search-bar {
  padding: 12px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.add-btn {
  flex-shrink: 0;
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
  background: rgba(99, 99, 99, 0.1);
}

.list-item.active {
  background: #f3f3f3;
}

:global(html[data-theme='dark']) .list-item.active {
  background: #2d2d2d;
}

.list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #13987f, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  position: relative;
}

.list-avatar.group::after {
  content: '👥';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(html[data-theme='dark']) .list-avatar.group::after {
  background: #1b1b1b;
}

.list-avatar.ai-enabled::before {
  content: '🤖';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(html[data-theme='dark']) .list-avatar.ai-enabled::before {
  background: #1b1b1b;
}

.list-content {
  flex: 1;
  min-width: 0;
}

.list-title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
}

.list-title {
  font-size: 13px;
  color: #18181c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

:global(html[data-theme='dark']) .list-title {
  color: #ffffff;
}

.chat-type-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.chat-type-badge.group {
  background: rgba(32, 128, 240, 0.12);
  color: #2080f0;
}

.chat-type-badge.ai {
  background: rgba(24, 160, 88, 0.12);
  color: #18a058;
}

.list-subtitle {
  font-size: 11px;
  color: #5c6166;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(html[data-theme='dark']) .list-subtitle {
  color: #8b93a7;
}

.list-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.list-time {
  font-size: 10px;
  color: #5c6166;
}

:global(html[data-theme='dark']) .list-time {
  color: #8b93a7;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
</style>
