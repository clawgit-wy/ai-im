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
    return fail('工作流ID不能为空')
  }

  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id)

  if (!workflow) {
    return fail('工作流不存在', 404)
  }

  return success(workflow)
})
