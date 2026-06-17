export type WellnessGameStatus = 'beta' | 'soon'

export interface TreasureMapLevel {
  id: string
  levelNo: number
  chapter: string
  title: string
  desc: string
  icon: string
  status: WellnessGameStatus
  points?: string
  /** 藏宝图上的位置（百分比） */
  mapX: number
  mapY: number
  landmark?: string
}

export const ADVENTURE_MAP_META = {
  title: '本草寻宝闯关',
  subtitle: '沿古药商道逐关挑战，集齐百草印记开启灵草宝库',
  startLabel: '本草村',
  endLabel: '灵草宝库',
}

export const ADVENTURE_LEVELS: TreasureMapLevel[] = [
  {
    id: 'herb-quiz',
    levelNo: 1,
    chapter: '第一站',
    title: '本草问答',
    desc: '性味归经、功效主治，入门识药',
    icon: '📋',
    status: 'beta',
    points: '每题 +10 分',
    mapX: 14,
    mapY: 82,
    landmark: '药林牌坊',
  },
  {
    id: 'herb-match',
    levelNo: 2,
    chapter: '第二站',
    title: '认药配对',
    desc: '图文连线配对，锻炼快速识药',
    icon: '🧩',
    status: 'beta',
    points: '每对 +20 分',
    mapX: 28,
    mapY: 62,
    landmark: '百草堂',
  },
  {
    id: 'memory',
    levelNo: 3,
    chapter: '第三站',
    title: '药性翻牌',
    desc: '药名与性味标签记忆配对',
    icon: '🃏',
    status: 'beta',
    points: '每对 +15 分',
    mapX: 44,
    mapY: 48,
    landmark: '记忆溪谷',
  },
  {
    id: 'meridian',
    levelNo: 4,
    chapter: '第四站',
    title: '经络穴位',
    desc: '循经认穴，点亮经络图谱',
    icon: '🎯',
    status: 'beta',
    points: '点亮 +12 · 认经 +15',
    mapX: 58,
    mapY: 36,
    landmark: '经络山道',
  },
  {
    id: 'formula',
    levelNo: 5,
    chapter: '第五站',
    title: '方剂配伍',
    desc: '组方定君，体验君臣佐使',
    icon: '⚗️',
    status: 'beta',
    points: '组方 +15 · 定君 +10',
    mapX: 72,
    mapY: 24,
    landmark: '配伍药庐',
  },
  {
    id: 'season',
    levelNo: 6,
    chapter: '终章',
    title: '节气养生',
    desc: '四时药膳应季问答，通关开启宝库',
    icon: '🍂',
    status: 'beta',
    points: '每题 +10 分',
    mapX: 86,
    mapY: 12,
    landmark: '节气云台',
  },
]

/** @deprecated 使用 ADVENTURE_LEVELS */
export type WellnessGameItem = TreasureMapLevel

/** @deprecated 使用 ADVENTURE_LEVELS */
export const WELLNESS_GAMES = ADVENTURE_LEVELS

export const PLAYABLE_GAME_IDS = ADVENTURE_LEVELS.filter((g) => g.status === 'beta').map((g) => g.id)

export const GAME_SCORE_KEY: Record<string, 'quiz' | 'match' | 'memory' | 'formula' | 'season' | 'meridian'> = {
  'herb-quiz': 'quiz',
  'herb-match': 'match',
  'memory': 'memory',
  'meridian': 'meridian',
  'formula': 'formula',
  'season': 'season',
}

/** 各关星级分数线：[1 星, 2 星, 3 星] 最低积分 */
export const LEVEL_STAR_THRESHOLDS: Record<string, [number, number, number]> = {
  'herb-quiz': [40, 65, 85],
  'herb-match': [40, 60, 85],
  'memory': [35, 55, 75],
  'meridian': [25, 55, 85],
  'formula': [25, 60, 90],
  'season': [40, 65, 85],
}
