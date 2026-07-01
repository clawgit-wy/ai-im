import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const user = verifyToken(getHeader(event, 'authorization'))
  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)
  const { groupName, avatar, uidList } = body

  if (!groupName) {
    return fail('群名称不能为空')
  }

  if (!Array.isArray(uidList) || uidList.length === 0) {
    return fail('请选择群成员')
  }

  // 创建群组会话 (type=2 群聊)
  const sessionId = getNextId('sessions')
  const now = Date.now()
  db.prepare(
    'INSERT INTO sessions (id, name, avatar, type, lastMsg, time, unread, aiEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(sessionId, groupName, avatar || '👥', 2, '群组已创建', now, 0, 0)

  // 初始化群成员（包含创建者）
  const memberUids = Array.from(new Set([user.uid, ...uidList]))
  const insertMember = db.prepare(
    'INSERT INTO group_members (uid, sessionId, username, avatar, role, onlineStatus, joinTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  for (const uid of memberUids) {
    const u = db.prepare('SELECT name, avatar, onlineStatus FROM users WHERE uid = ?').get(uid) as { name: string; avatar: string; onlineStatus: number } | undefined
    insertMember.run(uid, sessionId, u?.name || '未知用户', u?.avatar || '👤', uid === user.uid ? 1 : 3, u?.onlineStatus || 1, now)
  }

  // 添加系统消息
  db.prepare(
    'INSERT INTO messages (sessionId, fromUid, fromName, fromAvatar, type, content, sendTime) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(sessionId, 0, '系统', '⚙️', 7, `${user.name} 创建了群组「${groupName}」`, now)

  return success({ id: sessionId }, '创建群组成功')
})
