/**
 * 获取联系人信息
 * 文档：POST /api/contact/info.do
 * 将 DBUser 映射为 YTUserInfo
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const uid = Number(body?.uid)

  const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid) as DBUser | undefined
  if (!user) {
    return fail('用户不存在', 404)
  }

  const ytUser = {
    uid: String(user.uid),
    name: user.name,
    headUrl: user.avatar,
    mobile: user.phone,
    email: user.email,
    sign: '',
    online: String(user.onlineStatus)
  }
  return success(ytUser)
})
