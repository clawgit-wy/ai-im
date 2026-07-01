import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.id) {
    return fail('插件ID不能为空')
  }

  const plugin = db.prepare('SELECT id FROM plugins WHERE id = ?').get(body.id)
  if (!plugin) {
    return fail('插件不存在', 404)
  }

  db.prepare('UPDATE plugins SET enabled = ?, updateTime = ? WHERE id = ?').run(body.enabled ? 1 : 0, Date.now(), body.id)

  return success(null, '切换插件状态成功')
})
