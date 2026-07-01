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

  const result = db.prepare('DELETE FROM agents WHERE id = ?').run(id)

  if (result.changes === 0) {
    return fail('智能体不存在', 404)
  }

  return success(null, '删除智能体成功')
})
