import { request } from '@/utils/request'
import type { UserBrief } from '@/store/user'

export interface LoginResult {
  accessToken: string
  expiresIn: number
  userBrief: UserBrief
}

export function loginByPhone(phone: string, password: string) {
  return request<LoginResult>({
    url: '/auth/login',
    method: 'post',
    data: { phone, password },
  })
}

export function registerByPhone(data: {
  phone: string
  password: string
  nickname?: string
}) {
  return request<LoginResult>({
    url: '/auth/register',
    method: 'post',
    data,
  })
}
