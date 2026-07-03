/**
 * 会话列表
 * 文档：POST /api/session/list
 * 只返回当前用户参与的会话（通过 group_members 表关联）
 * 将 DBSession 映射为 YTSession
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const uid = tokenUser.uid

  // 查询当前用户参与的所有会话ID
  const memberSessions = db.prepare(
    'SELECT sessionId FROM group_members WHERE uid = ?'
  ).all(uid) as { sessionId: number }[]

  const sessionIds = memberSessions.map((m) => m.sessionId)

  let rows: DBSession[]
  if (sessionIds.length > 0) {
    // 用户有参与会话：只返回这些会话
    const placeholders = sessionIds.map(() => '?').join(',')
    rows = db.prepare(
      `SELECT * FROM sessions WHERE id IN (${placeholders}) ORDER BY time DESC`
    ).all(...sessionIds) as DBSession[]
  } else {
    // 兼容：用户无任何成员记录时返回空列表
    rows = []
  }

  const ytList = rows.map((s) => ({
    session_id: `p@${s.id}_${uid}`,
    from_id: String(s.id),
    time: s.time,
    chat_type: s.type === 2 ? 'g' : 'p',
    chat_name: s.name,
    type: 0,
    content: s.lastMsg,
    unread_num: s.unread,
    head: 0,
    headUrl: s.avatar,
    sign: '',
    mobile: '',
    state: -1,
    online: '',
    frequent: 0,
    notice: '',
    user_num: s.type === 2 ? 1 : 0
  }))

  return success(listResponse(ytList, '', true))
})
