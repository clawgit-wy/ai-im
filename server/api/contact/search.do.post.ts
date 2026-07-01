/**
 * 搜索人员
 * 文档：POST /api/contact/search.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const keyword = body?.keyword || ''
  const rows = db.prepare('SELECT * FROM users WHERE name LIKE ?').all(`%${keyword}%`) as DBUser[]
  const list = rows.map((u) => ({
    uid: String(u.uid),
    name: u.name,
    headUrl: u.avatar,
    mobile: u.phone,
    email: u.email,
    sign: '',
    online: String(u.onlineStatus)
  }))
  return success(listResponse(list, '', true))
})
