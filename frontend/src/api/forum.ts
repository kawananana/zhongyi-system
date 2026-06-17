import { request } from '@/utils/request'
import type { PageResult } from '@/types/api'

export interface ForumPostItem {
  id: number
  userId: number
  authorNickname?: string
  authorAvatar?: string
  title: string
  content: string
  category?: string
  refType?: string
  refId?: number
  refHerbName?: string
  refHerbCover?: string
  likeCount?: number
  commentCount?: number
  createTime?: string
}

export function fetchForumPosts(params: {
  page?: number
  pageSize?: number
  category?: string
  keyword?: string
}) {
  return request<PageResult<ForumPostItem>>({
    url: '/forum/posts',
    method: 'get',
    params,
  })
}

export function shareHerbToForum(herbId: number, content?: string) {
  return request<ForumPostItem>({
    url: '/forum/share/herb',
    method: 'post',
    data: { herbId, content },
  })
}
