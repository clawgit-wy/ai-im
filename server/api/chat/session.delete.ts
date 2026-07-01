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
    return fail('缺少会话ID参数')
  }

  // 检查会话是否存在
  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(id)
  if (!session) {
    return fail('会话不存在', 404)
  }

  // 删除会话及其相关消息和群成员
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
  db.prepare('DELETE FROM messages WHERE sessionId = ?').run(id)
  db.prepare('DELETE FROM group_members WHERE sessionId = ?').run(id)

  return success(null, '删除会话成功')
})
