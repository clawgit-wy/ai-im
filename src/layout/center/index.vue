<template>
  <main
    data-tauri-drag-region
    id="center"
    :class="{ 'rounded-r-8px': shrinkStatus }"
    class="resizable select-none flex flex-col border-r-(1px solid [--border-color])"
    :style="{ width: `${initWidth}px` }">
    <!-- 分隔条 -->
    <div v-if="!shrinkStatus" class="resize-handle transition-all duration-600 ease-in-out" @mousedown="initDrag">
      <div :class="{ 'opacity-100': isDragging }" class="transition-all duration-600 ease-in-out opacity-0 drag-icon">
        <div style="border-radius: 8px 0 0 8px" class="bg-#c8c8c833 h-60px w-14px absolute top-40% right-0 drag-icon">
          <svg class="size-16px absolute top-1/2 right--2px transform -translate-y-1/2 color-#909090" viewBox="0 0 24 24" fill="none">
            <path d="M8 6L8 18M16 6L16 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 顶部搜索栏 -->
    <header
      class="mt-30px w-full h-40px flex flex-col items-center border-b-(1px solid [--border-color])">
      <div class="flex-center gap-5px w-full pr-16px pl-16px box-border">
        <n-input
          id="search"
          class="rounded-6px w-full relative text-12px"
          style="background: var(--search-bg-color)"
          :maxlength="20"
          clearable
          size="small"
          :placeholder="searchText"
          v-model:value="searchValue">
          <template #prefix>
            <svg class="w-12px h-12px" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </template>
        </n-input>

        <!-- 添加面板 -->
        <n-popover
          v-model:show="addPanels.show"
          style="padding: 0; background: transparent; user-select: none"
          :show-arrow="false"
          trigger="click">
          <template #trigger>
            <n-button size="small" secondary style="padding: 0 5px">
              <template #icon>
                <svg class="w-24px h-24px" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </template>
            </n-button>
          </template>

          <div @click.stop="addPanels.show = false" class="add-item">
            <div class="menu-list">
              <div v-for="(item, index) in addPanels.list" :key="index">
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
      </div>
    </header>

    <!-- 列表 -->
    <div id="centerList" class="h-full">
      <router-view />
    </div>
  </main>
</template>

<script setup lang="ts">
import Mitt from '@/utils/Bus'
import { MittEnum } from '@/enums'

/** 设置最小宽度 */
const minWidth = 160
/** 设置最大宽度 */
const maxWidth = 300
/** 初始化宽度 */
const initWidth = ref(250)
/** 是否可拖拽 */
const isDrag = ref(true)
/** 搜索框文字 */
const searchText = ref('搜索')
/** 搜索框值 */
const searchValue = ref('')
/** 添加面板是否显示 */
const addPanels = ref({
  show: false,
  list: [
    {
      label: '发起群聊',
      icon: 'M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21 M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z M19 8V14 M22 11H16',
      click: () => {
        window.$message.info('发起群聊')
      }
    },
    {
      label: '添加好友',
      icon: 'M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21 M8.5 11C9.88071 11 11 9.88071 11 8.5C11 7.11929 9.88071 6 8.5 6C7.11929 6 6 7.11929 6 8.5C6 9.88071 7.11929 11 8.5 11Z M20 8V14 M23 11H17',
      click: () => {
        window.$message.info('添加好友')
      }
    }
  ]
})

const startX = ref()
const startWidth = ref()
const shrinkStatus = ref(false)
const isDragging = ref(false)

/** 窗口宽度 */
const winWidth = ref(window.innerWidth)

/** 监听窗口大小变化 */
const handleResize = () => {
  winWidth.value = window.innerWidth
  if (winWidth.value >= 310 && winWidth.value < 800) {
    Mitt.emit(MittEnum.SHRINK_WINDOW, true)
    const center = document.querySelector('#center')
    center?.classList.add('flex-1')
    isDrag.value = false
  }
  if (winWidth.value >= 800) {
    Mitt.emit(MittEnum.SHRINK_WINDOW, false)
    const center = document.querySelector('#center')
    center?.classList.remove('flex-1')
    isDrag.value = true
  }
}

/** 定义一个函数，在鼠标拖动时调用 */
const doDrag = (e: MouseEvent) => {
  requestAnimationFrame(() => {
    const newWidth = startWidth.value + e.clientX - startX.value
    if (newWidth !== maxWidth) {
      initWidth.value = clamp(newWidth, minWidth, maxWidth)
    }
  })
}

/** 定义一个函数，用于将数值限制在指定的最小值和最大值之间 */
const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

const initDrag = (e: MouseEvent) => {
  if (!isDrag.value) return
  startX.value = e.clientX
  startWidth.value = initWidth.value
  isDragging.value = true
  document.addEventListener('mousemove', doDrag, false)
  document.addEventListener('mouseup', stopDrag, false)
}

const stopDrag = () => {
  document.removeEventListener('mousemove', doDrag, false)
  document.removeEventListener('mouseup', stopDrag, false)
  isDragging.value = false
  setTimeout(() => {
    const resizeHandle = document.querySelector('.resize-handle') as HTMLElement
    resizeHandle?.classList.remove('hover')
  }, 1000)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  Mitt.on(MittEnum.SHRINK_WINDOW, (event: any) => {
    shrinkStatus.value = event as boolean
  })
  // 初始执行一次
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.resizable {
  height: 100%;
  position: relative;
  overflow: hidden;
  background: var(--center-bg-color);
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  z-index: 9999;
  background: transparent;
  &:hover {
    .drag-icon {
      opacity: 1;
    }
  }
}

.add-item {
  @include menu-item-style(absolute);
  top: 36px;
  right: 10px;
  @include menu-list();
}
</style>
