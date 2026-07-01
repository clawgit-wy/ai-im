/**
 * 群组列表
 * 文档：POST /api/group/listNew.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event).catch(() => ({}))
  const rows = db.prepare('SELECT * FROM sessions WHERE type = 2').all() as DBSession[]
  const list = rows.map((s) => ({
    group_id: s.id,
    name: s.name,
    avatar: s.avatar,
    user_num: 1
  }))
  return success(listResponse(list, '', true))
})
