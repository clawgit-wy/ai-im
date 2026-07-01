import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  // 返回会话列表
  const rows = db.prepare('SELECT * FROM sessions ORDER BY time DESC').all()
  return success(listResponse(rows), '获取会话列表成功')
})
