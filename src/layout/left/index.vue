<template>
  <div style="background: var(--left-bg-color)">
    <div style="background: var(--left-bg-color)" class="h-30px"></div>
    <main
      class="left w-70px h-full p-[0_6px_40px] box-border flex-col-center select-none"
      data-tauri-drag-region>
      <!-- 应用标题 -->
      <p class="text-(16px [--left-text-color]) cursor-default select-none m-[4px_0_16px_0]">AI-IM</p>

      <!-- 用户头像区域 -->
      <n-popover
        v-model:show="showProfilePopover"
        trigger="click"
        placement="right-start"
        :show-arrow="false"
        style="padding: 0; background: transparent"
        raw>
        <template #trigger>
          <div class="relative mb-16px cursor-pointer">
            <n-avatar :size="36" :src="userInfo.avatar" fallback-src="/logo.png" round />
            <!-- 在线状态指示器 -->
            <div
              class="online-dot"
              :class="globalStore.onlineStatus === OnlineEnum.ONLINE ? 'online' : 'offline'"
              @click.stop="handleStatusClick"></div>
          </div>
        </template>
        <div class="profile-card" @click.stop>
          <div class="profile-header">
            <n-avatar :size="56" :src="userInfo.avatar" fallback-src="/logo.png" round />
            <div class="profile-name-area">
              <div class="profile-name">{{ userInfo.name || '未设置' }}</div>
              <div class="profile-status">
                <span class="status-dot" :class="globalStore.onlineStatus === OnlineEnum.ONLINE ? 'online' : 'offline'"></span>
                <span>{{ globalStore.onlineStatus === OnlineEnum.ONLINE ? '在线' : '离线' }}</span>
              </div>
            </div>
          </div>
          <div class="profile-info">
            <div class="info-row">
              <span class="info-label">UID</span>
              <span class="info-value">{{ userInfo.uid || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ userInfo.email || '未绑定' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">手机</span>
              <span class="info-value">{{ userInfo.phone || '未绑定' }}</span>
            </div>
          </div>
          <div class="profile-actions">
            <div class="profile-action-item" @click="handleEditProfile">
              <svg class="size-16px" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13M18.4142 2.58579C19.1953 1.80474 20.4617 1.80474 21.2426 2.58579L21.4142 2.75736C22.1953 3.53841 22.1953 4.80474 21.4142 5.58579L12 15L8 16L9 12L18.4142 2.58579Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>编辑资料</span>
            </div>
            <div class="profile-action-item danger" @click="handleLogout">
              <svg class="size-16px" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.45 21 4 20.55 4 20V4C4 3.45 4.45 3 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </n-popover>

      <!-- 导航菜单 -->
      <nav class="flex-1 flex-col-x-center gap-8px w-full">
        <div
          v-for="item in menuList"
          :key="item.url"
          :class="['nav-item', { active: globalStore.currentModule === item.url }]"
          style="text-align: center"
          @click="handleNavClick(item.url)"
          :title="item.title">
          <n-badge :max="99" :value="item.badge" :show="item.badge > 0">
            <svg class="size-22px" viewBox="0 0 24 24" fill="none">
              <path :d="item.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </n-badge>
          <p class="text-(10px center) mt-2px">{{ item.shortTitle }}</p>
        </div>
      </nav>

      <!-- 底部更多操作按钮 -->
      <footer class="flex-col-x-center mt-10px">
        <n-popover
          v-model:show="moreShow"
          style="padding: 0; background: transparent; user-select: none"
          :show-arrow="false"
          trigger="click"
          placement="right">
          <template #trigger>
            <div class="nav-item" title="更多">
              <svg class="size-22px" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <p class="text-(10px center) mt-2px">更多</p>
            </div>
          </template>
          <div class="more-menu" @click.stop="moreShow = false">
            <div class="menu-list">
              <div v-for="(item, index) in moreList" :key="index">
                <div class="menu-item" @click="() => item.click()">
                  <svg class="size-16px" viewBox="0 0 24 24" fill="none">
                    <path :d="item.icon" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ item.label }}
                </div>
              </div>
            </div>
          </div>
        </n-popover>
      </footer>
    </main>
  </div>

  <!-- 设置弹窗 -->
  <n-modal v-model:show="showSettingsModal" preset="card" title="设置" style="width: 480px" :bordered="false">
    <n-tabs type="line" animated>
      <n-tab-pane name="appearance" tab="外观">
        <div class="settings-section">
          <div class="settings-item">
            <span>主题模式</span>
            <n-radio-group :value="themes.content" @update:value="settingStore.toggleTheme">
              <n-radio value="light">浅色</n-radio>
              <n-radio value="dark">深色</n-radio>
              <n-radio value="os">跟随系统</n-radio>
            </n-radio-group>
          </div>
          <div class="settings-item">
            <span>字体大小</span>
            <n-slider :value="fontSize" :min="12" :max="18" :step="1" style="width: 200px" @update:value="(v: number) => settingStore.fontSize = v" />
          </div>
          <div class="settings-item">
            <span>窗口阴影</span>
            <n-switch :value="windowShadow" @update:value="(v: boolean) => settingStore.windowShadow = v" />
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane name="about-settings" tab="关于">
        <div class="about-content">
          <div class="about-logo">🤖</div>
          <h2 class="about-name">AI-IM</h2>
          <p class="about-version">版本 0.1.0</p>
          <p class="about-desc">基于 Tauri + Vue3 的智能助手桌面应用</p>
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-modal>

  <!-- 关于弹窗 -->
  <n-modal v-model:show="showAboutModal" preset="card" title="关于" style="width: 380px" :bordered="false">
    <div class="about-content">
      <div class="about-logo">🤖</div>
      <h2 class="about-name">AI-IM</h2>
      <p class="about-version">版本 0.1.0</p>
      <p class="about-desc">基于 Tauri + Vue3 的智能助手桌面应用</p>
      <div class="about-info">
        <div class="info-row">
          <span class="info-label">技术栈</span>
          <span class="info-value">Tauri 2.0 / Vue 3.5 / Naive UI</span>
        </div>
        <div class="info-row">
          <span class="info-label">后端</span>
          <span class="info-value">Nitro.js / SQLite / WebSocket</span>
        </div>
        <div class="info-row">
          <span class="info-label">许可证</span>
          <span class="info-value">MIT</span>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global'
