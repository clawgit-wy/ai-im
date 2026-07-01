/**
 * 添加联系人
 * 文档：POST /api/contact/add
 * (mock 仅返回成功，联系人关系不入库)
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event)
  return success(null)
})
