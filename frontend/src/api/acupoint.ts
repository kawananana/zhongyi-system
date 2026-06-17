import { request } from '@/utils/request'

export interface AcupointItem {
  id: number
  pointName: string
  meridian: string
  positionDesc: string
  efficacy?: string
  coord3d?: string
}

export function fetchAcupointList(params?: {
  meridian?: string
  region?: string
  keyword?: string
}) {
  return request<AcupointItem[]>({
    url: '/atlas/acupoints',
    method: 'get',
    params,
  })
}

export function fetchAcupointDetail(id: number) {
  return request<AcupointItem>({
    url: `/atlas/acupoints/${id}`,
    method: 'get',
  })
}
