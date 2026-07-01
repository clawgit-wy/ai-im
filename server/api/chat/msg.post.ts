import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = verifyToken(getHeader(event, 'authorization'))
  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const { sessionId, msgType, body: msgBody } = body
  const content = msgBody?.content || ''

  // 插入消息 (AUTOINCREMENT)
  const result = db.prepare(
    'INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(sessionId, user.uid, user.name, '👤', msgType, content, Date.now())

  const messageId = result.lastInsertRowid as number

  // 更新会话最后消息和时间
  db.prepare('UPDATE sessions SET lastMsg = ?, time = ? WHERE id = ?').run(content, Date.now(), sessionId)

  // 通过 WebSocket 广播消息
  notifySession(sessionId, {
    type: 'message',
    sessionId,
    message: {
      id: messageId,
      sessionId,
      fromUid: user.uid,
      fromName: user.name,
      fromAvatar: '👤',
      type: msgType,
      body: { content },
      sendTime: Date.now()
    }
  })

  return success({
    fromUser: {
      uid: user.uid,
      username: user.name,
      avatar: '👤'
    },
    message: {
      id: messageId,
      sessionId,
      type: msgType,
      body: { content },
      sendTime: Date.now(),
      messageMark: { userLike: 0, userDislike: 0, likeCount: 0, dislikeCount: 0 }
    },
    sendTime: new Date().toLocaleTimeString()
  })
})
