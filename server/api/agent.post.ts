import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const user = verifyToken(authHeader)

  if (!user) {
    return fail('未登录或登录已过期', 401)
  }

  const body = await readBody(event)

  if (!body.name) {
    return fail('智能体名称不能为空')
  }

  const id = getNextId('agents')
  const modelConfig = body.modelConfig || { model: 'gpt-4', temperature: 0.7, maxTokens: 4096 }
  const agent = {
    id,
    name: body.name,
    description: body.description || '',
    avatar: body.avatar || '🤖',
    systemPrompt: body.systemPrompt || '',
    modelConfig,
    enabled: body.enabled !== undefined ? (body.enabled ? 1 : 0) : 1,
    createTime: Date.now()
  }

  db.prepare(
    'INSERT INTO agents (id, name, description, avatar, systemPrompt, modelConfig, enabled, createTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(agent.id, agent.name, agent.description, agent.avatar, agent.systemPrompt, JSON.stringify(modelConfig), agent.enabled, agent.createTime)

  return success(agent, '创建智能体成功')
})
