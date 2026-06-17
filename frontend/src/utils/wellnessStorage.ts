/** 智趣养生 · 生活记录本地暂存（按用户隔离） */

export interface CheckinPlan {
  id: string
  title: string
  icon: string
}

export interface DailyLog {
  date: string
  diet: string
  lifestyle: string
  mood: number
  checkins: Record<string, boolean>
  dietTags?: string[]
  sleepTime?: string
  wakeTime?: string
}

const DEFAULT_PLANS: CheckinPlan[] = [
  { id: 'water', title: '晨起一杯温水', icon: '💧' },
  { id: 'breakfast', title: '规律早餐', icon: '🥣' },
  { id: 'exercise', title: '养生操/散步 20 分钟', icon: '🧘' },
  { id: 'sleep', title: '23 点前入睡', icon: '🌙' },
]

function plansKey(userId?: number) {
  return userId ? `wellness_plans_u${userId}` : 'wellness_plans_guest'
}

function logsKey(userId?: number) {
  return userId ? `wellness_logs_u${userId}` : 'wellness_logs_guest'
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

export function loadCheckinPlans(userId?: number): CheckinPlan[] {
  const plans = readJson<CheckinPlan[]>(plansKey(userId), [])
  return plans.length ? plans : [...DEFAULT_PLANS]
}

export function saveCheckinPlans(plans: CheckinPlan[], userId?: number) {
  writeJson(plansKey(userId), plans)
}

export function loadDailyLogs(userId?: number): Record<string, DailyLog> {
  return readJson<Record<string, DailyLog>>(logsKey(userId), {})
}

export function saveDailyLog(log: DailyLog, userId?: number) {
  const all = loadDailyLogs(userId)
  all[log.date] = log
  writeJson(logsKey(userId), all)
}

export function deleteDailyLog(date: string, userId?: number) {
  const all = loadDailyLogs(userId)
  delete all[date]
  writeJson(logsKey(userId), all)
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isLogEmpty(log: DailyLog | undefined): boolean {
  if (!log) return true
  const hasText = !!(log.diet?.trim() || log.lifestyle?.trim())
  const hasCheckin = Object.values(log.checkins || {}).some(Boolean)
  const hasTags = !!(log.dietTags?.length)
  const hasSleep = !!(log.sleepTime || log.wakeTime)
  return !(hasText || hasCheckin || hasTags || hasSleep || (log.mood && log.mood !== 3))
}

export function hasRecord(log: DailyLog | undefined): boolean {
  if (!log) return false
  return !isLogEmpty(log)
}

export function calcCheckinRate(log: DailyLog, planCount: number): number {
  if (!planCount) return 0
  const done = Object.values(log.checkins || {}).filter(Boolean).length
  return Math.round((done / planCount) * 100)
}

/** 连续有记录的天数（含今日，从今天往前数） */
export function calcRecordStreak(logs: Record<string, DailyLog>, today = new Date()): number {
  let streak = 0
  const d = new Date(today)
  for (let i = 0; i < 365; i++) {
    const key = formatDateKey(d)
    if (hasRecord(logs[key])) {
      streak += 1
      d.setDate(d.getDate() - 1)
    } else if (i === 0) {
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function getRecentDateKeys(days: number, from = new Date()): string[] {
  const keys: string[] = []
  const d = new Date(from)
  for (let i = days - 1; i >= 0; i--) {
    const cur = new Date(d)
    cur.setDate(d.getDate() - i)
    keys.push(formatDateKey(cur))
  }
  return keys
}

export function avgMood(logs: Record<string, DailyLog>, dateKeys: string[]): number | null {
  const moods = dateKeys.map((k) => logs[k]?.mood).filter((m): m is number => !!m && m > 0)
  if (!moods.length) return null
  return Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10
}

export function weekCheckinSummary(
  logs: Record<string, DailyLog>,
  plans: CheckinPlan[],
  from = new Date(),
): { date: string; rate: number; mood: number }[] {
  return getRecentDateKeys(7, from).map((date) => {
    const log = logs[date]
    return {
      date,
      rate: log ? calcCheckinRate(log, plans.length) : 0,
      mood: log?.mood ?? 0,
    }
  })
}

export interface HistoryLogItem {
  date: string
  log: DailyLog
  checkinDone: number
  checkinTotal: number
  checkinRate: number
  status: 'full' | 'partial'
}

export function listHistoryLogs(
  logs: Record<string, DailyLog>,
  planCount: number,
): HistoryLogItem[] {
  return Object.entries(logs)
    .filter(([, log]) => hasRecord(log))
    .map(([date, log]) => {
      const done = Object.values(log.checkins || {}).filter(Boolean).length
      return {
        date,
        log,
        checkinDone: done,
        checkinTotal: planCount,
        checkinRate: calcCheckinRate(log, planCount),
        status: done >= planCount && planCount > 0 ? 'full' : 'partial',
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function formatDisplayDate(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`)
  if (Number.isNaN(d.getTime())) return dateKey
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${week}`
}

export function isTodayKey(dateKey: string): boolean {
  return dateKey === formatDateKey(new Date())
}

export function isYesterdayKey(dateKey: string): boolean {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dateKey === formatDateKey(d)
}

export function formatRelativeDateLabel(dateKey: string): string {
  if (isTodayKey(dateKey)) return '今天'
  if (isYesterdayKey(dateKey)) return '昨天'
  return formatDisplayDate(dateKey)
}

export interface MonthHistoryGroup {
  key: string
  label: string
  items: HistoryLogItem[]
  fullCount: number
  avgRate: number
}

export function groupHistoryByMonth(items: HistoryLogItem[]): MonthHistoryGroup[] {
  const map = new Map<string, HistoryLogItem[]>()
  for (const item of items) {
    const key = item.date.slice(0, 7)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, groupItems]) => ({
      key,
      label: `${key.slice(0, 4)}年${Number(key.slice(5, 7))}月`,
      items: groupItems,
      fullCount: groupItems.filter((i) => i.status === 'full').length,
      avgRate: Math.round(groupItems.reduce((s, i) => s + i.checkinRate, 0) / groupItems.length),
    }))
}

export function formatShortDateLabel(dateKey: string): string {
  if (isTodayKey(dateKey)) return '今天'
  if (isYesterdayKey(dateKey)) return '昨天'
  const d = new Date(`${dateKey}T12:00:00`)
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getMonth() + 1}/${d.getDate()} 周${week}`
}
