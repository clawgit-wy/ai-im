import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const user = verifyToken(getHeader(event, 'authorization'))
  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)
  const { sessionId, uidList } = body

  if (!sessionId) {
    return fail('缺少会话ID参数')
  }

  if (!Array.isArray(uidList) || uidList.length === 0) {
    return fail('请选择要添加的成员')
  }

  // 检查会话是否存在
  const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sessionId)
  if (!session) {
    return fail('会话不存在', 404)
  }

  // 获取已有成员的 uid
  const existingMembers = db.prepare('SELECT uid FROM group_members WHERE sessionId = ?').all(sessionId) as { uid: number }[]
  const existingUids = new Set(existingMembers.map((m) => m.uid))

  const now = Date.now()
  const newNames: string[] = []
  const insertMember = db.prepare(
    'INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )

  for (const uid of uidList) {
    if (existingUids.has(uid)) continue
    const u = db.prepare('SELECT name, avatar, onlineStatus FROM users WHERE uid = ?').get(uid) as { name: string; avatar: string; onlineStatus: number } | undefined
    if (!u) continue

    insertMember.run(uid, sessionId, u.name, u.avatar, 3, u.onlineStatus, now)
    newNames.push(u.name)
  }

  // 添加系统消息
  const names = newNames.join('、')
  if (names) {
    db.prepare(
      'INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(sessionId, 0, '系统', '⚙️', 7, `${user.name} 邀请 ${names} 加入群组`, now)
  }

  return success(null, '添加成员成功')
})
