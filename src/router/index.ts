import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { computedToken } from '@/services/http'

const { BASE_URL } = import.meta.env

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home/chat'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '/home/chat',
        name: 'chat',
        component: () => import('@/views/chat/index.vue')
      },
      {
        path: '/home/schedule',
        name: 'schedule',
        component: () => import('@/views/schedule/index.vue')
      },
      {
        path: '/home/robot',
        name: 'robot',
        component: () => import('@/views/robot/index.vue')
      },
      {
        path: '/home/agent',
        name: 'agent',
        component: () => import('@/views/agent/index.vue')
      },
      {
        path: '/home/plugin',
        name: 'plugin',
        component: () => import('@/views/plugin/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(BASE_URL),
  routes
})

/** 全局前置守卫 */
router.beforeEach(async (to, _from) => {
  const userStore = useUserStore()

  // 已登录状态：访问登录页重定向到主页
  if (to.path === '/login') {
    if (userStore.isLogin) {
      return '/home/chat'
    }
    return true
  }

  // 访问 /home 下路由：未登录时尝试恢复会话
  if (to.path.startsWith('/home')) {
    if (userStore.isLogin) {
      return true
    }
    // 如果 localStorage 中有 token，尝试验证恢复登录状态
    if (computedToken.get()) {
      const valid = await userStore.checkAuth()
      if (valid) {
        return true
      }
    }
    return '/login'
  }

  return true
})

export default router
