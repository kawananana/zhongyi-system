import { request } from '@/utils/request'

export interface UserProfile {
  id: number
  nickname: string
  phone: string
  avatar?: string
  gender?: number
  birthday?: string | null
  lastLoginTime?: string | null
  createTime?: string
}

export interface UpdateProfilePayload {
  nickname: string
  avatar?: string
  gender?: number
  birthday?: string | null
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export function fetchMyProfile() {
  return request<UserProfile>({
    url: '/auth/me',
    method: 'get',
  })
}

export function updateMyProfile(data: UpdateProfilePayload) {
  return request<UserProfile>({
    url: '/auth/me',
    method: 'put',
    data,
  })
}

export function changeMyPassword(data: ChangePasswordPayload) {
  return request<void>({
    url: '/auth/me/password',
    method: 'put',
    data,
  })
}

/** 手机号脱敏展示 */
export function maskPhone(phone?: string) {
  if (!phone || phone.length < 7) return phone || '—'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export const GENDER_OPTIONS = [
  { value: 0, label: '保密' },
  { value: 1, label: '男' },
  { value: 2, label: '女' },
] as const

export const AVATAR_PRESETS = [
  { label: '本草', value: '' },
  { label: '🌿', value: 'emoji:🌿' },
  { label: '🍵', value: 'emoji:🍵' },
  { label: '🧘', value: 'emoji:🧘' },
  { label: '🌸', value: 'emoji:🌸' },
] as const

export function avatarDisplay(avatar?: string, nickname?: string) {
  if (avatar?.startsWith('emoji:')) return avatar.slice(6)
  if (avatar) return ''
  return (nickname?.trim()?.[0] || '用').toUpperCase()
}

export function avatarImageUrl(avatar?: string) {
  if (!avatar || avatar.startsWith('emoji:')) return ''
  if (!avatar.includes('://') && !avatar.startsWith('/')) return ''
  return avatar
}
