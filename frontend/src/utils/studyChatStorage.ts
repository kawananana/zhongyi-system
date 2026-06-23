/** 萌智伴学 · 对话历史本地暂存（按用户隔离） */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createTime: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  updateTime: string
}

/** 旧版全局 key（未绑定用户，已废弃） */
export const STUDY_CHAT_STORAGE_KEY = 'bencao_study_chat'

function storageKeyForUser(userId: number): string {
  return `${STUDY_CHAT_STORAGE_KEY}_${userId}`
}

function purgeLegacyStorage(): void {
  try {
    localStorage.removeItem(STUDY_CHAT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function loadStudyChatSessions(userId: number): ChatSession[] {
  purgeLegacyStorage()
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatSession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStudyChatSessions(userId: number, sessions: ChatSession[]): void {
  localStorage.setItem(storageKeyForUser(userId), JSON.stringify(sessions))
  purgeLegacyStorage()
}
