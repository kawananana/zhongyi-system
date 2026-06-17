/** 筛选项展示图标（UI 映射，非业务数据） */
const natureIcons: Record<string, string> = {
  寒: '❄',
  热: '🔥',
  温: '☀',
  凉: '🌿',
  平: '⚖',
}

const tasteIcons: Record<string, string> = {
  辛: '🌶',
  甘: '🍯',
  酸: '🍋',
  苦: '🍵',
  咸: '🧂',
}

const meridianIcons: Record<string, string> = {
  肝: '🫀',
  心: '❤',
  脾: '🔶',
  肺: '🫁',
  肾: '💧',
}

export function iconForNature(value: string) {
  return natureIcons[value] ?? '🍃'
}

export function iconForTaste(value: string) {
  return tasteIcons[value.replace(/味$/, '')] ?? '◆'
}

export function iconForMeridian(value: string) {
  const key = value.replace(/^归/, '').replace(/经$/, '')
  return meridianIcons[key] ?? '◎'
}
