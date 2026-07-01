/**
 * 修改群信息
 * 文档：POST /api/group/update.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const { group_id, name, avatar } = body || {}
  const gid = Number(group_id)
  db.prepare('UPDATE sessions SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?').run(
    name ?? null,
    avatar ?? null,
    gid
  )
  return success(null)
})