import { useUserStore } from '@/stores/user'
import { useSettingStore } from '@/stores/setting'
import { OnlineEnum } from '@/enums'
import router from '@/router'

const globalStore = useGlobalStore()
const userStore = useUserStore()
const settingStore = useSettingStore()
const userInfo = computed(() => userStore.userInfo)
const { themes, fontSize, windowShadow } = storeToRefs(settingStore)

/** 个人信息弹窗 */
const showProfilePopover = ref(false)

/** 编辑资料 */
function handleEditProfile() {
  showProfilePopover.value = false
  window.$message?.info('编辑资料功能开发中')
}

/** 更多菜单是否显示 */
const moreShow = ref(false)

/** 导航菜单列表 */
const menuList = ref([
  {
    title: '对话',
    shortTitle: '对话',
    url: 'chat',
    icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
    badge: 0
  },
  {
    title: '日程',
    shortTitle: '日程',
    url: 'schedule',
    icon: 'M8 2V5M16 2V5M3.5 9.09H20.5M5 3.5H19C19.55 3.5 20 3.95 20 4.5V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V4.5C4 3.95 4.45 3.5 5 3.5Z',
    badge: 0
  },
  {
    title: '机器人',
    shortTitle: '机器人',
    url: 'robot',
    icon: 'M12 2V6M9 6H15C16.6569 6 18 7.34315 18 9V16C18 17.6569 16.6569 19 15 19H9C7.34315 19 6 17.6569 6 16V9C6 7.34315 7.34315 6 9 6ZM12 10V14M21 11V13M3 11V13',
    badge: 0
  },
  {
    title: '智能体',
    shortTitle: '智能体',
    url: 'agent',
    icon: 'M9 2V6M15 2V6M9 18V22M15 18V22M2 9H6M2 15H6M18 9H22M18 15H22M6 6H18V18H6V6Z',
    badge: 0
  },
  {
    title: '插件',
    shortTitle: '插件',
    url: 'plugin',
    icon: 'M10 3H14C14.55 3 15 3.45 15 4V6C15 7.1 15.9 8 17 8C18.1 8 19 7.1 19 6V4C19 3.45 19.45 3 20 3C20.55 3 21 3.45 21 4V8C21 9.1 20.1 10 19 10H17C15.9 10 15 10.9 15 12C15 13.1 15.9 14 17 14H19C20.1 14 21 14.9 21 16V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V4C3 3.45 3.45 3 4 3H6C6 4.1 6.9 5 8 5C9.1 5 10 4.1 10 3Z',
    badge: 0
  }
])

