import { request } from '@/utils/request'
import type { PageResult } from '@/types/api'
import type { HerbFilterQuery } from '@/types/herb'

export interface HerbItem {
  id: number
  herbName: string
  alias?: string
  originProvince?: string
  originProvinceName?: string
  daoDiRegion?: string
  isDaoDi?: number
  nature?: string
  taste?: string
  meridian?: string
  efficacy?: string
  propertyDesc?: string
  clinicalUsage?: string
  coverImage?: string
  viewCount?: number
  collectCount?: number
  createTime?: string
  /** 列表页批量查询的收藏状态 */
  isCollected?: boolean
}

export interface HerbDetail extends HerbItem {
  images?: string[]
  /** 详情页结构化 JSON 字符串 */
  detailContent?: string
  /** 登录用户是否已收藏 */
  isCollected?: boolean
}

export interface ProvinceOption {
  code: string
  name: string
}

export interface NatureOption {
  value: string
  label: string
  count: number
}

export interface HerbFilterOptions {
  natures: NatureOption[]
  tastes: string[]
  meridians: string[]
  provinces: ProvinceOption[]
}

export function fetchHerbSearch(params: HerbFilterQuery) {
  return request<PageResult<HerbItem>>({
    url: '/atlas/herbs/search',
    method: 'get',
    params,
  })
}

export function fetchHerbFilterOptions() {
  return request<HerbFilterOptions>({
    url: '/atlas/herbs/filter-options',
    method: 'get',
  })
}

export function fetchHerbPage(params: {
  page?: number
  pageSize?: number
  keyword?: string
  nature?: string
  originProvince?: string
  sort?: string
}) {
  return request<PageResult<HerbItem>>({
    url: '/atlas/herbs',
    method: 'get',
    params,
  })
}

export function fetchHerbDetail(id: number) {
  return request<HerbDetail>({
    url: `/atlas/herbs/${id}`,
    method: 'get',
  })
}
