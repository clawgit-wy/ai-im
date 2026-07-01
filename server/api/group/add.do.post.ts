/**
 * 添加群成员
 * 文档：POST /api/group/add.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const { group_id, uidList } = body || {}
  const gid = Number(group_id)
  const now = Date.now()
  const insertMember = db.prepare(
    'INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  for (const raw of (Array.isArray(uidList) ? uidList : [])) {
    const uid = Number(raw)
    const u = db.prepare('SELECT name, avatar, onlineStatus FROM users WHERE uid = ?').get(uid) as { name: string; avatar: string; onlineStatus: number } | undefined
    insertMember.run(uid, gid, u?.name || '未知用户', u?.avatar || '👤', 3, u?.onlineStatus || 1, now)
  }
  return success(null)
})
