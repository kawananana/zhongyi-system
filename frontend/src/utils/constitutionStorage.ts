import { CONSTITUTION_QUESTIONS } from '@/data/constitutionQuiz'
import type { ConstitutionResult } from '@/utils/constitutionEvaluate'

/** 旧版全局 key（未绑定用户，已废弃） */
export const CONSTITUTION_STORAGE_KEY = 'bencao_constitution_last'

export interface SavedConstitutionPayload {
  userId: number
  answers: Record<number, number>
  result: ConstitutionResult
  time?: string
}

function storageKeyForUser(userId: number): string {
  return `${CONSTITUTION_STORAGE_KEY}_${userId}`
}

function isCompletePayload(parsed: SavedConstitutionPayload | null | undefined): parsed is SavedConstitutionPayload {
  if (!parsed?.result || !parsed?.answers || parsed.userId == null) return false
  const answered = Object.keys(parsed.answers).length
  return answered >= CONSTITUTION_QUESTIONS.length
}

/** 清理旧版全局存储，避免不同账号串读 */
function purgeLegacyStorage(): void {
  try {
    localStorage.removeItem(CONSTITUTION_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function saveConstitution(
  userId: number,
  answers: Record<number, number>,
  result: ConstitutionResult,
): void {
  const payload: SavedConstitutionPayload = {
    userId,
    answers,
    result,
    time: new Date().toISOString(),
  }
  localStorage.setItem(storageKeyForUser(userId), JSON.stringify(payload))
  purgeLegacyStorage()
}

export function loadSavedConstitution(userId?: number | null): SavedConstitutionPayload | null {
  purgeLegacyStorage()
  if (userId == null) return null
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedConstitutionPayload
    if (!isCompletePayload(parsed)) return null
    if (parsed.userId !== userId) return null
    return parsed
  } catch {
    return null
  }
}

export function hasCompletedConstitutionQuiz(userId?: number | null): boolean {
  return loadSavedConstitution(userId) != null
}
