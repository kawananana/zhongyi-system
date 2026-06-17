import { FORMULA_ENTRIES, type FormulaEntry } from '@/data/formulaGameData'

export interface FormulaComposeRound {
  id: string
  formula: FormulaEntry
  /** 本轮需选出的 4 味核心药 */
  targetHerbs: string[]
  /** 供点选的 8 味药（含 4 正确 + 4 干扰） */
  herbPool: string[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickTargetHerbs(formula: FormulaEntry, count = 4): string[] {
  const others = formula.herbs.filter((h) => h !== formula.jun)
  const picked = shuffle(others).slice(0, count - 1)
  return shuffle([formula.jun, ...picked])
}

function buildHerbPool(target: string[], all: FormulaEntry[]): string[] {
  const targetSet = new Set(target)
  const distractorPool = [...new Set(all.flatMap((f) => f.herbs))].filter((h) => !targetSet.has(h))
  const distractors = shuffle(distractorPool).slice(0, 4)
  return shuffle([...target, ...distractors])
}

function buildRound(formula: FormulaEntry, all: FormulaEntry[]): FormulaComposeRound {
  const targetHerbs = pickTargetHerbs(formula)
  return {
    id: formula.name,
    formula,
    targetHerbs,
    herbPool: buildHerbPool(targetHerbs, all),
  }
}

export function buildFormulaComposeRounds(count = 4): FormulaComposeRound[] {
  return shuffle(FORMULA_ENTRIES)
    .slice(0, count)
    .map((f) => buildRound(f, FORMULA_ENTRIES))
}
