/**
 * 搜索群组
 * 文档：POST /api/group/searchPage.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const keyword = body?.keyword || ''
  const rows = db.prepare('SELECT * FROM sessions WHERE type = 2 AND name LIKE ?').all(`%${keyword}%`) as DBSession[]
  const list = rows.map((s) => ({
    group_id: s.id,
    name: s.name,
    avatar: s.avatar,
    user_num: 1
  }))
  return success(listResponse(list, '', true))
})
