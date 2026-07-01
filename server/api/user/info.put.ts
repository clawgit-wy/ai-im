import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const tokenUser = verifyToken(authHeader)

  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  // 动态构建更新语句
  const fields: string[] = []
  const values: any[] = []

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.avatar !== undefined) { fields.push('avatar = ?'); values.push(body.avatar) }
  if (body.phone !== undefined) { fields.push('phone = ?'); values.push(body.phone) }

  fields.push('lastOptTime = ?')
  values.push(Date.now())
  values.push(tokenUser.uid)

  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE uid = ?`).run(...values)

  // 返回更新后的用户信息
  const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(tokenUser.uid) as DBUser | undefined
  if (!user) {
    return fail('用户不存在', 404)
  }

  const { password: _, ...userInfo } = user
  return success(userInfo, '更新成功')
})
