/**
 * 创建群组
 * 文档：POST /api/group/create.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const { name, avatar, uidList } = body || {}

  const id = getNextId('sessions')
  db.prepare(
    'INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, name || '', avatar || '👥', 2, '', Date.now(), 0, 0)

  // 初始化群成员（创建者 + uidList）
  const now = Date.now()
  const memberUids = Array.from(new Set([tokenUser.uid, ...(Array.isArray(uidList) ? uidList.map((u: any) => Number(u)) : [])]))
  const insertMember = db.prepare(
    'INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  for (const uid of memberUids) {
    const u = db.prepare('SELECT name, avatar, onlineStatus FROM users WHERE uid = ?').get(uid) as { name: string; avatar: string; onlineStatus: number } | undefined
    insertMember.run(uid, id, u?.name || '未知用户', u?.avatar || '👤', uid === tokenUser.uid ? 1 : 3, u?.onlineStatus || 1, now)
  }

  // 通过 WebSocket 通知所有被邀请的成员（创建者自己会在本地直接看到）
  for (const uid of memberUids) {
    if (uid !== tokenUser.uid) {
      notifyUser(uid, {
        type: 'session',
        sessionId: id,
        data: { type: 'session_update', data: { sessionId: id, action: 'created' } }
      })
    }
  }

  return success({ group_id: id })
})
