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

  // 检查会话是否存在
  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
  if (!session) {
    return fail('会话不存在', 404)
  }

  // 检查是否是群成员
  const member = db.prepare('SELECT role FROM group_members WHERE sessionId = ? AND uid = ?').get(sessionId, user.uid) as { role: number } | undefined
  if (!member) {
    return fail('您不是该群成员', 400)
  }

  // 群主退出：解散群组
  if (member.role === 1) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
    db.prepare('DELETE FROM messages WHERE sessionId = ?').run(sessionId)
    db.prepare('DELETE FROM group_members WHERE sessionId = ?').run(sessionId)
    return success(null, '群组已解散')
  }

  // 普通成员退出
  db.prepare('DELETE FROM group_members WHERE sessionId = ? AND uid = ?').run(sessionId, user.uid)

  // 添加系统消息
  db.prepare(
    'INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(sessionId, 0, '系统', '⚙️', 7, `${user.name} 退出了群组`, Date.now())

  return success(null, '退出群组成功')
})
