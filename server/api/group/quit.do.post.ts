/**
 * 退出群组
 * 文档：POST /api/group/quit.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const gid = Number(body?.group_id)
  db.prepare('DELETE FROM sessions WHERE id = ?').run(gid)
  db.prepare('DELETE FROM group_members WHERE sessionId = ?').run(gid)
  return success(null)
})
