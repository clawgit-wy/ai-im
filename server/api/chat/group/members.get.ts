import { defineEventHandler, getQuery, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const user = verifyToken(getHeader(event, 'authorization'))
  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const query = getQuery(event)
  const sessionId = Number(query.sessionId)

  if (!sessionId) {
    return fail('缺少会话ID参数')
  }

  const members = db.prepare('SELECT uid, sessionId, username, avatar, role, onlineStatus, joinTime FROM group_members WHERE sessionId = ?').all(sessionId)

  return success(listResponse(members), '获取群成员成功')
})
