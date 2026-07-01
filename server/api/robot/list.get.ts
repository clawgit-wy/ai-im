import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const rows = db.prepare('SELECT * FROM workflows ORDER BY createTime DESC').all()
  return success(listResponse(rows))
})
