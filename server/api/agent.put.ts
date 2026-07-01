import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.id) {
    return fail('智能体ID不能为空')
  }

  const agent = db.prepare('SELECT id FROM agents WHERE id = ?').get(body.id)
  if (!agent) {
    return fail('智能体不存在', 404)
  }

  // 动态构建更新语句
  const fields: string[] = []
  const values: any[] = []

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
  if (body.avatar !== undefined) { fields.push('avatar = ?'); values.push(body.avatar) }
  if (body.systemPrompt !== undefined) { fields.push('systemPrompt = ?'); values.push(body.systemPrompt) }
  if (body.modelConfig !== undefined) { fields.push('modelConfig = ?'); values.push(JSON.stringify(body.modelConfig)) }
  if (body.enabled !== undefined) { fields.push('enabled = ?'); values.push(body.enabled ? 1 : 0) }

  if (fields.length > 0) {
    values.push(body.id)
    db.prepare(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  }

  return success(null, '更新智能体成功')
})
