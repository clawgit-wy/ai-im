import { defineEventHandler, getQuery, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const query = getQuery(event)
  const id = Number(query.id)

  if (!id) {
    return fail('日程ID不能为空')
  }

  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id)

  if (!schedule) {
    return fail('日程不存在', 404)
  }

  return success(schedule)
})
