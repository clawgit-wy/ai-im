import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { msgId, sessionId } = body

  const result = db.prepare('UPDATE messages SET content = ? WHERE id = ? AND sessionId = ?').run('消息已撤回', msgId, sessionId)

  if (result.changes === 0) {
    return fail('消息不存在')
  }

  // 广播撤回消息
  notifySession(sessionId, { type: 'recall', sessionId, msgId })

  return success(null)
})
