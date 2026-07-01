import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { account, password } = body

  if (!account || !password) {
    return fail('账号和密码不能为空')
  }

  // 根据 account 查找用户 (支持邮箱、手机号、用户名)
  const user = db.prepare(
    'SELECT * FROM users WHERE email = ? OR phone = ? OR name = ?'
  ).get(account, account, account) as DBUser | undefined

  if (!user) {
    return fail('用户不存在', 404)
  }

  // 验证密码 (bcrypt)
  if (!comparePassword(password, user.password)) {
    return fail('密码错误', 401)
  }

  // 生成 JWT token
  const token = generateToken(user.uid)

  // 更新在线状态
  db.prepare('UPDATE users SET onlineStatus = 1, lastOptTime = ? WHERE uid = ?').run(Date.now(), user.uid)

  // 返回用户信息(排除密码)
  const { password: _, ...userInfo } = user
  userInfo.onlineStatus = 1
  return success({ userInfo, token }, '登录成功')
})
