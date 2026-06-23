export const RECIPE_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'soup', label: '益脾胃' },
  { key: 'porridge', label: '清热祛暑' },
  { key: 'tea', label: '温经散寒' },
  { key: 'snack', label: '温中祛寒' },
] as const

export function recipeCategoryLabel(key: string): string {
  return RECIPE_CATEGORIES.find((c) => c.key === key)?.label ?? key
}

export function parseRecipeTags(tags?: string): string[] {
  if (!tags) return []
  return tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
}
