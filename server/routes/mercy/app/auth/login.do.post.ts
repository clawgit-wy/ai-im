/**
 * 用户登录
 * 文档：POST /mercy/app/auth/login.do
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { account, password, deviceId } = body || {}

  if (!account || !password) {
    return fail('账号和密码不能为空')
  }

  // 按 account 匹配 users 表(email/phone/name)
  const user = db.prepare(
    'SELECT * FROM users WHERE email = ? OR phone = ? OR name = ?'
  ).get(account, account, account) as DBUser | undefined

  if (!user) {
    return fail('用户不存在', 404)
  }

  if (!comparePassword(password, user.password)) {
    return fail('密码错误', 401)
  }

  const token = generateToken(user.uid)

  // 更新在线状态为在线
  db.prepare('UPDATE users SET onlineStatus = 1, lastOptTime = ? WHERE uid = ?').run(Date.now(), user.uid)

  const userInfo = {
    uid: String(user.uid),
    name: user.name,
    headUrl: user.avatar,
    mobile: user.phone,
    email: user.email,
    sign: '',
    online: String(user.onlineStatus)
  }

  return success({ userInfo, token, deviceId: deviceId || '' }, '登录成功')
})
