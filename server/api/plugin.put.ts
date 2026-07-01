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

  // 动态构建更新语句
  const fields: string[] = []
  const values: any[] = []

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
  if (body.icon !== undefined) { fields.push('icon = ?'); values.push(body.icon) }
  if (body.enabled !== undefined) { fields.push('enabled = ?'); values.push(body.enabled ? 1 : 0) }

  fields.push('updateTime = ?')
  values.push(Date.now())
  values.push(body.id)

  db.prepare(`UPDATE plugins SET ${fields.join(', ')} WHERE id = ?`).run(...values)

  return success(null, '更新插件配置成功')
})
