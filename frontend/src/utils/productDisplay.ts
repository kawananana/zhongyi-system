import { marketCategoryLabel } from '@/utils/marketCategories'

function isUsableCover(url?: string) {
  if (!url?.trim()) return false
  const u = url.trim()
  if (u.endsWith('.svg')) return false
  if (u.startsWith('/images/market/') && u.endsWith('.svg')) return false
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

/** 按商品 ID 固定封面，避免名称/数据库封面错位 */
const COVER_BY_PRODUCT_ID: Record<number, string> = {
  29: '/images/market/a57b460fc1a1f53f3da1de3beda3fe2a.png',
  30: '/images/market/0e69dd54e44fd6bede571055d184828e_720.png',
  38: '/images/market/65a4d09b25782d71c0029f4aa9549256_720.png',
  42: '/images/market/be0492964364e53833d1d5a7a164e960.png',
}

const explicitCovers: Record<string, string> = {
  '桑葚山楂块': '/images/market/b3e0b584f68715205cd6f2f2c6ab20ce_720.png',
  '艾叶红花泡脚包': '/images/market/fd16a2b13332d4a635895a18c03306f7_720.png',
  '【艾灸艾柱】无烟艾条': '/images/market/007c5532699b5bc59bacec57e86af325_720.png',
  '无烟艾条': '/images/market/007c5532699b5bc59bacec57e86af325_720.png',
  '【理疗工具】真空拔罐器12罐装': '/images/market/dd112defab4e057ceee8910744acebc6_720.png',
  '真空拔罐器12罐装': '/images/market/dd112defab4e057ceee8910744acebc6_720.png',
  '【药食同源】红枣枸杞核桃糕': '/images/market/1197146ea0ac102e688a9649998acfa4_720.png',
  '红枣枸杞核桃糕': '/images/market/1197146ea0ac102e688a9649998acfa4_720.png',
  '【养生茶疗】玫瑰红枣桂圆茶': '/images/market/c8257482d8cfd1cb436031b9c141ab1d_720.png',
  '玫瑰红枣桂圆茶': '/images/market/c8257482d8cfd1cb436031b9c141ab1d_720.png',
  '【艾灸艾柱】蕲春三年陈艾柱': '/images/market/35d66bc96c800f2170cf3157ade0db99_720.png',
  '蕲春三年陈艾柱': '/images/market/35d66bc96c800f2170cf3157ade0db99_720.png',
  '【养生茶疗】杭白菊枸杞茶': '/images/market/8f8096c8a454a9fb2e06cd0b72c00f5f_720.png',
  '杭白菊枸杞茶': '/images/market/8f8096c8a454a9fb2e06cd0b72c00f5f_720.png',
  '【中医护肤】当归草本润唇膏': '/images/market/a57b460fc1a1f53f3da1de3beda3fe2a.png',
  '当归草本润唇膏': '/images/market/a57b460fc1a1f53f3da1de3beda3fe2a.png',
  '【养生足疗】藏红花足浴盐': '/images/market/0e69dd54e44fd6bede571055d184828e_720.png',
  '藏红花足浴盐': '/images/market/0e69dd54e44fd6bede571055d184828e_720.png',
  '水牛角刮痧板': '/images/market/1eec53851cda1a2c6197406d79b29ace.png',
  '甘肃黄芪片': '/images/market/f8707b9bd50fa496cb0607e54b6f0ff6_720.png',
  '党参黄芪牛肉粒': '/images/market/65a4d09b25782d71c0029f4aa9549256_720.png',
  '四神小棍': '/images/market/63aa3a9d55c0bf2f71f8a75128cf0175_720.png',
  '老姜足浴包': '/images/market/image.png',
  '岷县当归头片': '/images/market/790f13be76e7845319b3eb62d6370ef7_720.png',
  '经络按摩刷': '/images/market/8a90a25bca3cd615b0cb189971c52412.png',
  '艾灸盒随身套装': '/images/market/be0492964364e53833d1d5a7a164e960.png',
  '【艾灸艾柱】艾灸盒随身套装': '/images/market/be0492964364e53833d1d5a7a164e960.png',
  '【中医书籍】《黄帝内经》白话图解': '/images/market/41cda2b432609cbb580ee0b16d3f1fc2_720.png',
  '【中医书籍】《针灸学》教材精编': '/images/market/a02dc77f84b4438518ea04c6b16b2b2d.png',
  '【精品礼盒】四季养生礼包': '/images/market/5bf2622047023018775b6a7eca1f1331_720.png',
  '【中医护肤】珍珠粉洁面乳': '/images/market/d6adb798ec2882ded5002805f9cc4cd9_720.png',
  '【中医书籍】《中药学》速查手册': '/images/market/71ed5b661cab202750abe2297476ee05_720.png',
  '【养生茶疗】新会陈皮普洱茶': '/images/market/ff4269e9bc6867844d0c43a362b981bc_720.png',
  '川贝秋梨膏': '/images/market/06dec9289a763fc76363707196d032ef_720.png',
  '【艾灸艾柱】蕲春三年陈艾柱': '/images/market/35d66bc96c800f2170cf3157ade0db99_720.png',
  '蕲春三年陈艾柱': '/images/market/35d66bc96c800f2170cf3157ade0db99_720.png',
  '【精品礼盒】四季养生礼包': '/images/market/5bf2622047023018775b6a7eca1f1331_720.png',
  '四季养生礼包': '/images/market/5bf2622047023018775b6a7eca1f1331_720.png',
  '【中医护肤】珍珠粉洁面乳': '/images/market/d6adb798ec2882ded5002805f9cc4cd9_720.png',
  '珍珠粉洁面乳': '/images/market/d6adb798ec2882ded5002805f9cc4cd9_720.png',
  '【中医书籍】《中药学》速查手册': '/images/market/71ed5b661cab202750abe2297476ee05_720.png',
  '中药学速查手册': '/images/market/71ed5b661cab202750abe2297476ee05_720.png',
  '文山三七粉': '/images/market/cba6903d394669fabfc3576317030e1a_720.png',
  '固本膏': '/images/market/3e300f1b11bbdf8f935d5707a0437564_720.png',
  '宁夏枸杞礼盒': '/images/market/d9d83aad2390f98da79df53f32507499_720.png',
  '银耳莲子羹': '/images/market/54c8dffa0e05b4c168547b57eccf571c.png',
  '银耳莲子羹礼盒': '/images/market/54c8dffa0e05b4c168547b57eccf571c.png',
  '玫瑰红枣桂圆茶': '/images/market/c8257482d8cfd1cb436031b9c141ab1d_720.png',
  '宁夏枸杞王': '/images/market/1dbc42c8c444d8d8f591402c2fca4dbe_720.png',
  '九蒸九晒黑芝麻丸': '/images/market/9ede45651bced3f310f52ac55271325f_720.png',
  '无烟艾条': '/images/market/007c5532699b5bc59bacec57e86af325_720.png',
  '杭白菊枸杞茶': '/images/market/8f8096c8a454a9fb2e06cd0b72c00f5f_720.png',
}

/** 商品封面：优先数据库图片，其次使用明确绑定的本地图片，再退回分类 SVG。 */
export function productCoverSrc(product: {
  id?: number
  productName: string
  category: string
  coverImage?: string
}) {
  if (product.id != null && COVER_BY_PRODUCT_ID[product.id]) {
    return COVER_BY_PRODUCT_ID[product.id]
  }
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
