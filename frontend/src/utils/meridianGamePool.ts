import { MERIDIAN_ROUTES, MERIDIAN_SHORT } from '@/data/meridianRoutes'
import { meridianColor } from '@/utils/acupointMeta'

export type MeridianRound =
  | {
      type: 'sequence'
      id: string
      meridian: string
      meridianShort: string
      color: string
      sequence: string[]
      pool: string[]
    }
  | {
      type: 'match'
      id: string
      pointName: string
      answerMeridian: string
      meridianShort: string
      color: string
      options: { meridian: string; short: string }[]
    }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function meridianHex(meridian: string): string {
  return `#${meridianColor(meridian).toString(16).padStart(6, '0')}`
}

function pickSequence(route: string[], count = 4): string[] {
  if (route.length <= count) return [...route]
  const maxStart = route.length - count
  const start = Math.floor(Math.random() * (maxStart + 1))
  return route.slice(start, start + count)
}

function buildSequenceRound(meridian: string): MeridianRound {
  const route = MERIDIAN_ROUTES[meridian]
  const sequence = pickSequence(route, Math.min(4, route.length))
  return {
    type: 'sequence',
    id: `seq-${meridian}-${sequence.join('-')}`,
    meridian,
    meridianShort: MERIDIAN_SHORT[meridian] ?? meridian,
    color: meridianHex(meridian),
    sequence,
    pool: shuffle(sequence),
  }
}

function buildMatchRound(meridian: string): MeridianRound {
  const route = MERIDIAN_ROUTES[meridian]
  const pointName = route[Math.floor(Math.random() * route.length)]
  const others = shuffle(Object.keys(MERIDIAN_ROUTES).filter((m) => m !== meridian)).slice(0, 3)
  const options = shuffle([
    { meridian, short: MERIDIAN_SHORT[meridian] ?? meridian },
    ...others.map((m) => ({ meridian: m, short: MERIDIAN_SHORT[m] ?? m })),
  ])
  return {
    type: 'match',
    id: `match-${pointName}`,
    pointName,
    answerMeridian: meridian,
    meridianShort: MERIDIAN_SHORT[meridian] ?? meridian,
    color: meridianHex(meridian),
    options,
  }
}

export function buildMeridianRounds(count = 5): MeridianRound[] {
  const meridians = shuffle(Object.keys(MERIDIAN_ROUTES).filter((m) => MERIDIAN_ROUTES[m].length >= 3))
  const rounds: MeridianRound[] = []

  for (let i = 0; i < Math.min(3, meridians.length); i++) {
    rounds.push(buildSequenceRound(meridians[i]))
  }
  for (let i = 0; i < Math.min(2, meridians.length); i++) {
    rounds.push(buildMatchRound(meridians[(i + 2) % meridians.length]))
  }

  return shuffle(rounds).slice(0, count)
}
