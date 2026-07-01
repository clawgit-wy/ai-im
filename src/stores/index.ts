import { createPersistedState } from 'pinia-plugin-persistedstate'

export const pinia = createPinia()
// 仅对显式配置 persist 的 store 启用持久化
pinia.use(
  createPersistedState({
    auto: false
  })
)
