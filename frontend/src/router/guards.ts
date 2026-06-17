import type { Router } from 'vue-router'
import { useAdminStore, useUserStore } from '@/store'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const userStore = useUserStore()
    const adminStore = useAdminStore()

    const isAdminRoute = to.path.startsWith('/admin')
    const isAdminLogin = to.path === '/admin/login'
    const isUserLogin = to.path === '/login'

    if (isAdminLogin) {
      if (adminStore.isLoggedIn()) {
        return { path: '/admin/dashboard' }
      }
      return true
    }

    if (isUserLogin) {
      if (userStore.isLoggedIn()) {
        return { path: '/' }
      }
      return true
    }

    if (isAdminRoute) {
      if (!adminStore.isLoggedIn()) {
        return { path: '/admin/login', query: { redirect: to.fullPath } }
      }
      return true
    }

    if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    return true
  })
}
