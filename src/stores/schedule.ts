import { ref } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum } from '@/enums'
import apis from '@/services/apis'
import type { Schedule } from '@/services/types'

/** 日程状态 */
export enum ScheduleStatusEnum {
  /** 待处理 */
  PENDING = 'pending',
  /** 进行中 */
  ACTIVE = 'active',
  /** 已完成 */
  COMPLETED = 'completed'
}

/** 日程项类型 */
export interface ScheduleItem {
  /** 日程ID */
  id: number
  /** 日程标题 */
  title: string
  /** 日程描述 */
  description: string
  /** 日程日期 (YYYY-MM-DD) */
  date: string
  /** 日程时间 (HH:mm) */
  time: string
  /** 日程状态 */
  status: ScheduleStatusEnum
}

/** 时间戳转日期 YYYY-MM-DD */
function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 时间戳转时间 HH:mm */
function formatTimeStr(timestamp: number): string {
  const d = new Date(timestamp)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 后端 Schedule → 本地 ScheduleItem */
function mapSchedule(s: Schedule): ScheduleItem {
  return {
    id: s.id,
    title: s.title,
    description: s.content,
    date: formatDate(s.startTime),
    time: formatTimeStr(s.startTime),
    status: s.completed ? ScheduleStatusEnum.COMPLETED : ScheduleStatusEnum.PENDING
  }
}

export const useScheduleStore = defineStore(StoresEnum.SCHEDULE, () => {
  /** 日程列表 */
  const scheduleList = ref<ScheduleItem[]>([])

  /**
   * 从后端加载日程列表
   */
  async function fetchList() {
    try {
      const res = await apis.getScheduleList()
      scheduleList.value = (res.list || []).map(mapSchedule)
    } catch (err) {
      console.error('加载日程列表失败:', err)
    }
  }

  /**
   * 添加日程
   * @param schedule 日程信息
   */
  async function addSchedule(schedule: Omit<ScheduleItem, 'id' | 'status'> & { status?: ScheduleStatusEnum }) {
    try {
      const startTime = new Date(`${schedule.date} ${schedule.time}`).getTime()
      const res = await apis.createSchedule({
        title: schedule.title,
        content: schedule.description,
        startTime,
        endTime: startTime + 3600000,
        allDay: false,
        remindTime: 10,
        type: 'meeting'
      })
      const item = mapSchedule(res)
      scheduleList.value.push(item)
      return item
    } catch (err) {
      console.error('添加日程失败:', err)
      return null
    }
  }

  /**
   * 更新日程
   * @param id 日程ID
   * @param data 更新数据
   */
  async function updateSchedule(id: number, data: Partial<ScheduleItem>) {
    try {
      const startTime = data.date && data.time ? new Date(`${data.date} ${data.time}`).getTime() : undefined
      await apis.updateSchedule({
        id,
        title: data.title || '',
        content: data.description || '',
        startTime: startTime || Date.now(),
        endTime: (startTime || Date.now()) + 3600000,
        allDay: false,
        remindTime: 10,
        type: 'meeting'
      })
      const index = scheduleList.value.findIndex((s) => s.id === id)
      if (index > -1) {
        scheduleList.value[index] = { ...scheduleList.value[index], ...data }
      }
    } catch (err) {
      console.error('更新日程失败:', err)
    }
  }

  /**
   * 删除日程
   * @param id 日程ID
   */
  async function deleteSchedule(id: number) {
    try {
      await apis.deleteSchedule({ id })
      const index = scheduleList.value.findIndex((s) => s.id === id)
      if (index > -1) {
        scheduleList.value.splice(index, 1)
      }
    } catch (err) {
      console.error('删除日程失败:', err)
    }
  }

  /**
   * 根据日期获取日程
   * @param date 日期 (YYYY-MM-DD)
   */
  function getScheduleByDate(date: string) {
    return scheduleList.value.filter((s) => s.date === date)
  }

  return {
    scheduleList,
    fetchList,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleByDate
  }
})
