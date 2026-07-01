/**
 * 通知列表
 * 文档：POST /api/session/msgNotice/list
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event).catch(() => ({}))
  return success(listResponse([], '', true))
})
