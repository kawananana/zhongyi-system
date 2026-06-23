import { fetchHerbPage, type HerbItem } from '@/api/herb'

export interface CareTextSegment {
  type: 'text' | 'herb'
  value: string
  herbId?: number
}

/** 文案中的常用名 → 图鉴药材名 */
const HERB_TEXT_ALIASES: Record<string, string> = {
  红枣: '大枣',
  白人参: '人参',
  生甘草: '甘草',
  紫苏叶: '紫苏',
  鲜青蒿: '青蒿',
  枸杞子: '枸杞',
  熟地: '熟地黄',
  高良姜: '良姜',
  橘子皮: '陈皮',
  小茴香: '茴香',
}

let cachedHerbIndex: Map<string, number> | null = null

function addIndexEntry(index: Map<string, number>, name: string, id: number) {
  const key = name.trim()
  if (key.length < 2) return
  if (!index.has(key)) index.set(key, id)
}

export function buildHerbLinkIndex(herbs: HerbItem[]): Map<string, number> {
  const index = new Map<string, number>()

  for (const herb of herbs) {
    addIndexEntry(index, herb.herbName, herb.id)
    if (herb.alias) {
      for (const part of herb.alias.split(/[、,，；;·\s]+/)) {
        if (part && !/^[A-Za-z]/.test(part)) {
          addIndexEntry(index, part, herb.id)
        }
      }
    }
  }

  for (const [alias, canonical] of Object.entries(HERB_TEXT_ALIASES)) {
    const id = index.get(canonical)
    if (id) addIndexEntry(index, alias, id)
  }

  return index
}

export async function loadHerbLinkIndex(): Promise<Map<string, number>> {
  if (cachedHerbIndex) return cachedHerbIndex

  const herbs: HerbItem[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const res = await fetchHerbPage({ page, pageSize })
    const list = res.list ?? []
    herbs.push(...list)
    const total = res.total ?? herbs.length
    if (herbs.length >= total || list.length === 0) break
    page += 1
  }

  cachedHerbIndex = buildHerbLinkIndex(herbs)
  return cachedHerbIndex
}

export function parseCareTextSegments(
  text: string,
  index: Map<string, number>,
): CareTextSegment[] {
  if (!text || index.size === 0) return [{ type: 'text', value: text }]

  const names = [...index.keys()].sort((a, b) => b.length - a.length)
  const segments: CareTextSegment[] = []
  let i = 0

  while (i < text.length) {
    let matched = false
    for (const name of names) {
      if (!text.startsWith(name, i)) continue
      segments.push({ type: 'herb', value: name, herbId: index.get(name) })
      i += name.length
      matched = true
      break
    }
    if (matched) continue

    const last = segments[segments.length - 1]
    if (last?.type === 'text') last.value += text[i]
    else segments.push({ type: 'text', value: text[i] })
    i += 1
  }

  return segments.length ? segments : [{ type: 'text', value: text }]
}