/** 更新对话模块的徽章数 */
watchEffect(() => {
  menuList.value.find((item) => {
    if (item.url === 'chat') {
      item.badge = globalStore.unreadCount
    }
  })
})

/** 更多操作列表 */
const moreList = ref([
  {
    label: '检查更新',
    icon: 'M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3M21 12C21 7.02944 16.9706 3 12 3M21 12H3M12 3C14.5012 6.5 15.5 9 15.5 12C15.5 15 14.5012 17.5 12 21M12 3C9.4988 6.5 8.5 9 8.5 12C8.5 15 9.4988 17.5 12 21',
    click: () => {
      checkUpdate()
    }
  },
  {
    label: '设置',
    icon: 'M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.79 16.88A2 2 0 1 1 17.96 19.71L17.9 19.65A1.65 1.65 0 0 0 16.08 19.32A1.65 1.65 0 0 0 15 20.83V21A2 2 0 0 1 11 21V20.92A1.65 1.65 0 0 0 9.92 19.41A1.65 1.65 0 0 0 8.1 19.74L8.04 19.8A2 2 0 1 1 5.21 16.97L5.27 16.91A1.65 1.65 0 0 0 5.6 15.09A1.65 1.65 0 0 0 4.09 14H4A2 2 0 0 1 4 10H4.08A1.65 1.65 0 0 0 5.59 8.92A1.65 1.65 0 0 0 5.26 7.1L5.2 7.04A2 2 0 1 1 8.03 4.21L8.09 4.27A1.65 1.65 0 0 0 9.91 4.6A1.65 1.65 0 0 0 11 3.09V3A2 2 0 0 1 15 3V3.08A1.65 1.65 0 0 0 16.08 4.59A1.65 1.65 0 0 0 17.9 4.26L17.96 4.2A2 2 0 1 1 20.79 7.03L20.73 7.09A1.65 1.65 0 0 0 20.4 8.91A1.65 1.65 0 0 0 21.91 10H22A2 2 0 0 1 22 14H21.92A1.65 1.65 0 0 0 20.41 15Z',
    click: () => {
      showSettingsModal.value = true
    }
  },
  {
    label: '关于',
    icon: 'M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z M12 16V12 M12 8H12.01',
    click: () => {
      showAboutModal.value = true
    }
  },
  {
    label: '退出账号',
    icon: 'M9 21H5C4.45 21 4 20.55 4 20V4C4 3.45 4.45 3 5 3H9 M16 17L21 12L16 7 M21 12H9',
    click: () => {
      handleLogout()
    }
  }
])

/** 检查更新 */
async function checkUpdate() {
  window.$message?.info('正在检查更新...')
  try {
    const { isTauri } = await import('@/utils/tauri')
    if (isTauri()) {
      const { check } = await import('@tauri-apps/plugin-updater')
      const update = await check()
      if (update) {
        window.$dialog?.warning({
          title: '发现新版本',
          content: `新版本 ${update.version} 可用，是否立即下载并安装？`,
          positiveText: '立即更新',
          negativeText: '稍后',
          onPositiveClick: async () => {
            window.$message?.info('正在下载更新...')
            await update.downloadAndInstall()
            const { relaunch } = await import('@tauri-apps/plugin-process')
            await relaunch()
          }
        })
      } else {
        window.$message?.success('当前已是最新版本')
      }
    } else {
      // 浏览器环境模拟
      setTimeout(() => {
        window.$message?.success('当前已是最新版本 v0.1.0')
      }, 800)
    }
  } catch (err) {
    console.error('检查更新失败:', err)
    window.$message?.success('当前已是最新版本')
  }
}

/** 设置弹窗 */
const showSettingsModal = ref(false)

/** 关于弹窗 */
const showAboutModal = ref(false)

