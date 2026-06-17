import type { HerbItem } from '@/api/herb'

export interface HerbCategory {
  key: string
  label: string
  match: (herb: HerbItem) => boolean
}

export const HERB_CATEGORIES: HerbCategory[] = [
  { key: '', label: '全部', match: () => true },
  {
    key: 'tonify-qi',
    label: '补气类',
    match: (h) => /补气|益气|大补元气|补脾益肺/.test(h.efficacy || ''),
  },
  {
    key: 'tonify-blood',
    label: '安神类',
    match: (h) => /安神|宁心|养心|镇静|安眠|镇惊/.test(h.efficacy || ''),
  },
  {
    key: 'clear-heat',
    label: '清热类',
    match: (h) => /清热|清肝|解毒|泻火|燥湿/.test(h.efficacy || ''),
  },
  {
    key: 'release-exterior',
    label: '解表类',
    match: (h) => /疏散风热|解表|透疹|发汗解肌|发汗散寒|发散风寒|祛风散寒/.test(h.efficacy || ''),
  },
  {
    key: 'digest',
    label: '消食类',
    match: (h) => /消食|健脾|理气|化痰/.test(h.efficacy || ''),
  },
]

export function extractLatinName(alias?: string): string {
  if (!alias) return ''
  const first = alias.split(/[、,，]/)[0]?.trim() || ''
  return /^[A-Za-z]/.test(first) ? first : ''
}

export function extractChineseAliases(alias?: string): string {
  if (!alias) return ''
  return alias
    .split(/[、,，]/)
    .map((s) => s.trim())
    .filter((s) => s && !/^[A-Za-z]/.test(s))
    .join('、')
}

export function herbCategoryLabel(herb: HerbItem): string {
  const cat = HERB_CATEGORIES.find((c) => c.key && c.match(herb))
  return cat?.label.replace(/类$/, '') || '本草'
}

export function herbBadgeClass(herb: HerbItem): string {
  const label = herbCategoryLabel(herb)
  if (label.includes('补') || label.includes('虚')) return 'badge-tonify'
  if (label.includes('安') || label.includes('神')) return 'badge-calm'
  if (label.includes('清')) return 'badge-clear'
  if (label.includes('表')) return 'badge-release'
  if (label.includes('消')) return 'badge-digest'
  return 'badge-default'
}

/** 卡片/预览区共用的功效摘要（优先功效字段，避免展示过长简介） */
export function herbSummaryText(herb: HerbItem, maxLen = 72): string {
  const text = herb.efficacy || herb.propertyDesc || ''
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
}

export function formatPropertyLine(herb: HerbItem): string {
  const parts: string[] = []
  if (herb.nature) parts.push(`性${herb.nature}`)
  if (herb.taste) parts.push(`味${herb.taste.replace(/[、,，]/g, '、')}`)
  return parts.join(' ')
}

export function formatMeridianTags(herb: HerbItem): string[] {
  if (!herb.meridian) return []
  return herb.meridian.split(/[、,，]/).map((m) => {
    const t = m.trim()
    if (!t) return ''
    return t.startsWith('归') ? t : `归${t}${t.endsWith('经') ? '' : '经'}`
  }).filter(Boolean)
}
