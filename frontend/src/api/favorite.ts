import { request } from '@/utils/request'

export interface UserFavoriteItem {
  id: number
  type: 'herb' | 'article' | 'course' | 'recipe'
  title: string
  coverImage?: string
  category?: string
  subtitle?: string
  favoriteTime: string
}

export type FavoriteType = UserFavoriteItem['type']

export function fetchFavoriteHerbs() {
  return request<UserFavoriteItem[]>({ url: '/user/favorites/herbs', method: 'get' })
}

export function fetchFavoriteArticles() {
  return request<UserFavoriteItem[]>({ url: '/user/favorites/articles', method: 'get' })
}

export function fetchFavoriteCourses() {
  return request<UserFavoriteItem[]>({ url: '/user/favorites/courses', method: 'get' })
}

export async function fetchFavoriteRecipes() {
  try {
    return await request<UserFavoriteItem[]>({
      url: '/user/favorites/recipes',
      method: 'get',
      silent: true,
    })
  } catch {
    return []
  }
}

export function toggleFavorite(type: FavoriteType, id: number, action: 'add' | 'remove') {
  return request<{ collected: boolean }>({
    url: '/user/favorites/toggle',
    method: 'post',
    data: { type, id, action },
  })
}

export function fetchFavoriteCheck(type: FavoriteType, id: number, silent = false) {
  return request<boolean>({
    url: '/user/favorites/check',
    method: 'get',
    params: { type, id },
    silent,
  })
}

export function fetchArticleFavoriteStatus(ids: number[]) {
  if (!ids.length) return Promise.resolve({} as Record<number, boolean>)
  return request<Record<number, boolean>>({
    url: '/user/favorites/article-status',
    method: 'get',
    params: { ids: ids.join(',') },
    silent: true,
  })
}

async function fetchRecipeFavoriteStatusFallback(ids: number[]) {
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const collected = await fetchFavoriteCheck('recipe', id, true)
        return [id, collected] as const
      } catch {
        return [id, false] as const
      }
    }),
  )
  return Object.fromEntries(entries) as Record<number, boolean>
}

export async function fetchRecipeFavoriteStatus(ids: number[]) {
  if (!ids.length) return {} as Record<number, boolean>
  try {
    return await request<Record<number, boolean>>({
      url: '/user/favorites/recipe-status',
      method: 'get',
      params: { ids: ids.join(',') },
      silent: true,
    })
  } catch {
    return fetchRecipeFavoriteStatusFallback(ids)
  }
}
