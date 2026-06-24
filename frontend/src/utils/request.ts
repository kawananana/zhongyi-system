import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/api'
import { clearAccessToken, clearAdminAccessToken, getAccessToken, getAdminAccessToken } from '@/utils/auth'

const USER_LOGIN_PATH = '/login'
const ADMIN_LOGIN_PATH = '/admin/login'

export interface RequestConfig extends AxiosRequestConfig {
  /** 为 true 时不弹出错误提示（用于后台同步类请求） */
  silent?: boolean
}

type RequestInternalConfig = InternalAxiosRequestConfig & { silent?: boolean }

function isSilent(config?: AxiosRequestConfig): boolean {
  return !!(config as RequestInternalConfig | undefined)?.silent
}

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
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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
    const silent = isSilent(response.config)

    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 401) {
        redirectToLogin(isAdminApi(response.config.url))
        return Promise.reject(new Error(body.message || '未登录'))
      }
      if (body.code !== 200) {
        if (!silent) {
          ElMessage.error(body.message || '请求失败')
        }
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
    const silent = isSilent(error.config)

    if (httpStatus === 401 || body?.code === 401) {
      redirectToLogin(adminApi)
      return Promise.reject(error)
    }

    if (!silent) {
      const message = body?.message || error.message || '网络异常'
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

/** 已剥离 Result 包络的请求方法 */
export function request<T>(config: RequestConfig): Promise<T> {
  return service.request<unknown, T>(config)
}

export default service
