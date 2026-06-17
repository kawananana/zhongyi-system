import { marketCategoryLabel } from '@/utils/marketCategories'

function isUsableCover(url?: string) {
  if (!url?.trim()) return false
  const u = url.trim()
  if (u.endsWith('.svg')) return false
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')
}

function picsumSeed(product: { id?: number; productName: string; category: string }) {
  const slug = product.productName
    .replace(/[《》]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
  if (product.id) return `market-p${product.id}`
  return `market-${slug || product.category || 'item'}`
}

function isFallbackCover(url?: string) {
  if (!url?.trim()) return false
  return /picsum\.photos\/seed\//.test(url) || /market-p\d+/.test(url)
}

function categoryFallbackCover(category: string) {
  const safeCategory = category || 'food_medicine'
  return `/images/market/${safeCategory}.svg`
}

const explicitCovers: Record<string, string> = {
  '桑葚山楂块': '/images/market/b3e0b584f68715205cd6f2f2c6ab20ce_720.png',
  '艾叶红花泡脚包': '/images/market/fd16a2b13332d4a635895a18c03306f7_720.png',
  '水牛角刮痧板': '/images/market/1eec53851cda1a2c6197406d79b29ace.png',
  '甘肃黄芪片': '/images/market/f8707b9bd50fa496cb0607e54b6f0ff6_720.png',
  '党参黄芪牛肉粒': '/images/market/65a4d09b25782d71c0029f4aa9549256_720.png',
}

/** 商品封面：优先数据库图片，其次使用明确绑定的本地图片，再退回分类 SVG。 */
export function productCoverSrc(product: {
  id?: number
  productName: string
  category: string
  coverImage?: string
}) {
  if (isUsableCover(product.coverImage) && !isFallbackCover(product.coverImage)) {
    return product.coverImage!.trim()
  }
  const explicit = explicitCovers[product.productName.trim()]
  if (explicit) return explicit
  return categoryFallbackCover(product.category)
}

/** 解析商品 detail 字段：【标签】| 规格：… | 说明 */
export function parseProductDetail(detail?: string) {
  if (!detail) return { tag: '', spec: '', summary: '' }
  const tag = detail.match(/【([^】]+)】/)?.[1] ?? ''
  const spec = detail.match(/规格[：:]([^|]+)/)?.[1]?.trim() ?? ''
  let summary = detail
    .replace(/【[^】]+】\s*\|?\s*/, '')
    .replace(/规格[：:][^|]+\s*\|?\s*/, '')
    .trim()
  if (summary.endsWith('。')) summary = summary.slice(0, -1)
  return { tag, spec, summary }
}

export function buildMarketProductDetail(params: {
  tag: string
  spec: string
  highlights: string[]
}) {
  const summary = params.highlights.filter(Boolean).join('，')
  return `【${params.tag}】| 规格：${params.spec} | ${summary}`
}

export function productCategoryLabel(category: string) {
  return marketCategoryLabel(category)
}

/** 划线原价（参考电商常见折扣展示） */
export function productOriginalPrice(price: number) {
  const p = Number(price)
  if (!p) return 0
  return Math.round(p * 1.18 * 10) / 10
}

export function formatSalesCount(count?: number) {
  const n = count ?? 0
  if (n >= 10000) return `已售${Math.floor(n / 10000)}万+`
  if (n >= 1000) return `已售${Math.floor(n / 100) * 100}+`
  if (n >= 100) return `已售${n}+`
  return n > 0 ? `已售${n}` : ''
}

export function productDisplayTitle(name: string, tag?: string) {
  if (tag && !name.startsWith('【')) return `【${tag}】${name}`
  return name
}
