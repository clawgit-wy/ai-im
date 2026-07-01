import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, code, password } = body

  if (!email || !code || !password) {
    return fail('邮箱、验证码和新密码不能为空')
  }

  // 校验验证码
  const record = verifyCodes.get(email)
  if (!record) {
    return fail('请先发送验证码', 400)
  }
  if (Date.now() > record.expires) {
    verifyCodes.delete(email)
    return fail('验证码已过期，请重新发送', 400)
  }
  if (record.code !== code) {
    return fail('验证码不正确', 400)
  }

  // 更新密码
  const user = db.prepare('SELECT uid FROM users WHERE email = ?').get(email)
  if (!user) {
    return fail('用户不存在', 404)
  }
  const hashedPassword = hashPassword(password)
  db.prepare('UPDATE users SET password = ? WHERE uid = ?').run(hashedPassword, (user as { uid: number }).uid)

  // 清除验证码
  verifyCodes.delete(email)

  return success(null, '密码重置成功')
})
