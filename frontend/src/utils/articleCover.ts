import { parseGalleryJson } from '@/utils/wikiMedia'
import type { ArticleItem } from '@/api/article'

/** 标题关键词 → 封面（可按分类限定，避免针灸/艾灸串图） */
const TITLE_COVER_RULES: Array<{ pattern: RegExp; cover: string; categories?: string[] }> = [
  { pattern: /秋季|润肺|秋养/, cover: '/images/wiki/articles/autumn-1.svg' },
  { pattern: /枸杞/, cover: '/images/wiki/articles/gouqi-1.svg' },
  { pattern: /熬夜|睡眠|安神|失眠/, cover: '/images/wiki/articles/sleep-1.svg' },
  { pattern: /阴阳|五行|藏象/, cover: '/images/wiki/articles/yinyang-1.svg' },
  { pattern: /经络学说|经络概述/, cover: '/images/wiki/articles/course-jingluo-1.svg', categories: ['acupuncture'] },
  { pattern: /穴位定位|定位方法/, cover: '/images/wiki/articles/acupoint-locate.svg', categories: ['acupuncture'] },
  { pattern: /合谷/, cover: '/images/wiki/articles/acupoint-2.svg', categories: ['acupuncture'] },
  { pattern: /足三里/, cover: '/images/wiki/articles/acupoint-zusanli.svg', categories: ['acupuncture'] },
  { pattern: /穴位|针灸|太冲/, cover: '/images/wiki/articles/acupoint-1.svg', categories: ['acupuncture'] },
  { pattern: /艾灸入门/, cover: '/images/wiki/articles/moxa-intro.svg', categories: ['moxibustion'] },
  { pattern: /艾灸基本|施灸顺序/, cover: '/images/wiki/articles/course-moxa-1.svg', categories: ['moxibustion'] },
  { pattern: /三伏|艾灸/, cover: '/images/wiki/articles/moxa-1.svg', categories: ['moxibustion'] },
  { pattern: /推拿|颈肩|腰背/, cover: '/images/wiki/articles/tuina-1.svg', categories: ['tuina'] },
  { pattern: /拔罐/, cover: '/images/wiki/articles/cupping-1.svg', categories: ['cupping'] },
  { pattern: /山药|薏米|粥|药膳|食疗|药食|赤小豆|芒种|小满|草果|马齿苋|槐花|沙棘|米粉|谷雨|定风草|香橼/, cover: '/images/wiki/articles/porridge-1.svg', categories: ['diet'] },
  { pattern: /八段锦|五禽戏|跟练|功法/, cover: '/images/wiki/articles/baduanjin-1.svg', categories: ['exercise'] },
  { pattern: /子午|四季|起居|规律作息/, cover: '/images/wiki/articles/lifestyle-1.svg', categories: ['lifestyle'] },
  { pattern: /基础理论|绪论/, cover: '/images/wiki/articles/course-basic-1.svg' },
]

const CATEGORY_COVERS: Record<string, string> = {
  diet: '/images/wiki/cover-diet.svg',
  lifestyle: '/images/wiki/cover-lifestyle.svg',
  exercise: '/images/wiki/cover-exercise.svg',
  cupping: '/images/wiki/cover-cupping.svg',
  acupuncture: '/images/wiki/cover-acupuncture.svg',
  moxibustion: '/images/wiki/cover-moxibustion.svg',
  tuina: '/images/wiki/cover-tuina.svg',
}

const GENERATED_COVER_PREFIX = '/images/wiki/articles/covers/cover-'

function pickByTitle(title: string, category?: string): string | undefined {
  for (const rule of TITLE_COVER_RULES) {
    if (rule.categories && category && !rule.categories.includes(category)) continue
    if (rule.pattern.test(title)) return rule.cover
  }
  return undefined
}

function generatedCoverById(id: number): string {
  const idx = Math.max(0, id - 1)
  return `${GENERATED_COVER_PREFIX}${String(idx + 1).padStart(3, '0')}.svg`
}

/** 解析文章封面：优先 API 字段，其次图集首图，再按标题/分类/ID 兜底 */
export function resolveArticleCover(
  article: Pick<ArticleItem, 'id' | 'title' | 'category' | 'coverImage' | 'galleryJson'>,
): string {
  if (article.coverImage?.trim()) return article.coverImage.trim()

  const gallery = parseGalleryJson(article.galleryJson)
  if (gallery[0]?.url) return gallery[0].url

  const byTitle = pickByTitle(article.title || '', article.category)
  if (byTitle) return byTitle

  if (article.category && CATEGORY_COVERS[article.category]) {
    return CATEGORY_COVERS[article.category]
  }

  if (article.id) return generatedCoverById(article.id)

  return '/images/wiki/cover-acupuncture.svg'
}
