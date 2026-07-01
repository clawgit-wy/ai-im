import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const user = verifyToken(getHeader(event, 'authorization'))
  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)
  const { sessionId, uid } = body

  if (!sessionId || !uid) {
    return fail('缺少必要参数')
  }

  // 检查会话是否存在
  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
  if (!session) {
    return fail('会话不存在', 404)
  }

  // 检查操作权限（只有群主或管理员可以移除成员）
  const operator = db.prepare('SELECT role FROM group_members WHERE sessionId = ? AND uid = ?').get(sessionId, user.uid) as { role: number } | undefined
  if (!operator || (operator.role !== 1 && operator.role !== 2)) {
    return fail('没有权限移除成员', 403)
  }

  // 不能移除群主
  const target = db.prepare('SELECT username, role FROM group_members WHERE sessionId = ? AND uid = ?').get(sessionId, uid) as { username: string; role: number } | undefined
  if (!target) {
    return fail('成员不存在', 404)
  }
  if (target.role === 1) {
    return fail('不能移除群主', 403)
  }

  // 移除成员
  db.prepare('DELETE FROM group_members WHERE sessionId = ? AND uid = ?').run(sessionId, uid)

  // 添加系统消息
  db.prepare(
    'INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(sessionId, 0, '系统', '⚙️', 7, `${target.username} 被 ${user.name} 移出群组`, Date.now())

  return success(null, '移除成员成功')
})
