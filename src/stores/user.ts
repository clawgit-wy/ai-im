import { ref } from 'vue'
import { defineStore } from 'pinia'
import { StoresEnum } from '@/enums'
import apis from '@/services/apis'
import { computedToken } from '@/services/http'
import type { UserInfo } from '@/services/types'

export const useUserStore = defineStore(StoresEnum.USER, () => {
  /** 用户信息 */
  const userInfo = ref<Partial<UserInfo>>({})
  /** 是否登录 */
  const isLogin = ref(false)
  /** 访问令牌 */
  const token = ref('')

  /** 登录 */
  async function login(account: string, password: string) {
    const res = await apis.login({ account, password })
    userInfo.value = res.userInfo
    token.value = res.token
    isLogin.value = true
    computedToken.set(res.token)
    localStorage.setItem('USER_INFO', JSON.stringify(res.userInfo))
    return res
  }

  /** 退出登录 */
  function logout() {
    userInfo.value = {}
    token.value = ''
    isLogin.value = false
    computedToken.clear()
    localStorage.removeItem('USER_INFO')
  }

  /** 更新用户信息 */
  function updateUserInfo(info: Partial<UserInfo>) {
    userInfo.value = { ...userInfo.value, ...info }
    localStorage.setItem('USER_INFO', JSON.stringify(userInfo.value))
  }

  /**
   * 验证 token 是否有效
   * 从 localStorage 读取 token 并调用 /api/user/info 验证
   * @returns 验证成功返回 true，失败返回 false
   */
  async function checkAuth(): Promise<boolean> {
    const savedToken = computedToken.get()
    if (!savedToken) {
      return false
    }
    try {
      const info = await apis.getUserInfo()
      userInfo.value = info
      token.value = savedToken
      isLogin.value = true
      localStorage.setItem('USER_INFO', JSON.stringify(info))
      return true
    } catch {
      // token 无效，清除登录状态
      logout()
      return false
    }
  }

  return {
    userInfo,
    isLogin,
    token,
    login,
    logout,
    updateUserInfo,
    checkAuth
  }
})
