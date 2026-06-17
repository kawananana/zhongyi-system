import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  clearAccessToken,
  clearUserBrief,
  getAccessToken,
  loadUserBrief,
  saveUserBrief,
  setAccessToken,
} from '@/utils/auth'

export interface UserBrief {
  userId: number
  nickname: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const userBrief = ref<UserBrief | null>(loadUserBrief<UserBrief>())

  const isLoggedIn = () => !!token.value

  function setToken(accessToken: string) {
    token.value = accessToken
    setAccessToken(accessToken)
  }

  function setUserBrief(brief: UserBrief | null) {
    userBrief.value = brief
    if (brief) saveUserBrief(brief)
    else clearUserBrief()
  }

  function logout() {
    token.value = null
    userBrief.value = null
    clearAccessToken()
    clearUserBrief()
  }

  return {
    token,
    userBrief,
    isLoggedIn,
    setToken,
    setUserBrief,
    logout,
  }
})
