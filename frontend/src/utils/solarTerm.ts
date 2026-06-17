import { SOLAR_TERMS, type SolarTermEntry } from '@/data/seasonGameData'

/** 二十四节气近似起始月日（每年略有浮动，用于养生提示展示） */
const TERM_STARTS: { month: number; day: number; name: string }[] = [
  { month: 1, day: 6, name: '小寒' },
  { month: 1, day: 20, name: '大寒' },
  { month: 2, day: 4, name: '立春' },
  { month: 2, day: 19, name: '雨水' },
  { month: 3, day: 6, name: '惊蛰' },
  { month: 3, day: 21, name: '春分' },
  { month: 4, day: 5, name: '清明' },
  { month: 4, day: 20, name: '谷雨' },
  { month: 5, day: 6, name: '立夏' },
  { month: 5, day: 21, name: '小满' },
  { month: 6, day: 6, name: '芒种' },
  { month: 6, day: 21, name: '夏至' },
  { month: 7, day: 7, name: '小暑' },
  { month: 7, day: 23, name: '大暑' },
  { month: 8, day: 8, name: '立秋' },
  { month: 8, day: 23, name: '处暑' },
  { month: 9, day: 8, name: '白露' },
  { month: 9, day: 23, name: '秋分' },
  { month: 10, day: 8, name: '寒露' },
  { month: 10, day: 23, name: '霜降' },
  { month: 11, day: 7, name: '立冬' },
  { month: 11, day: 22, name: '小雪' },
  { month: 12, day: 7, name: '大雪' },
  { month: 12, day: 22, name: '冬至' },
]

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

function termDayOfYear(month: number, day: number, year: number): number {
  return dayOfYear(new Date(year, month - 1, day))
}

export function getCurrentSolarTerm(date = new Date()): SolarTermEntry {
  const year = date.getFullYear()
  const today = dayOfYear(date)
  let currentName = TERM_STARTS[TERM_STARTS.length - 1].name
  for (const t of TERM_STARTS) {
    if (today >= termDayOfYear(t.month, t.day, year)) {
      currentName = t.name
    }
  }
  return SOLAR_TERMS.find((s) => s.name === currentName) ?? SOLAR_TERMS[0]
}

export const DIET_TAG_OPTIONS = [
  { id: 'regular-meals', label: '三餐规律', icon: '🍱' },
  { id: 'light', label: '清淡饮食', icon: '🥗' },
  { id: 'tea', label: '养生茶饮', icon: '🍵' },
  { id: 'medicinal-food', label: '药膳调理', icon: '🍲' },
  { id: 'warm', label: '温热食补', icon: '♨️' },
  { id: 'no-cold', label: '忌生冷', icon: '🚫' },
  { id: 'veggies', label: '多食蔬果', icon: '🥬' },
  { id: 'water', label: '足量饮水', icon: '💧' },
] as const
