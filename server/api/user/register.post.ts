import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password } = body

  if (!name || !email || !password) {
    return fail('用户名、邮箱和密码不能为空')
  }

  // 检查邮箱是否已注册
  const existing = db.prepare('SELECT uid FROM users WHERE email = ?').get(email)
  if (existing) {
    return fail('该邮箱已被注册', 409)
  }

  // 创建新用户
  const uid = getNextId('users')
  const hashedPassword = hashPassword(password)
  db.prepare(
    'INSERT INTO users (uid, name, avatar, email, phone, password, onlineStatus, lastOptTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(uid, name, '👤', email, '', hashedPassword, 1, Date.now())

  const userInfo = { uid, name, avatar: '👤', email, phone: '', onlineStatus: 1, lastOptTime: Date.now() }
  return success(userInfo, '注册成功')
})
