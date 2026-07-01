/**
 * 消息同步 / 历史消息
 * 文档：POST /api/msg/sync.do
 * 将 DBMessage 映射为 YTMessage
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const session_id = body?.session_id
  const last_msg_id = Number(body?.last_msg_id) || 0
  const size = Number(body?.size) || 20
  const sid = Number(String(session_id).split('@').pop()?.split('_')[0])

  let rows: DBMessage[]
  if (last_msg_id > 0) {
    rows = db.prepare(
      'SELECT * FROM messages WHERE sessionId = ? AND id < ? ORDER BY id DESC LIMIT ?'
    ).all(sid, last_msg_id, size) as DBMessage[]
  } else {
    rows = db.prepare(
      'SELECT * FROM messages WHERE sessionId = ? ORDER BY id DESC LIMIT ?'
    ).all(sid, size) as DBMessage[]
  }

  // 反转为正序
  rows.reverse()

  const ytList = rows.map((m) => ({
    msg_id: m.id,
    uuid: `u${m.id}`,
    seq: m.id,
    session_id: `p@${m.sessionId}_${tokenUser.uid}`,
    from_id: String(m.fromUid),
    content: m.content,
    time: m.sendTime,
    status: 2,
    type: 0,
    chat_type: 'p',
    keyword: '',
    unread: 0,
    name: m.fromName,
    headUrl: m.fromAvatar,
    state: ''
  }))

  const isLast = ytList.length < size
  const cursor = ytList.length ? String(ytList[0].msg_id) : ''
  return success(listResponse(ytList, cursor, isLast))
})
