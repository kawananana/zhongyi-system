import { fetchHerbPage, type HerbItem } from '@/api/herb'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  hint?: string
  herbName?: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOptions(correct: string, pool: string[], count = 4): { options: string[]; answerIndex: number } {
  const uniq = [...new Set(pool.filter(Boolean))].filter((x) => x !== correct)
  const wrong = shuffle(uniq).slice(0, count - 1)
  const options = shuffle([correct, ...wrong])
  return { options, answerIndex: options.indexOf(correct) }
}

function buildNatureQuestion(herb: HerbItem, all: HerbItem[]): QuizQuestion | null {
  if (!herb.nature) return null
  const pool = all.map((h) => h.nature).filter(Boolean) as string[]
  const { options, answerIndex } = pickOptions(herb.nature, pool)
  return {
    id: `n-${herb.id}`,
    prompt: `「${herb.herbName}」的「四气」是？`,
    options,
    answerIndex,
    hint: herb.efficacy?.slice(0, 40),
    herbName: herb.herbName,
  }
}

function buildTasteQuestion(herb: HerbItem, all: HerbItem[]): QuizQuestion | null {
  if (!herb.taste) return null
  const pool = all.map((h) => h.taste).filter(Boolean) as string[]
  const { options, answerIndex } = pickOptions(herb.taste, pool)
  return {
    id: `t-${herb.id}`,
    prompt: `「${herb.herbName}」的「五味」是？`,
    options,
    answerIndex,
    herbName: herb.herbName,
  }
}

function buildMeridianQuestion(herb: HerbItem, all: HerbItem[]): QuizQuestion | null {
  if (!herb.meridian) return null
  const pool = all.map((h) => h.meridian).filter(Boolean) as string[]
  const { options, answerIndex } = pickOptions(herb.meridian, pool)
  return {
    id: `m-${herb.id}`,
    prompt: `「${herb.herbName}」归哪一经？`,
    options,
    answerIndex,
    herbName: herb.herbName,
  }
}

function buildEfficacyQuestion(herb: HerbItem, all: HerbItem[]): QuizQuestion | null {
  if (!herb.efficacy || herb.efficacy.length < 4) return null
  const snippet = herb.efficacy.length > 12 ? `${herb.efficacy.slice(0, 12)}…` : herb.efficacy
  const pool = all.map((h) => h.herbName)
  const { options, answerIndex } = pickOptions(herb.herbName, pool)
  return {
    id: `e-${herb.id}`,
    prompt: `下列哪味药的功效包含「${snippet}」？`,
    options,
    answerIndex,
    herbName: herb.herbName,
  }
}

export function buildQuizQuestions(herbs: HerbItem[], count = 8): QuizQuestion[] {
  const valid = herbs.filter((h) => h.herbName && (h.nature || h.taste || h.meridian || h.efficacy))
  const builders = [buildNatureQuestion, buildTasteQuestion, buildMeridianQuestion, buildEfficacyQuestion]
  const questions: QuizQuestion[] = []
  const used = new Set<string>()

  for (const herb of shuffle(valid)) {
    if (questions.length >= count) break
    for (const build of shuffle(builders)) {
      const q = build(herb, valid)
      if (!q || used.has(q.id)) continue
      used.add(q.id)
      questions.push(q)
      break
    }
  }
  return questions.slice(0, count)
}

export async function loadHerbPool(pageSize = 50): Promise<HerbItem[]> {
  const res = await fetchHerbPage({ page: 1, pageSize, sort: 'id' })
  return (res.list ?? []).filter((h) => h.herbName)
}

export function pickMatchHerbs(herbs: HerbItem[], count = 4): HerbItem[] {
  const withImage = herbs.filter((h) => h.coverImage)
  const pool = withImage.length >= count ? withImage : herbs
  return shuffle(pool).slice(0, count)
}

export interface MemoryPair {
  id: string
  label: string
  pairKey: string
  kind: 'name' | 'prop'
}

export function buildMemoryPairs(herbs: HerbItem[], pairCount = 4): MemoryPair[] {
  const selected = shuffle(herbs.filter((h) => h.nature || h.meridian)).slice(0, pairCount)
  const cards: MemoryPair[] = []
  selected.forEach((h) => {
    const key = `h-${h.id}`
    const prop = [h.nature ? `性${h.nature}` : '', h.taste ? `味${h.taste}` : '', h.meridian ? `归${h.meridian}` : '']
      .filter(Boolean)
      .join(' · ')
    cards.push({ id: `${key}-n`, label: h.herbName, pairKey: key, kind: 'name' })
    cards.push({ id: `${key}-p`, label: prop || h.efficacy?.slice(0, 16) || '—', pairKey: key, kind: 'prop' })
  })
  return shuffle(cards)
}
