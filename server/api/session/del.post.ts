/**
 * 删除会话
 * 文档：POST /api/session/del
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const session_id = body?.session_id
  const sid = Number(String(session_id).split('@').pop()?.split('_')[0])
  if (sid) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sid)
  }
  return success(null)
})
