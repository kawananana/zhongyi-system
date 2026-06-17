/** 药性展示样式（仅 UI 映射，非业务数据） */
export interface NatureTheme {
  bg: string
  iconColor: string
  icon: string
}

const themeMap: Record<string, NatureTheme> = {
  寒: { bg: 'linear-gradient(135deg, #e8f4fc 0%, #d4ebf7 100%)', iconColor: '#409eff', icon: '❄' },
  热: { bg: 'linear-gradient(135deg, #fff0e8 0%, #ffe0cc 100%)', iconColor: '#f56c6c', icon: '🔥' },
  温: { bg: 'linear-gradient(135deg, #fff8e6 0%, #ffefc2 100%)', iconColor: '#e6a23c', icon: '☀' },
  凉: { bg: 'linear-gradient(135deg, #f0ebff 0%, #e2d9f7 100%)', iconColor: '#9b59b6', icon: '🌿' },
  平: { bg: 'linear-gradient(135deg, #f0f9f4 0%, #dcefe4 100%)', iconColor: '#67c23a', icon: '⚖' },
}

const defaultTheme: NatureTheme = {
  bg: 'linear-gradient(135deg, #f5f7fa 0%, #ebeef5 100%)',
  iconColor: '#909399',
  icon: '🍃',
}

export function getNatureTheme(value: string): NatureTheme {
  const key = value?.replace(/性$/, '') || ''
  return themeMap[key] ?? defaultTheme
}
