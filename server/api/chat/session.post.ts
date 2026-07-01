import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  // 创建新会话
  const id = getNextId('sessions')
  const newSession = {
    id,
    name: body.name || '新会话',
    avatar: body.avatar || '💬',
    type: body.type || 1,
    lastMsg: '',
    time: Date.now(),
    unread: 0,
    aiEnabled: body.aiEnabled ? 1 : 0
  }

  db.prepare(
    'INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(newSession.id, newSession.name, newSession.avatar, newSession.type, newSession.lastMsg, newSession.time, newSession.unread, newSession.aiEnabled)

  return success(newSession, '创建会话成功')
})
