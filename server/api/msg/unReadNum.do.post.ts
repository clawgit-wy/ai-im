/**
 * 未读消息数量
 * 文档：POST /api/msg/unReadNum.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event).catch(() => ({}))
  const row = db.prepare('SELECT COALESCE(SUM(unread), 0) as total FROM sessions').get() as { total: number } | undefined
  return success({ total: row?.total || 0 })
})
