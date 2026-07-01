import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler((event) => {
  const query = getQuery(event) as any
  const sessionId = query.sessionId ? Number(query.sessionId) : 0
  const lastTime = query.lastTime ? Number(query.lastTime) : 0

  let recentMessages: DBMessage[] = []

  if (sessionId > 0) {
    // 获取指定会话的消息
    if (lastTime > 0) {
      recentMessages = db.prepare('SELECT * FROM messages WHERE sessionId = ? AND sendTime > ? ORDER BY sendTime ASC').all(sessionId, lastTime) as DBMessage[]
    } else {
      recentMessages = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY sendTime DESC LIMIT 20').all(sessionId) as DBMessage[]
      recentMessages.reverse()
    }
  } else {
    // 获取所有会话的最新消息
    if (lastTime > 0) {
      recentMessages = db.prepare('SELECT * FROM messages WHERE sendTime > ? ORDER BY sendTime ASC').all(lastTime) as DBMessage[]
    } else {
      recentMessages = db.prepare('SELECT * FROM messages ORDER BY sendTime DESC LIMIT 20').all() as DBMessage[]
      recentMessages.reverse()
    }
  }

  const list = recentMessages.map((msg) => ({
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

  return success(listResponse(list))
})
