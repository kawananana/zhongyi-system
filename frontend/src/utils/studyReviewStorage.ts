/** 萌智伴学 · 复习计划本地暂存（按用户隔离） */

import { formatDateKey, getRecentDateKeys } from '@/utils/wellnessStorage'
import { loadStudyChatSessions } from '@/utils/studyChatStorage'

export type ReviewCategory = 'herb' | 'formula' | 'acupoint' | 'constitution' | 'quiz' | 'other'

export interface StudyReviewTask {
  id: string
  date: string
  title: string
  category: ReviewCategory
  done: boolean
  createTime: string
}

export interface ReviewPreset {
  category: ReviewCategory
  icon: string
  title: string
}

export const REVIEW_PRESETS: ReviewPreset[] = [
  { category: 'herb', icon: '🌿', title: '背诵 5 味常用药材功效' },
  { category: 'formula', icon: '📜', title: '复习经典方剂组成' },
  { category: 'acupoint', icon: '📍', title: '练习 3 个常用穴位定位' },
  { category: 'constitution', icon: '📋', title: '回顾九体质辨识要点' },
  { category: 'quiz', icon: '🎮', title: '完成 1 局趣学闯关' },
  { category: 'other', icon: '💬', title: '向 AI 提问 1 个疑难知识点' },
]

const SEVEN_DAY_PLAN: Omit<StudyReviewTask, 'id' | 'date' | 'done' | 'createTime'>[] = [
  { title: '四气五味 · 升降浮沉入门', category: 'herb' },
  { title: '补气类：人参、黄芪、白术', category: 'herb' },
  { title: '补血类：当归、熟地、白芍', category: 'herb' },
  { title: '方剂组成与君臣佐使', category: 'formula' },
  { title: '合谷、足三里、内关定位', category: 'acupoint' },
  { title: '九体质辨识与调养方向', category: 'constitution' },
  { title: '本周错题与薄弱点回顾', category: 'quiz' },
]

export const REVIEW_CATEGORY_LABEL: Record<ReviewCategory, string> = {
  herb: '本草',
  formula: '方剂',
  acupoint: '穴位',
  constitution: '体质',
  quiz: '闯关',
  other: '综合',
}

function tasksKey(userId?: number) {
  return userId ? `study_review_tasks_u${userId}` : 'study_review_tasks_guest'
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadReviewTasks(userId?: number): StudyReviewTask[] {
  return readJson<StudyReviewTask[]>(tasksKey(userId), [])
}

export function saveReviewTasks(tasks: StudyReviewTask[], userId?: number) {
  writeJson(tasksKey(userId), tasks)
}

function genId() {
  return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function tasksForDate(tasks: StudyReviewTask[], date: string) {
  return tasks.filter((t) => t.date === date)
}

export function addReviewTask(
  input: Pick<StudyReviewTask, 'date' | 'title' | 'category'>,
  userId?: number,
): StudyReviewTask[] {
  const tasks = loadReviewTasks(userId)
  const task: StudyReviewTask = {
    id: genId(),
    date: input.date,
    title: input.title,
    category: input.category,
    done: false,
    createTime: new Date().toISOString(),
  }
  const next = [...tasks, task]
  saveReviewTasks(next, userId)
  return next
}

export function toggleReviewTask(taskId: string, userId?: number): StudyReviewTask[] {
  const tasks = loadReviewTasks(userId).map((t) =>
    t.id === taskId ? { ...t, done: !t.done } : t,
  )
  saveReviewTasks(tasks, userId)
  return tasks
}

export function deleteReviewTask(taskId: string, userId?: number): StudyReviewTask[] {
  const tasks = loadReviewTasks(userId).filter((t) => t.id !== taskId)
  saveReviewTasks(tasks, userId)
  return tasks
}

export function generateSevenDayPlan(userId?: number, startDate = new Date()): StudyReviewTask[] {
  const existing = loadReviewTasks(userId)
  const keys: string[] = []
  const base = new Date(startDate)
  for (let i = 0; i < 7; i++) {
    const cur = new Date(base)
    cur.setDate(base.getDate() + i)
    keys.push(formatDateKey(cur))
  }
  const now = new Date().toISOString()
  const created: StudyReviewTask[] = SEVEN_DAY_PLAN.map((item, index) => ({
    id: genId(),
    date: keys[index] ?? formatDateKey(startDate),
    title: item.title,
    category: item.category,
    done: false,
    createTime: now,
  }))
  const next = [...existing, ...created]
  saveReviewTasks(next, userId)
  return next
}

export function countChatActivityByDate(userId?: number): Record<string, number> {
  if (userId == null) return {}
  const map: Record<string, number> = {}
  for (const session of loadStudyChatSessions(userId)) {
    for (const msg of session.messages) {
      if (msg.role !== 'user') continue
      const d = new Date(msg.createTime)
      if (Number.isNaN(d.getTime())) continue
      const key = formatDateKey(d)
      map[key] = (map[key] ?? 0) + 1
    }
    if (session.messages.length === 0 && session.updateTime) {
      const d = new Date(session.updateTime)
      if (!Number.isNaN(d.getTime())) {
        const key = formatDateKey(d)
        map[key] = (map[key] ?? 0) + 1
      }
    }
  }
  return map
}

export function calcReviewStreak(tasks: StudyReviewTask[]): number {
  const doneDates = new Set(
    tasks.filter((t) => t.done).map((t) => t.date),
  )
  if (!doneDates.size) return 0
  let streak = 0
  const cursor = new Date()
  for (;;) {
    const key = formatDateKey(cursor)
    if (doneDates.has(key)) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function weekReviewSummary(tasks: StudyReviewTask[], days = 7) {
  const keys = getRecentDateKeys(days)
  const scoped = tasks.filter((t) => keys.includes(t.date))
  const total = scoped.length
  const done = scoped.filter((t) => t.done).length
  return { total, done, keys }
}

export function dayReviewStatus(
  date: string,
  tasks: StudyReviewTask[],
  chatCount: number,
): 'none' | 'planned' | 'partial' | 'done' {
  const dayTasks = tasksForDate(tasks, date)
  if (!dayTasks.length && chatCount <= 0) return 'none'
  if (!dayTasks.length && chatCount > 0) return 'partial'
  const doneCount = dayTasks.filter((t) => t.done).length
  if (doneCount === dayTasks.length) return 'done'
  if (doneCount > 0 || chatCount > 0) return 'partial'
  return 'planned'
}