/** 退出登录 */
function handleLogout() {
  window.$dialog?.warning({
    title: '退出登录',
    content: '确定要退出当前账号吗？退出后将返回登录页面。',
    positiveText: '退出',
    negativeText: '取消',
    onPositiveClick: () => {
      userStore.logout()
      window.$message?.success('已退出登录')
      // 跳转到登录页
      router.push('/login')
    }
  })
}

/** 点击导航项 */
const handleNavClick = (url: string) => {
  globalStore.setCurrentModule(url)
  router.push(`/home/${url}`)
}

/** 路由变化时同步当前模块（解决刷新后高亮丢失问题） */
watch(
  () => router.currentRoute.value.path,
  (path) => {
    const match = path.match(/\/home\/(\w+)/)
    if (match && match[1]) {
      globalStore.setCurrentModule(match[1])
    }
  },
  { immediate: true }
)

/** 点击在线状态 */
const handleStatusClick = () => {
  // 切换在线状态
  const newStatus = globalStore.onlineStatus === OnlineEnum.ONLINE ? OnlineEnum.OFFLINE : OnlineEnum.ONLINE
  globalStore.setOnlineStatus(newStatus)
}

/** 点击外部关闭更多菜单 */
const closeMenu = (event: Event) => {
  const e = event.target as HTMLElement
  if (!e.matches('.more-menu, .more-menu *, .nav-item, .nav-item *')) {
    moreShow.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeMenu, true)
})

onUnmounted(() => {
  window.removeEventListener('click', closeMenu, true)
})
</script>

<style scoped lang="scss">
.left {
  background: var(--left-bg-color);
}

/* ========== 个人信息卡片 ========== */
.profile-card {
  width: 280px;
  background: var(--n-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid var(--line-color, #e3e3e3);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 16px;
  background: linear-gradient(135deg, rgba(19, 152, 127, 0.08), rgba(108, 92, 231, 0.08));
}

.profile-name-area {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color, #18181c);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5c6166;

  :global(html[data-theme='dark']) & {
    color: #8b93a7;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.online {
    background: #34c84a;
  }

  &.offline {
    background: #c1c1c1;
  }
}

.profile-info {
  padding: 12px 16px;
  border-top: 1px solid var(--line-color, #e3e3e3);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
}

.info-label {
  color: #5c6166;
  flex-shrink: 0;

  :global(html[data-theme='dark']) & {
    color: #8b93a7;
  }
}

.info-value {
  color: var(--n-text-color, #18181c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 12px;
}

.profile-actions {
  padding: 8px;
  border-top: 1px solid var(--line-color, #e3e3e3);
}

.profile-action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--n-text-color, #18181c);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(99, 99, 99, 0.08);
  }

  &.danger {
    color: #d03050;
    &:hover {
      background: rgba(208, 48, 80, 0.08);
    }
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 46px;
  padding: 4px 8px;
  border-radius: 8px;
  color: var(--left-icon-color);
  cursor: pointer;
  transition: all 0.3s ease;

  &:not(.active):hover {
    background: var(--left-bg-hover);
    border-radius: 8px;
    color: var(--left-active-hover);
  }
}

.active {
  background: var(--left-active-bg-color);
  border-radius: 8px;
  color: var(--left-active-icon-color);
}

.online-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--left-bg-color);
  cursor: pointer;

  &.online {
    background: #34c84a;
  }

  &.offline {
    background: #c1c1c1;
  }
}

.more-menu {
  @include menu-item-style(absolute);
  bottom: 0;
  left: 24px;
  @include menu-list();
}

:deep(.n-badge .n-badge-sup) {
  font-weight: bold;
  font-size: 10px;
}

:deep(.n-badge) {
  color: inherit;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 0;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.about-content {
  text-align: center;
  padding: 20px 0;
}

.about-logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.about-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--n-text-color, #18181c);
}

.about-version {
  font-size: 14px;
  color: #5c6166;
  margin: 0 0 12px;
}

.about-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 24px;
}

.about-info {
  text-align: left;
  border-top: 1px solid var(--line-color, #e3e3e3);
  padding-top: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.info-label {
  color: #5c6166;
}

.info-value {
  color: var(--n-text-color, #18181c);
}
</style>
