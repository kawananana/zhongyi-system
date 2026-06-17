import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  clearAdminAccessToken,
  clearAdminBrief,
  getAdminAccessToken,
  loadAdminBrief,
  saveAdminBrief,
  setAdminAccessToken,
} from '@/utils/auth'

export interface AdminBrief {
  adminId: number
  username: string
  role: string
}

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string | null>(getAdminAccessToken())
  const adminBrief = ref<AdminBrief | null>(loadAdminBrief<AdminBrief>())

  const isLoggedIn = () => !!token.value

  function setToken(accessToken: string) {
    token.value = accessToken
    setAdminAccessToken(accessToken)
  }

  function setAdminBrief(brief: AdminBrief | null) {
    adminBrief.value = brief
    if (brief) saveAdminBrief(brief)
    else clearAdminBrief()
  }

  function logout() {
    token.value = null
    adminBrief.value = null
    clearAdminAccessToken()
    clearAdminBrief()
  }

  return {
    token,
    adminBrief,
    isLoggedIn,
    setToken,
    setAdminBrief,
    logout,
  }
})
