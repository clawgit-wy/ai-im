import { defineEventHandler, getQuery, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const query = getQuery(event) as any
  const sessionId = Number(query.sessionId)
  const cursor = query.cursor ? Number(query.cursor) : 0
  const size = Number(query.size) || 20

  // 查询消息（按 id 降序获取，模拟分页）
  let allMessages: DBMessage[]
  if (cursor > 0) {
    allMessages = db.prepare('SELECT * FROM messages WHERE sessionId = ? AND id < ? ORDER BY id DESC LIMIT ?').all(sessionId, cursor, size) as DBMessage[]
  } else {
    allMessages = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY id DESC LIMIT ?').all(sessionId, size) as DBMessage[]
  }

  // 正序排列用于展示
  allMessages.reverse()

  const list = allMessages.map((msg) => ({
    fromUser: {
      uid: msg.fromUid,
      username: msg.fromName,
      avatar: msg.fromAvatar
    },
    message: {
      id: msg.id,
      sessionId: msg.sessionId,
      type: msg.type,
      body: { content: msg.content },
      sendTime: msg.sendTime,
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: new Date(msg.sendTime).toLocaleTimeString()
  }))

  // 是否最后一页（获取的消息少于 size 说明没有更多了）
  const isLast = allMessages.length < size
  const newCursor = allMessages.length > 0 ? String(allMessages[0].id) : ''

  return success(listResponse(list, newCursor, isLast))
})
