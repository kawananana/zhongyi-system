const ACCESS_TOKEN_KEY = 'accessToken'
const ADMIN_ACCESS_TOKEN_KEY = 'adminAccessToken'
const USER_BRIEF_KEY = 'userBrief'
const ADMIN_BRIEF_KEY = 'adminBrief'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getAdminAccessToken(): string | null {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)
}

export function setAdminAccessToken(token: string): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token)
}

export function clearAdminAccessToken(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
}

export function saveUserBrief(brief: unknown): void {
  localStorage.setItem(USER_BRIEF_KEY, JSON.stringify(brief))
}

export function loadUserBrief<T>(): T | null {
  const raw = localStorage.getItem(USER_BRIEF_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearUserBrief(): void {
  localStorage.removeItem(USER_BRIEF_KEY)
}

export function saveAdminBrief(brief: unknown): void {
  localStorage.setItem(ADMIN_BRIEF_KEY, JSON.stringify(brief))
}

export function loadAdminBrief<T>(): T | null {
  const raw = localStorage.getItem(ADMIN_BRIEF_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearAdminBrief(): void {
  localStorage.removeItem(ADMIN_BRIEF_KEY)
}
