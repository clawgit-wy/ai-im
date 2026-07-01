<template>
  <div class="schedule-page">
    <!-- 内容区 -->
    <div class="content-area">
      <!-- 内容头部 -->
      <div class="content-header">
        <div class="header-title-area">
          <div class="header-avatar">📅</div>
          <div>
            <div class="content-title">日程管理</div>
            <div class="content-subtitle">{{ currentYear }}年{{ currentMonth + 1 }}月</div>
          </div>
        </div>
        <div class="header-actions">
          <n-input v-model:value="searchKeyword" placeholder="搜索日程..." clearable size="small" class="search-input">
            <template #prefix>
              <span class="text-12px opacity-60">🔍</span>
            </template>
          </n-input>
          <n-button type="primary" size="small" @click="openAddModal">
            <span class="text-14px">+</span> 添加日程
          </n-button>
        </div>
      </div>

      <!-- 日程内容区 -->
      <n-scrollbar class="flex-1">
        <div class="schedule-container">
          <!-- 日历头部 -->
          <div class="calendar-header">
            <div class="calendar-nav">
              <button class="action-btn" @click="prevMonth">◀</button>
              <button class="action-btn" @click="goToday">今天</button>
              <button class="action-btn" @click="nextMonth">▶</button>
            </div>
            <div class="calendar-month">{{ currentYear }}年{{ currentMonth + 1 }}月</div>
          </div>

          <!-- 日历网格 -->
          <div class="calendar-grid">
            <div v-for="day in weekdays" :key="day" class="calendar-weekday">{{ day }}</div>
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="[
                'calendar-day',
                {
                  today: isToday(day),
                  'has-event': hasEvent(day),
                  'other-month': !isCurrentMonth(day),
                  selected: selectedDate === day.fullDate
                }
              ]"
              @click="selectDate(day)">
              {{ day.date }}
            </div>
          </div>

          <!-- 日程列表标题 -->
          <div class="schedule-section-title">
            {{ selectedDateText }} 的日程
            <span v-if="selectedDateSchedules.length" class="schedule-count">{{ selectedDateSchedules.length }}项</span>
          </div>

          <!-- 日程列表 -->
          <div
            v-for="item in selectedDateSchedules"
            :key="item.id"
            class="schedule-item"
            @click="editSchedule(item)">
            <div class="schedule-time">{{ item.time }}</div>
            <div class="schedule-details flex-1">
              <div class="schedule-title">{{ item.title }}</div>
              <div class="schedule-desc">{{ item.description }}</div>
            </div>
            <div :class="['schedule-status', item.status]"></div>
          </div>

          <!-- 空状态 -->
          <n-empty v-if="selectedDateSchedules.length === 0" description="暂无日程安排" class="py-40px" />
        </div>
      </n-scrollbar>
    </div>

    <!-- 添加/编辑日程弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      :title="editingId ? '编辑日程' : '添加日程'"
      style="width: 420px"
      :bordered="false">
      <n-form ref="formRef" :model="formData" label-placement="top" size="small">
        <n-form-item label="日程标题" path="title">
          <n-input v-model:value="formData.title" placeholder="请输入日程标题" />
        </n-form-item>
        <n-form-item label="日期" path="date">
          <n-date-picker
            v-model:formatted-value="formData.date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%" />
        </n-form-item>
        <n-form-item label="时间" path="time">
          <n-time-picker
            v-model:formatted-value="formData.time"
            placeholder="选择时间"
            value-format="HH:mm"
            style="width: 100%" />
        </n-form-item>
        <n-form-item label="日程描述" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            placeholder="请输入日程描述"
            :autosize="{ minRows: 3 }" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-8px">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">{{ editingId ? '保存' : '添加' }}</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useScheduleStore, type ScheduleItem } from '@/stores/schedule'

const scheduleStore = useScheduleStore()

// 初始化：从后端加载日程列表
onMounted(() => {
  scheduleStore.fetchList()
})

/** 搜索关键词 */
const searchKeyword = ref('')
/** 当前年份 */
const currentYear = ref(new Date().getFullYear())
/** 当前月份 */
const currentMonth = ref(new Date().getMonth())
/** 选中的日期 */
const selectedDate = ref(formatDate(new Date()))

/** 弹窗显示 */
const showAddModal = ref(false)
/** 编辑中的ID */
const editingId = ref<number | null>(null)
/** 表单数据 */
const formData = reactive({
  title: '',
  date: formatDate(new Date()),
  time: '09:00',
  description: ''
})

/** 星期标题 */
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/** 日历天数 */
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayWeek = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const days: { date: number; month: number; year: number; fullDate: string }[] = []

  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    days.push({ date: d, month: prevMonth, year: prevYear, fullDate: formatDate(new Date(prevYear, prevMonth, d)) })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, month, year, fullDate: formatDate(new Date(year, month, i)) })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    days.push({ date: i, month: nextMonth, year: nextYear, fullDate: formatDate(new Date(nextYear, nextMonth, i)) })
  }

  return days
})

