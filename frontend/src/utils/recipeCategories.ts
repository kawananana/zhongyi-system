export const RECIPE_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'soup', label: '滋补汤羹' },
  { key: 'porridge', label: '养生粥品' },
  { key: 'tea', label: '草本茶饮' },
  { key: 'snack', label: '时令小点' },
] as const

export function recipeCategoryLabel(key: string): string {
  return RECIPE_CATEGORIES.find((c) => c.key === key)?.label ?? key
}

export function parseRecipeTags(tags?: string): string[] {
  if (!tags) return []
  return tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
}
