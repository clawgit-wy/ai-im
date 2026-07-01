import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.name) {
    return fail('工作流名称不能为空')
  }

  const id = getNextId('workflows')
  const workflow = {
    id,
    name: body.name,
    description: body.description || '',
    avatar: body.avatar || '🤖',
    prompt: body.prompt || '',
    apiKey: body.apiKey || '',
    endpoint: body.endpoint || '',
    enabled: body.enabled !== undefined ? (body.enabled ? 1 : 0) : 1,
    createTime: Date.now()
  }

  db.prepare(
    'INSERT INTO workflows (id, name, description, avatar, prompt, apiKey, endpoint, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(workflow.id, workflow.name, workflow.description, workflow.avatar, workflow.prompt, workflow.apiKey, workflow.endpoint, workflow.enabled, workflow.createTime)

  return success(workflow, '创建工作流成功')
})
