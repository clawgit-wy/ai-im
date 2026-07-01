import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    return fail('邮箱不能为空')
  }

  const user = db.prepare('SELECT uid FROM users WHERE email = ?').get(email)
  if (!user) {
    return fail('该邮箱未注册', 404)
  }

  // 生成6位验证码并存入内存供后续校验
  const code = String(Math.floor(100000 + Math.random() * 900000))
  verifyCodes.set(email, { code, expires: Date.now() + 600000 })

  // 开发环境直接返回验证码（生产环境应通过邮件发送）
  console.log(`[VerifyCode] ${email} 验证码: ${code}`)

  return success(null, '验证码已发送')
})
