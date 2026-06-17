import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/api'
import { clearAccessToken, clearAdminAccessToken, getAccessToken, getAdminAccessToken } from '@/utils/auth'

const USER_LOGIN_PATH = '/login'
const ADMIN_LOGIN_PATH = '/admin/login'

function isAdminApi(url?: string): boolean {
  if (!url) return false
  return url.includes('/admin/')
}

function redirectToLogin(isAdmin: boolean) {
  const path = isAdmin ? ADMIN_LOGIN_PATH : USER_LOGIN_PATH
  if (isAdmin) clearAdminAccessToken()
  else clearAccessToken()
  if (window.location.pathname !== path) {
    window.location.href = path
  }
}

const service: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const adminApi = isAdminApi(config.url)
  const token = adminApi ? getAdminAccessToken() : getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const body = response.data as Result<unknown>

    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 401) {
        redirectToLogin(isAdminApi(response.config.url))
        return Promise.reject(new Error(body.message || '未登录'))
      }
      if (body.code !== 200) {
        ElMessage.error(body.message || '请求失败')
        return Promise.reject(new Error(body.message || '请求失败'))
      }
      return body.data
    }

    return response.data
  },
  (error) => {
    const httpStatus = error.response?.status
    const body = error.response?.data as Result<unknown> | undefined
    const adminApi = isAdminApi(error.config?.url)

    if (httpStatus === 401 || body?.code === 401) {
      redirectToLogin(adminApi)
      return Promise.reject(error)
    }

    const message = body?.message || error.message || '网络异常'
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

/** 已剥离 Result 包络的请求方法 */
export function request<T>(config: AxiosRequestConfig): Promise<T> {
  return service.request<unknown, T>(config)
}

export default service
