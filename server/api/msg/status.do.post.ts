/**
 * 消息已读状态
 * 文档：POST /api/msg/status.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event)
  return success({ read: 0, unread: 0 })
})
