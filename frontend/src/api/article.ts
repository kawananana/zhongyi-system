import { request } from '@/utils/request'
import type { PageResult } from '@/types/api'

export interface ArticleItem {
  id: number
  title: string
  articleType?: string
  category?: string
  contentKind?: string
  coverImage?: string
  content?: string
  author?: string
  sourceName?: string
  sourceUrl?: string
  galleryJson?: string
  videosJson?: string
  viewCount?: number
  createTime?: string
}

export function fetchArticlePage(params: {
  page?: number
  pageSize?: number
  type?: string
  category?: string
  contentKind?: string
}) {
  return request<PageResult<ArticleItem>>({
    url: '/atlas/articles',
    method: 'get',
    params,
  })
}

export function fetchArticleDetail(id: number) {
  return request<ArticleItem>({
    url: `/atlas/articles/${id}`,
    method: 'get',
  })
}
