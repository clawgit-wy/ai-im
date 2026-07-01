import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.id) {
    return fail('日程ID不能为空')
  }

  const schedule = db.prepare('SELECT id FROM schedules WHERE id = ?').get(body.id)
  if (!schedule) {
    return fail('日程不存在', 404)
  }

  // 动态构建更新语句
  const fields: string[] = []
  const values: any[] = []

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
  if (body.content !== undefined) { fields.push('content = ?'); values.push(body.content) }
  if (body.startTime !== undefined) { fields.push('startTime = ?'); values.push(body.startTime) }
  if (body.endTime !== undefined) { fields.push('endTime = ?'); values.push(body.endTime) }
  if (body.allDay !== undefined) { fields.push('allDay = ?'); values.push(body.allDay ? 1 : 0) }
  if (body.remindTime !== undefined) { fields.push('remindTime = ?'); values.push(body.remindTime) }
  if (body.type !== undefined) { fields.push('type = ?'); values.push(body.type) }
  if (body.completed !== undefined) { fields.push('completed = ?'); values.push(body.completed ? 1 : 0) }

  if (fields.length > 0) {
    values.push(body.id)
    db.prepare(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  }

  return success(null, '更新日程成功')
})
