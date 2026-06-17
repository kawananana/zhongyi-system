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

/** 商品封面：优先数据库图片，其次生成稳定的商品图，避免出现“测试占位感” */
export function productCoverSrc(product: {
  id?: number
  productName: string
  category: string
  coverImage?: string
}) {
  if (isUsableCover(product.coverImage) && !isFallbackCover(product.coverImage)) {
    return product.coverImage!.trim()
  }
  return `https://picsum.photos/seed/${picsumSeed(product)}/600/600`
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
