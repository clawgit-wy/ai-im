import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const tokenUser = verifyToken(authHeader)

  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }

  // 查询完整用户信息
  const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(tokenUser.uid) as DBUser | undefined
  if (!user) {
    return fail('用户不存在', 404)
  }

  // 返回用户信息(排除密码)
  const { password: _, ...userInfo } = user
  return success(userInfo, '获取用户信息成功')
})
