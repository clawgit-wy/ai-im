import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sessionId } = body

  const result = db.prepare('UPDATE sessions SET unread = 0 WHERE id = ?').run(sessionId)

  if (result.changes === 0) {
    return fail('会话不存在')
  }

  return success(null)
})
