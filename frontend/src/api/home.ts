import { request } from '@/utils/request'

export interface BannerItem {
  id: number
  title: string
  imageUrl: string
  linkType: string
  linkTargetId?: number
  linkUrl?: string
  sortOrder?: number
}

export function fetchHomeBanners(position = 'home') {
  return request<BannerItem[]>({
    url: '/home/banners',
    method: 'get',
    params: { position },
  })
}
