import { request } from '@/utils/request'
import type { PageResult } from '@/types/api'

export interface RecipeItem {
  id: number
  recipeName: string
  category?: string
  coverImage?: string
  summary?: string
  efficacy?: string
  cookingSteps?: string
  cookingTime?: string
  difficulty?: string
  tags?: string
  constitutionTags?: string
  isFeatured?: number
  viewCount?: number
}

export function fetchRecipeFeatured() {
  return request<RecipeItem>({
    url: '/recipes/featured',
    method: 'get',
  })
}

export function fetchRecipePage(params: {
  page?: number
  pageSize?: number
  category?: string
}) {
  return request<PageResult<RecipeItem>>({
    url: '/recipes',
    method: 'get',
    params,
  })
}

export function fetchRecipeDetail(id: number) {
  return request<RecipeItem>({
    url: `/recipes/${id}`,
    method: 'get',
  })
}
