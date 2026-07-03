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
  const sessionType = body.type || 1
  const newSession = {
    id,
    name: body.name || '新会话',
    avatar: body.avatar || '💬',
    type: sessionType,
    lastMsg: '',
    time: Date.now(),
    unread: 0,
    aiEnabled: body.aiEnabled ? 1 : 0
  }

  db.prepare(
    'INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(newSession.id, newSession.name, newSession.avatar, newSession.type, newSession.lastMsg, newSession.time, newSession.unread, newSession.aiEnabled)

  // 将创建者加入会话成员表（单聊和群聊统一使用 group_members 表）
  const now = Date.now()
  const creatorUser = db.prepare('SELECT name, avatar, onlineStatus FROM users WHERE uid = ?').get(user.uid) as { name: string; avatar: string; onlineStatus: number } | undefined
  db.prepare(
    'INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(user.uid, id, creatorUser?.name || user.name, creatorUser?.avatar || '👤', 1, creatorUser?.onlineStatus || 1, now)

  // 如果是单聊且指定了目标用户，也将目标用户加入成员表
  if (sessionType === 1 && body.targetUid) {
    const targetUser = db.prepare('SELECT name, avatar, onlineStatus FROM users WHERE uid = ?').get(body.targetUid) as { name: string; avatar: string; onlineStatus: number } | undefined
    if (targetUser) {
      db.prepare(
        'INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(body.targetUid, id, targetUser.name, targetUser.avatar, 3, targetUser.onlineStatus, now)

      // 通过 WebSocket 通知目标用户新会话创建
      notifyUser(body.targetUid, {
        type: 'session',
        sessionId: id,
        data: { type: 'session_update', data: { sessionId: id, action: 'created' } }
      })
    }
  }

  return success(newSession, '创建会话成功')
})
