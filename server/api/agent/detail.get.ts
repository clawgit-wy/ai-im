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
    return fail('智能体ID不能为空')
  }

  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as any

  if (!row) {
    return fail('智能体不存在', 404)
  }

  // 解析 modelConfig JSON
  const agent = {
    ...row,
    modelConfig: row.modelConfig ? JSON.parse(row.modelConfig) : {}
  }

  return success(agent)
})
