import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.id) {
    return fail('工作流ID不能为空')
  }

  const workflow = db.prepare('SELECT id FROM workflows WHERE id = ?').get(body.id)
  if (!workflow) {
    return fail('工作流不存在', 404)
  }

  // 动态构建更新语句
  const fields: string[] = []
  const values: any[] = []

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
  if (body.avatar !== undefined) { fields.push('avatar = ?'); values.push(body.avatar) }
  if (body.prompt !== undefined) { fields.push('prompt = ?'); values.push(body.prompt) }
  if (body.apiKey !== undefined) { fields.push('apiKey = ?'); values.push(body.apiKey) }
  if (body.endpoint !== undefined) { fields.push('endpoint = ?'); values.push(body.endpoint) }
  if (body.enabled !== undefined) { fields.push('enabled = ?'); values.push(body.enabled ? 1 : 0) }

  if (fields.length > 0) {
    values.push(body.id)
    db.prepare(`UPDATE workflows SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  }

  return success(null, '更新工作流成功')
})
