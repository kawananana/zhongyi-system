import { SOLAR_TERMS, type SolarTermEntry } from '@/data/seasonGameData'

export interface GameQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  hint?: string
  tag?: string
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

function buildTipQuestion(term: SolarTermEntry, all: SolarTermEntry[]): GameQuestion {
  const pool = all.map((t) => t.tip)
  const { options, answerIndex } = pickOptions(term.tip, pool)
  return {
    id: `tip-${term.name}`,
    prompt: `「${term.name}」时节的养生要点是？`,
    options,
    answerIndex,
    hint: `所属季节：${term.season}季`,
    tag: term.name,
  }
}

function buildDietQuestion(term: SolarTermEntry, all: SolarTermEntry[]): GameQuestion {
  const pool = all.map((t) => t.diet)
  const { options, answerIndex } = pickOptions(term.diet, pool)
  return {
    id: `diet-${term.name}`,
    prompt: `「${term.name}」时节，饮食上宜？`,
    options,
    answerIndex,
    hint: term.tip,
    tag: term.name,
  }
}

function buildSeasonQuestion(term: SolarTermEntry, all: SolarTermEntry[]): GameQuestion {
  const pool = ['春', '夏', '秋', '冬']
  const { options, answerIndex } = pickOptions(term.season, pool)
  return {
    id: `season-${term.name}`,
    prompt: `「${term.name}」属于哪个季节？`,
    options,
    answerIndex,
    tag: term.name,
  }
}

function buildTermNameQuestion(term: SolarTermEntry, all: SolarTermEntry[]): GameQuestion {
  const pool = all.map((t) => t.name)
  const { options, answerIndex } = pickOptions(term.name, pool)
  const snippet = term.tip.length > 18 ? `${term.tip.slice(0, 18)}…` : term.tip
  return {
    id: `name-${term.name}`,
    prompt: `「${snippet}」描述的是哪个节气？`,
    options,
    answerIndex,
    tag: term.name,
  }
}

function buildAvoidQuestion(term: SolarTermEntry, all: SolarTermEntry[]): GameQuestion | null {
  if (!term.avoid) return null
  const withAvoid = all.filter((t) => t.avoid)
  const pool = withAvoid.map((t) => t.avoid!)
  const { options, answerIndex } = pickOptions(term.avoid, pool)
  return {
    id: `avoid-${term.name}`,
    prompt: `「${term.name}」时节，应当注意？`,
    options,
    answerIndex,
    hint: term.tip,
    tag: term.name,
  }
}

export function buildSeasonQuestions(count = 8): GameQuestion[] {
  const all = SOLAR_TERMS
  const builders = [buildTipQuestion, buildDietQuestion, buildSeasonQuestion, buildTermNameQuestion, buildAvoidQuestion]
  const questions: GameQuestion[] = []
  const used = new Set<string>()

  for (const term of shuffle(all)) {
    if (questions.length >= count) break
    for (const build of shuffle(builders)) {
      const q = build(term, all)
      if (!q || used.has(q.id)) continue
      used.add(q.id)
      questions.push(q)
      break
    }
  }
  return questions.slice(0, count)
}
