import { ADVENTURE_LEVELS } from '@/data/wellnessGames'
import { getCurrentSolarTerm } from '@/utils/solarTerm'
import { formatDateKey, hasRecord, loadDailyLogs } from '@/utils/wellnessStorage'

export type WellnessTabKey = 'journal' | 'community' | 'games'

export type RecommendAction =
  | { type: 'tab'; tab: WellnessTabKey }
  | { type: 'route'; path: string; query?: Record<string, string> }

export interface WellnessRecommendItem {
  id: string
  icon: string
  title: string
  desc: string
  tag?: string
  action: RecommendAction
}

export interface RecommendContext {
  activeTab: WellnessTabKey
  userId?: number
  getLevelStars: (levelId: string) => number
  /** 用于「换一批」轮换展示 */
  rotate?: number
}

export function buildWellnessRecommendations(ctx: RecommendContext): WellnessRecommendItem[] {
  const items: WellnessRecommendItem[] = []
  const solar = getCurrentSolarTerm()
  const todayKey = formatDateKey(new Date())
  const todayLog = loadDailyLogs(ctx.userId)[todayKey]
  const todayRecorded = todayLog ? hasRecord(todayLog) : false

  items.push({
    id: 'solar-term',
    icon: '🌿',
    title: `${solar.name} · ${solar.season}季养生`,
    desc: `${solar.tip}。饮食建议：${solar.diet}`,
    tag: '节气',
    action: { type: 'tab', tab: 'journal' },
  })

  if (!todayRecorded) {
    items.push({
      id: 'journal-today',
      icon: '📅',
      title: '记录今日养生',
      desc: '写下饮食起居与心情，小萌会结合节气给你更贴心的建议。',
      tag: '提醒',
      action: { type: 'tab', tab: 'journal' },
    })
  }

  const playable = ADVENTURE_LEVELS.filter((l) => l.status === 'beta')
  const unplayed = playable.filter((l) => ctx.getLevelStars(l.id) === 0)
  const improvable = playable.filter((l) => {
    const stars = ctx.getLevelStars(l.id)
    return stars > 0 && stars < 3
  })

  if (unplayed.length > 0) {
    const level = unplayed[0]
    items.push({
      id: `game-new-${level.id}`,
      icon: level.icon,
      title: `试试「${level.title}」`,
      desc: level.desc,
      tag: '闯关',
      action: { type: 'route', path: `/games/${level.id}`, query: { from: 'wellness' } },
    })
  }

  if (improvable.length > 0) {
    const level = improvable.sort((a, b) => ctx.getLevelStars(a.id) - ctx.getLevelStars(b.id))[0]
    const stars = ctx.getLevelStars(level.id)
    items.push({
      id: `game-star-${level.id}`,
      icon: '⭐',
      title: `挑战 ${level.title} 满星`,
      desc: `当前 ${stars} 星，再刷一局冲击 3 星吧！`,
      tag: '闯关',
      action: { type: 'route', path: `/games/${level.id}`, query: { from: 'wellness' } },
    })
  }

  if (solar.name && ctx.getLevelStars('season') < 3) {
    items.push({
      id: 'game-season',
      icon: '🍂',
      title: '节气养生问答',
      desc: `正值${solar.name}，玩节气问答巩固应季养生知识。`,
      tag: '应季',
      action: { type: 'route', path: '/games/season', query: { from: 'wellness' } },
    })
  }

  if (ctx.activeTab !== 'community') {
    items.push({
      id: 'community',
      icon: '💬',
      title: '去社区交流',
      desc: '分享你的养生心得，或向同好请教调理疑问。',
      tag: '社区',
      action: { type: 'tab', tab: 'community' },
    })
  }

  if (ctx.activeTab !== 'games' && playable.some((l) => ctx.getLevelStars(l.id) === 0)) {
    items.push({
      id: 'games-map',
      icon: '🗺️',
      title: '本草寻宝闯关',
      desc: '边玩边学，任意关卡可直接挑战，根据成绩获得星级。',
      tag: '趣学',
      action: { type: 'tab', tab: 'games' },
    })
  }

  items.push({
    id: 'study',
    icon: '🤖',
    title: '萌智伴学问答',
    desc: '不懂的药材、穴位随时问，AI 小助手帮你梳理知识点。',
    tag: '学习',
    action: { type: 'route', path: '/study' },
  })

  const seen = new Set<string>()
  const unique = items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  const limit = 5
  if (unique.length <= limit) return unique.slice(0, limit)

  const offset = (ctx.rotate ?? 0) % unique.length
  const rotated = [...unique.slice(offset), ...unique.slice(0, offset)]
  return rotated.slice(0, limit)
}

export function pickHintText(items: WellnessRecommendItem[]): string {
  if (!items.length) return '有什么可以帮你的？'
  return items[0].title
}
