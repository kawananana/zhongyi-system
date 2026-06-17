/** 图鉴多维检索参数（对齐接口契约 FilterQuery） */
export interface HerbFilterQuery {
  keyword?: string
  natures?: string
  tastes?: string
  meridians?: string
  provinceCodes?: string
  sort?: string
  page?: number
  pageSize?: number
}

export type FilterTagType = 'nature' | 'taste' | 'meridian' | 'province'

export interface FilterTagItem {
  type: FilterTagType
  value: string
  label: string
  icon?: string
}
