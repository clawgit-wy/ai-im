<template>
  <div class="plugin-view">
    <!-- 左侧面板 -->
    <div class="center-panel">
      <div class="search-bar">
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索插件..."
          size="small"
          clearable
          class="search-input"
        />
      </div>

      <div class="list-area">
        <div
          v-for="plugin in filteredPluginList"
          :key="plugin.id"
          class="list-item"
          :class="{ active: plugin.id === activePluginId }"
          @click="activePluginId = plugin.id"
        >
          <div class="list-avatar">{{ plugin.icon }}</div>
          <div class="list-content">
            <div class="list-title">{{ plugin.name }}</div>
            <div class="list-subtitle">{{ plugin.category }}</div>
          </div>
        </div>
        <n-empty v-if="filteredPluginList.length === 0" description="暂无插件" class="py-10" />
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <div class="content-header">
        <div class="content-title-area">
          <div class="header-avatar">🔌</div>
          <div>
            <div class="content-title">插件管理</div>
            <div class="content-subtitle">功能扩展</div>
          </div>
        </div>
        <div class="content-actions">
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle size="small" @click="showInstallModal = true">
                <span class="text-base">+</span>
              </n-button>
            </template>
            安装插件
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button quaternary circle size="small" @click="showSettingsModal = true">
                <span class="text-base">⚙</span>
              </n-button>
            </template>
            插件设置
          </n-tooltip>
        </div>
      </div>

      <div class="plugin-container">
        <div class="plugin-grid">
          <div
            v-for="plugin in pluginStore.pluginList"
            :key="plugin.id"
            class="plugin-card"
            @click="activePluginId = plugin.id"
          >
            <div class="plugin-header">
              <div class="plugin-icon">{{ plugin.icon }}</div>
              <div class="plugin-info">
                <div class="plugin-name">{{ plugin.name }}</div>
                <n-tag size="small" :bordered="false" round>{{ plugin.category }}</n-tag>
              </div>
            </div>
            <div class="plugin-desc">{{ plugin.description }}</div>
            <div class="plugin-toggle" @click.stop>
              <span class="plugin-status" :class="{ 'plugin-status--active': plugin.enabled }">
                {{ plugin.enabled ? '已启用' : '未启用' }}
              </span>
              <n-switch
                :value="plugin.enabled"
                size="small"
                @update:value="(val: boolean) => handleToggle(plugin.id, val)"
              />
            </div>
          </div>

          <!-- 安装新插件卡片 -->
          <div class="plugin-card plugin-card--install" @click="showInstallModal = true">
            <div class="plugin-header">
              <div class="plugin-icon plugin-icon--add">+</div>
              <div class="plugin-info">
                <div class="plugin-name">安装新插件</div>
                <n-tag size="small" :bordered="false" round>扩展功能</n-tag>
              </div>
            </div>
            <div class="plugin-desc">从插件市场或本地安装新的功能插件。</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安装插件弹窗 -->
    <n-modal v-model:show="showInstallModal" preset="card" title="安装插件" class="plugin-modal">
      <n-form label-placement="top">
        <n-form-item label="安装方式">
          <n-select
            v-model:value="installType"
            :options="installOptions"
            placeholder="选择安装方式"
          />
        </n-form-item>
        <n-form-item v-if="installType === 'market'" label="搜索插件">
          <n-input v-model:value="searchPluginName" placeholder="搜索插件名称" clearable />
        </n-form-item>
        <n-form-item v-else label="插件文件">
          <n-input v-model:value="localFilePath" placeholder="选择本地插件文件" readonly>
            <template #suffix>
              <n-button size="small" @click="selectLocalFile">选择文件</n-button>
            </template>
          </n-input>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showInstallModal = false">取消</n-button>
          <n-button type="primary" @click="handleInstall">安装</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 插件设置弹窗 -->
    <n-modal v-model:show="showSettingsModal" preset="card" title="插件设置" class="plugin-modal">
      <n-space vertical :size="16">
        <div class="settings-modal-item">
          <div>
            <div class="settings-modal-label">插件自动更新</div>
            <div class="settings-modal-desc">有新版本时自动下载更新</div>
          </div>
          <n-switch v-model:value="pluginAutoUpdate" />
        </div>
        <div>
          <div class="settings-modal-label mb-1">插件数据目录</div>
          <n-input value="/plugins" readonly />
        </div>
      </n-space>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="showSettingsModal = false">取消</n-button>
          <n-button type="primary" @click="handleSaveSettings">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePluginStore } from '@/stores/plugin'
import type { PluginItem } from '@/stores/plugin'

defineOptions({ name: 'PluginView' })

const pluginStore = usePluginStore()

// 初始化：从后端加载插件列表
onMounted(() => {
  pluginStore.fetchList()
})

/** 搜索关键词 */
const searchKeyword = ref('')
/** 当前选中的插件ID */
const activePluginId = ref<number>(pluginStore.pluginList[0]?.id ?? 0)
/** 安装弹窗 */
const showInstallModal = ref(false)
/** 设置弹窗 */
const showSettingsModal = ref(false)
/** 安装方式 */
const installType = ref<'market' | 'local'>('market')
/** 搜索插件名称 */
const searchPluginName = ref('')
/** 本地文件路径 */
const localFilePath = ref('')
/** 插件自动更新 */
const pluginAutoUpdate = ref(true)

