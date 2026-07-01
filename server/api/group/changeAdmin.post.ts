/**
 * 移交群主
 * 文档：POST /api/group/changeAdmin
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const { group_id, uid } = body || {}
  const gid = Number(group_id)
  const newOwner = Number(uid)
  // 旧群主降为普通成员，新群主升为群主
  db.prepare('UPDATE group_members SET role = 3 WHERE sessionId = ? AND role = 1').run(gid)
  db.prepare('UPDATE group_members SET role = 1 WHERE sessionId = ? AND uid = ?').run(gid, newOwner)
  return success(null)
})
