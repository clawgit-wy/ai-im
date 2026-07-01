/**
 * 根据账号查询手机号
 * 文档：POST /api/contact/phoneByAccount
 */
export default defineEventHandler(async (event) => {
  const tokenUser = verifyToken(getHeader(event, 'authorization'))
  if (!tokenUser) {
    return fail('未登录或登录已过期', 401)
  }
  const body = await readBody(event)
  const account = body?.account
  const user = db.prepare('SELECT phone FROM users WHERE email = ? OR phone = ? OR name = ?').get(account, account, account) as { phone: string } | undefined
  return success({ phone: user?.phone || '' })
})