/** 安装方式选项 */
const installOptions = [
  { label: '从插件市场安装', value: 'market' },
  { label: '从本地文件安装', value: 'local' }
]

/** 过滤后的插件列表 */
const filteredPluginList = computed(() => {
  if (!searchKeyword.value) return pluginStore.pluginList
  const keyword = searchKeyword.value.toLowerCase()
  return pluginStore.pluginList.filter(
    (p: PluginItem) =>
      p.name.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword)
  )
})

/** 切换插件启用状态 */
function handleToggle(id: number, enabled: boolean) {
  pluginStore.togglePlugin(id, enabled)
  const plugin = pluginStore.pluginList.find((p: PluginItem) => p.id === id)
  if (enabled) {
    window.$message?.success(`${plugin?.name} 插件已启用`)
  } else {
    window.$message?.warning(`${plugin?.name} 插件已禁用`)
  }
}

/** 选择本地文件 */
function selectLocalFile() {
  localFilePath.value = '/path/to/plugin.wasm'
  window.$message?.info('请选择本地插件文件')
}

/** 处理安装 */
function handleInstall() {
  showInstallModal.value = false
  window.$message?.success('插件安装中...')
  searchPluginName.value = ''
  localFilePath.value = ''
}

/** 保存插件设置 */
function handleSaveSettings() {
  showSettingsModal.value = false
  window.$message?.success('设置已保存')
}
</script>

<style scoped>
.plugin-view {
  display: flex;
  height: 100%;
  overflow: hidden;
  --pv-center-bg: #ffffff;
  --pv-right-bg: #f1f1f1;
  --pv-line-color: #e3e3e3;
  --pv-text-color: #18181c;
  --pv-text-color-3: #5c6166;
  --pv-base-color: #ffffff;
  --pv-tertiary-color: #f0f0f0;
  --pv-list-hover: rgba(99, 99, 99, 0.1);
  --pv-msg-hover: #f3f3f3;
  --pv-primary-color: #13987f;
  --pv-success-color: #18a058;
  --pv-box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06),
    0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

:global(html[data-theme='dark']) .plugin-view {
  --pv-center-bg: #1b1b1b;
  --pv-right-bg: #161616;
  --pv-line-color: #404040;
  --pv-text-color: #ffffff;
  --pv-text-color-3: #8b93a7;
  --pv-base-color: #1b1b1b;
  --pv-tertiary-color: #2d2d2d;
  --pv-list-hover: rgba(244, 244, 244, 0.1);
  --pv-msg-hover: #2d2d2d;
  --pv-box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.4), 0 3px 6px 0 rgba(0, 0, 0, 0.3),
    0 5px 12px 4px rgba(0, 0, 0, 0.2);
}

/* ========== 左侧面板 ========== */
.center-panel {
  width: 250px;
  min-width: 160px;
  max-width: 300px;
  background: var(--pv-center-bg);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--pv-line-color);
}

.search-bar {
  padding: 16px 12px;
  border-bottom: 1px solid var(--pv-line-color);
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
  background: var(--pv-list-hover);
}

.list-item.active {
  background: var(--pv-msg-hover);
}

.list-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fdcb6e, #f39c12);
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
  color: var(--pv-text-color);
}

.list-subtitle {
  font-size: 11px;
  color: var(--pv-text-color-3);
}

/* ========== 右侧面板 ========== */
.right-panel {
  flex: 1;
  background: var(--pv-right-bg);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--pv-line-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--pv-base-color);
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
  background: linear-gradient(135deg, #fdcb6e, #f39c12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.content-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--pv-text-color);
}

.content-subtitle {
  font-size: 12px;
  color: var(--pv-text-color-3);
}

.content-actions {
  display: flex;
  gap: 8px;
}

.plugin-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.plugin-card {
  background: var(--pv-base-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--pv-line-color);
}

.plugin-card:hover {
  border-color: var(--pv-primary-color);
  box-shadow: var(--pv-box-shadow);
}

.plugin-card--install {
  border-style: dashed;
}

.plugin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.plugin-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fdcb6e, #f39c12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.plugin-icon--add {
  background: var(--pv-tertiary-color);
  font-size: 24px;
  color: var(--pv-text-color-3);
}

.plugin-info {
  flex: 1;
  min-width: 0;
}

.plugin-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--pv-text-color);
  margin-bottom: 4px;
}

.plugin-desc {
  font-size: 12px;
  color: var(--pv-text-color-3);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.plugin-status {
  font-size: 12px;
  color: var(--pv-text-color-3);
}

.plugin-status--active {
  color: var(--pv-success-color);
}

/* ========== 弹窗 ========== */
.plugin-modal {
  width: 420px;
}

.settings-modal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-modal-label {
  font-size: 13px;
  color: var(--pv-text-color);
}

.settings-modal-desc {
  font-size: 11px;
  color: var(--pv-text-color-3);
  margin-top: 3px;
}
</style>
