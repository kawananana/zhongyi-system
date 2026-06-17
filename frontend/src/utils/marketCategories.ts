/** 市集分类（与 product.category 字段一致） */
export const MARKET_CATEGORIES = [
  { key: 'tea_therapy', label: '养生茶疗', icon: '🍵', gradient: 'linear-gradient(145deg, #e8f5e9 0%, #c8e6c9 100%)', accent: '#2e7d32' },
  { key: 'moxibustion', label: '艾灸艾柱', icon: '🪔', gradient: 'linear-gradient(145deg, #fff8e1 0%, #ffe0b2 100%)', accent: '#e65100' },
  { key: 'skincare', label: '中医护肤', icon: '💄', gradient: 'linear-gradient(145deg, #fce4ec 0%, #f8bbd0 100%)', accent: '#c2185b' },
  { key: 'books', label: '中医书籍', icon: '📚', gradient: 'linear-gradient(145deg, #e8eaf6 0%, #c5cae9 100%)', accent: '#3949ab' },
  { key: 'food_medicine', label: '药食同源', icon: '🥣', gradient: 'linear-gradient(145deg, #f3e5f5 0%, #e1bee7 100%)', accent: '#7b1fa2' },
  { key: 'herbal_paste', label: '膏方系列', icon: '🫙', gradient: 'linear-gradient(145deg, #fffde7 0%, #fff9c4 100%)', accent: '#f57f17' },
  { key: 'physio_tools', label: '理疗工具', icon: '🖐', gradient: 'linear-gradient(145deg, #e0f7fa 0%, #b2ebf2 100%)', accent: '#00838f' },
  { key: 'foot_therapy', label: '养生足疗', icon: '🦶', gradient: 'linear-gradient(145deg, #e8f5e9 0%, #b2dfdb 100%)', accent: '#00695c' },
  { key: 'gift_box', label: '精品礼盒', icon: '🎁', gradient: 'linear-gradient(145deg, #ffebee 0%, #ffcdd2 100%)', accent: '#c62828' },
  { key: 'decoction', label: '滋补饮片', icon: '🌿', gradient: 'linear-gradient(145deg, #efebe9 0%, #d7ccc8 100%)', accent: '#5d4037' },
] as const

export function getMarketCategoryMeta(category: string) {
  return MARKET_CATEGORIES.find((c) => c.key === category) ?? MARKET_CATEGORIES[4]
}

export function marketCategoryLabel(key: string): string {
  return getMarketCategoryMeta(key).label
}

export function marketCategoryAccent(key: string): string {
  return getMarketCategoryMeta(key).accent ?? '#1a5f3f'
}
