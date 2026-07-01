/**
 * 会话列表
 * 文档：POST /api/session/list
 * 将 DBSession 映射为 YTSession
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const uid = tokenUser.uid

  const rows = db.prepare('SELECT * FROM sessions ORDER BY time DESC').all() as DBSession[]

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
