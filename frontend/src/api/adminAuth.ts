import { request } from '@/utils/request'
import type { AdminBrief } from '@/store/admin'

export interface AdminLoginResult {
  accessToken: string
  expiresIn: number
  adminBrief: AdminBrief
}

export function loginByUsername(username: string, password: string) {
  return request<AdminLoginResult>({
    url: '/admin/auth/login',
    method: 'post',
    data: { username, password },
  })
}
