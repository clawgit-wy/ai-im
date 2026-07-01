/**
 * 消息已读上报
 * 文档：POST /api/msg/readMsg.do
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event)
  return success(null)
})
