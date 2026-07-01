import { defineEventHandler, getQuery, getHeader } from 'h3'

export default defineEventHandler((event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const query = getQuery(event)
  const id = Number(query.id)

  if (!id) {
    return fail('插件ID不能为空')
  }

  const plugin = db.prepare('SELECT id FROM plugins WHERE id = ?').get(id)
  if (!plugin) {
    return fail('插件不存在', 404)
  }

  db.prepare('UPDATE plugins SET status = 2, enabled = 0, updateTime = ? WHERE id = ?').run(Date.now(), id)

  return success(null, '卸载插件成功')
})
