import { request } from '@/utils/request'
import type { PageResult } from '@/types/api'

export interface ProductItem {
  id: number
  productName: string
  category: string
  price: number
  stock: number
  coverImage?: string
  detail?: string
  salesCount?: number
}

export function fetchProductPage(params: {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
}) {
  return request<PageResult<ProductItem>>({
    url: '/market/products',
    method: 'get',
    params,
  })
}

export function fetchProductDetail(id: number) {
  return request<ProductItem>({
    url: `/market/products/${id}`,
    method: 'get',
  })
}
