import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const tokenUser = verifyToken(authHeader)

  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }

  // 更新在线状态为离线
  db.prepare('UPDATE users SET onlineStatus = 2 WHERE uid = ?').run(tokenUser.uid)

  return success(null, '退出登录成功')
})
