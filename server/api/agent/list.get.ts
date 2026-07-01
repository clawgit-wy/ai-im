import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const rows = db.prepare('SELECT * FROM agents ORDER BY createTime DESC').all() as any[]
  // 解析 modelConfig JSON
  const agents = rows.map((row) => ({
    ...row,
    modelConfig: row.modelConfig ? JSON.parse(row.modelConfig) : {}
  }))
  return success(listResponse(agents))
})
