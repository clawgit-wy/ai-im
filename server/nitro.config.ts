// Nitro 配置文件
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  // 兼容性日期
  compatibilityDate: '2026-07-01',
  // 运行时配置
  runtimeConfig: {
    // JWT 密钥
    jwtSecret: 'ai-im-dev-secret-key',
    // Token 过期时间(秒)
    tokenExpiresIn: 86400 * 7 // 7天
  },
  // 路由规则
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  }
})
