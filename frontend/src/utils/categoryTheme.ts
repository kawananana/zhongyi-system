export interface CategoryTheme {
  bg: string
  iconColor: string
  icon: string
}

const themeMap: Record<string, CategoryTheme> = {
  'tonify-qi': {
    bg: 'linear-gradient(135deg, #f0f9f4 0%, #dcefe4 100%)',
    iconColor: '#1a5f3f',
    icon: '⬆',
  },
  'tonify-blood': {
    bg: 'linear-gradient(135deg, #f3f0ff 0%, #e8e4f7 100%)',
    iconColor: '#6b5b95',
    icon: '☽',
  },
  'clear-heat': {
    bg: 'linear-gradient(135deg, #e8f4fc 0%, #d4ebf7 100%)',
    iconColor: '#409eff',
    icon: '❄',
  },
  'release-exterior': {
    bg: 'linear-gradient(135deg, #fff8e6 0%, #ffefc2 100%)',
    iconColor: '#e6a23c',
    icon: '🌬',
  },
  digest: {
    bg: 'linear-gradient(135deg, #f5f0e8 0%, #ebe0d0 100%)',
    iconColor: '#8b6914',
    icon: '🌾',
  },
}

export function getCategoryTheme(key: string): CategoryTheme {
  return (
    themeMap[key] ?? {
      bg: 'linear-gradient(135deg, #f5f7fa 0%, #ebeef5 100%)',
      iconColor: '#1a5f3f',
      icon: '🍃',
    }
  )
}
