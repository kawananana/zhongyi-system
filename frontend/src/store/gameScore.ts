import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ADVENTURE_LEVELS } from '@/data/wellnessGames'

const STORAGE_KEY = 'bencao_game_scores'

export type GameScoreKey = 'quiz' | 'match' | 'memory' | 'formula' | 'season' | 'meridian'

export interface GameStats {
  totalPoints: number
  quizBest: number
  matchBest: number
  memoryBest: number
  formulaBest: number
  seasonBest: number
  meridianBest: number
  quizPlayed: number
  matchPlayed: number
  memoryPlayed: number
  formulaPlayed: number
  seasonPlayed: number
  meridianPlayed: number
  /** 各关卡历史最佳星级 0～3 */
  levelStars: Record<string, number>
}

function defaultStats(): GameStats {
  return {
    totalPoints: 0,
    quizBest: 0,
    matchBest: 0,
    memoryBest: 0,
    formulaBest: 0,
    seasonBest: 0,
    meridianBest: 0,
    quizPlayed: 0,
    matchPlayed: 0,
    memoryPlayed: 0,
    formulaPlayed: 0,
    seasonPlayed: 0,
    meridianPlayed: 0,
    levelStars: {},
  }
}

function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStats()
    const parsed = JSON.parse(raw) as Partial<GameStats> & { completedLevels?: string[] }
    const stats = { ...defaultStats(), ...parsed, levelStars: { ...parsed.levelStars } }
    if (!stats.levelStars) stats.levelStars = {}
    // 兼容旧版「已通关」记录
    if (parsed.completedLevels?.length) {
      for (const id of parsed.completedLevels) {
        if (!stats.levelStars[id]) stats.levelStars[id] = 1
      }
    }
    return stats
  } catch {
    return defaultStats()
  }
}

export const useGameScoreStore = defineStore('gameScore', () => {
  const stats = ref<GameStats>(loadStats())

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats.value))
  }

  const totalPoints = computed(() => stats.value.totalPoints)

  function getLevelStars(levelId: string) {
    return stats.value.levelStars[levelId] ?? 0
  }

  function hasPlayedLevel(levelId: string) {
    return levelId in stats.value.levelStars
  }

  const playableLevels = computed(() => ADVENTURE_LEVELS.filter((l) => l.status === 'beta'))

  const totalStars = computed(() =>
    playableLevels.value.reduce((sum, l) => sum + (stats.value.levelStars[l.id] ?? 0), 0),
  )

  const maxStars = computed(() => playableLevels.value.length * 3)

  const playedCount = computed(() =>
    playableLevels.value.filter((l) => hasPlayedLevel(l.id)).length,
  )

  const treasuryOpen = computed(() =>
    playableLevels.value.length > 0 &&
    playableLevels.value.every((l) => (stats.value.levelStars[l.id] ?? 0) > 0),
  )

  function addPoints(points: number, game: GameScoreKey, levelId?: string, stars?: number) {
    if (levelId !== undefined && stars !== undefined) {
      const prev = stats.value.levelStars[levelId] ?? 0
      if (stars > prev) {
        stats.value.levelStars[levelId] = stars
      } else if (!stats.value.levelStars[levelId]) {
        stats.value.levelStars[levelId] = stars
      }
    }

    if (points <= 0) {
      if (levelId !== undefined && stars !== undefined) persist()
      return
    }

    stats.value.totalPoints += points
    if (game === 'quiz') {
      stats.value.quizPlayed += 1
      stats.value.quizBest = Math.max(stats.value.quizBest, points)
    } else if (game === 'match') {
      stats.value.matchPlayed += 1
      stats.value.matchBest = Math.max(stats.value.matchBest, points)
    } else if (game === 'memory') {
      stats.value.memoryPlayed += 1
      stats.value.memoryBest = Math.max(stats.value.memoryBest, points)
    } else if (game === 'formula') {
      stats.value.formulaPlayed += 1
      stats.value.formulaBest = Math.max(stats.value.formulaBest, points)
    } else if (game === 'season') {
      stats.value.seasonPlayed += 1
      stats.value.seasonBest = Math.max(stats.value.seasonBest, points)
    } else {
      stats.value.meridianPlayed += 1
      stats.value.meridianBest = Math.max(stats.value.meridianBest, points)
    }
    persist()
  }

  return {
    stats,
    totalPoints,
    totalStars,
    maxStars,
    playedCount,
    treasuryOpen,
    addPoints,
    getLevelStars,
    hasPlayedLevel,
  }
})
