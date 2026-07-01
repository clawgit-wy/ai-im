import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.title || !body.startTime || !body.endTime) {
    return fail('日程标题、开始时间和结束时间不能为空')
  }

  const id = getNextId('schedules')
  const schedule = {
    id,
    title: body.title,
    content: body.content || '',
    startTime: body.startTime,
    endTime: body.endTime,
    allDay: body.allDay ? 1 : 0,
    remindTime: body.remindTime ?? 10,
    type: body.type || 'meeting',
    completed: body.completed ? 1 : 0,
    createTime: Date.now()
  }

  db.prepare(
    'INSERT INTO schedules (id, title, content, startTime, endTime, allDay, remindTime, type, completed, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(schedule.id, schedule.title, schedule.content, schedule.startTime, schedule.endTime, schedule.allDay, schedule.remindTime, schedule.type, schedule.completed, schedule.createTime)

  return success(schedule, '创建日程成功')
})
