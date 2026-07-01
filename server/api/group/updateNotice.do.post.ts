/**
 * 修改群公告
 * 文档：POST /api/group/updateNotice.do
 * (sessions 表无 notice 字段，mock 仅返回成功)
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  await readBody(event)
  return success(null)
})
