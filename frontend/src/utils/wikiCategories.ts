export interface WikiCategory {
  key: string
  label: string
}

export const WIKI_SIDEBAR_CATEGORIES: WikiCategory[] = [
  { key: 'acupuncture', label: '针灸' },
  { key: 'moxibustion', label: '艾灸' },
  { key: 'tuina', label: '推拿' },
  { key: 'cupping', label: '拔罐' },
  { key: 'diet', label: '药膳食疗' },
  { key: 'exercise', label: '功法锻炼' },
  { key: 'lifestyle', label: '起居养生' },
]

export const WIKI_CONTENT_KINDS = [
  { key: 'article', label: '文章' },
  { key: 'course', label: '课程' },
] as const

export type WikiContentKind = (typeof WIKI_CONTENT_KINDS)[number]['key']

export const WIKI_DEFAULT_CATEGORY = WIKI_SIDEBAR_CATEGORIES[0]?.key ?? 'acupuncture'

export function categoryLabel(key: string): string {
  return WIKI_SIDEBAR_CATEGORIES.find((c) => c.key === key)?.label ?? key
}
