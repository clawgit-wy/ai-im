import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)
  const pluginId = Number(body.pluginId)

  if (!pluginId) {
    return fail('插件ID不能为空')
  }

  const plugin = db.prepare('SELECT id FROM plugins WHERE id = ?').get(pluginId)
  if (!plugin) {
    return fail('插件不存在', 404)
  }

  const now = Date.now()
  db.prepare('UPDATE plugins SET status = 1, enabled = 1, installTime = ?, updateTime = ? WHERE id = ?').run(now, now, pluginId)

  const updated = db.prepare('SELECT * FROM plugins WHERE id = ?').get(pluginId)
  return success(updated, '安装插件成功')
})
