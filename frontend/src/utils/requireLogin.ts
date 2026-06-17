import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

export function isUserLoggedIn() {
  return useUserStore().isLoggedIn()
}

/** 未登录时提示并跳转登录页，保留当前路径用于登录后回跳 */
export function requireUserLogin(router: Router, message = '请先登录后再操作'): boolean {
  if (isUserLoggedIn()) return true
  ElMessage.warning(message)
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
  return false
}
