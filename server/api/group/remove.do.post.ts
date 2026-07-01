/**
 * 移除群成员
 * 文档：POST /api/group/remove.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const { group_id, uidList } = body || {}
  const gid = Number(group_id)
  const del = db.prepare('DELETE FROM group_members WHERE sessionId = ? AND uid = ?')
  for (const raw of (Array.isArray(uidList) ? uidList : [])) {
    del.run(gid, Number(raw))
  }
  return success(null)
})