/** 选中日期的日程 */
const selectedDateSchedules = computed(() => {
  let list = scheduleStore.getScheduleByDate(selectedDate.value)
  if (searchKeyword.value) {
    list = list.filter((s) => s.title.includes(searchKeyword.value) || s.description.includes(searchKeyword.value))
  }
  return list.sort((a, b) => a.time.localeCompare(b.time))
})

/** 选中日期文本 */
const selectedDateText = computed(() => {
  const d = new Date(selectedDate.value)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

/** 是否当月 */
function isCurrentMonth(day: { month: number }) {
  return day.month === currentMonth.value
}

/** 是否今天 */
function isToday(day: { fullDate: string }) {
  return day.fullDate === formatDate(new Date())
}

/** 是否有事件 */
function hasEvent(day: { fullDate: string }) {
  return scheduleStore.scheduleList.some((s) => s.date === day.fullDate)
}

/** 选择日期 */
function selectDate(day: { fullDate: string }) {
  selectedDate.value = day.fullDate
}

/** 上个月 */
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

/** 下个月 */
function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

/** 回到今天 */
function goToday() {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  selectedDate.value = formatDate(now)
}

/** 打开添加弹窗 */
function openAddModal() {
  editingId.value = null
  formData.title = ''
  formData.date = selectedDate.value
  formData.time = '09:00'
  formData.description = ''
  showAddModal.value = true
}

/** 编辑日程 */
function editSchedule(item: ScheduleItem) {
  editingId.value = item.id
  formData.title = item.title
  formData.date = item.date
  formData.time = item.time
  formData.description = item.description
  showAddModal.value = true
}

/** 保存日程 */
function handleSave() {
  if (!formData.title.trim()) {
    window.$message.warning('请输入日程标题')
    return
  }
  if (editingId.value) {
    scheduleStore.updateSchedule(editingId.value, { ...formData })
    window.$message.success('日程已更新')
  } else {
    scheduleStore.addSchedule({ ...formData })
    window.$message.success('日程已添加')
  }
  showAddModal.value = false
}

/** 格式化日期为 YYYY-MM-DD */
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<style scoped>
.schedule-page {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--right-bg-color, #f1f1f1);
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
  background: var(--n-base-color, #fff);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #13987f, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  width: 200px;
}

.content-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color, #18181c);
}

.content-subtitle {
  font-size: 12px;
  color: var(--n-text-color-3, #5c6166);
}

.action-btn {
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--n-tertiary-color, #f0f0f0);
  border: none;
  color: var(--n-text-color, #18181c);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: var(--bg-msg-hover, #f3f3f3);
  color: #13987f;
}

.schedule-container {
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-nav {
  display: flex;
  gap: 8px;
}

.calendar-month {
  font-size: 16px;
  font-weight: 500;
  color: var(--n-text-color, #18181c);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.calendar-weekday {
  text-align: center;
  font-size: 12px;
  color: var(--n-text-color-3, #5c6166);
  padding: 10px 0;
}
.calendar-day {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  position: relative;
  color: var(--n-text-color, #18181c);
}
.calendar-day:hover {
  background: var(--list-hover-color, rgba(99, 99, 99, 0.1));
}
.calendar-day.today {
  background: #13987f;
  color: #fff;
}
.calendar-day.selected {
  border: 2px solid #13987f;
  padding: 10px;
}
.calendar-day.has-event::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--n-warning-color, #f0a020);
}
.calendar-day.today.has-event::after {
  background: #fff;
}
.calendar-day.other-month {
  color: var(--n-text-color-3, #5c6166);
  opacity: 0.5;
}

.schedule-section-title {
  font-size: 14px;
  color: var(--n-text-color-3, #5c6166);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-color, #e3e3e3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-count {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(19, 152, 127, 0.1);
  color: #13987f;
}

.schedule-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background: var(--n-base-color, #fff);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--line-color, #e3e3e3);
}
.schedule-item:hover {
  border-color: #13987f;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
}

.schedule-time {
  width: 60px;
  text-align: center;
  color: #13987f;
  font-size: 14px;
  font-weight: 500;
}
.schedule-title {
  font-size: 14px;
  margin-bottom: 4px;
  color: var(--n-text-color, #18181c);
}
.schedule-desc {
  font-size: 12px;
  color: var(--n-text-color-3, #5c6166);
}

.schedule-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--n-success-color, #18a058);
  align-self: center;
  flex-shrink: 0;
}
.schedule-status.pending {
  background: var(--n-warning-color, #f0a020);
}
.schedule-status.completed {
  background: var(--n-text-color-3, #5c6166);
}
</style>
