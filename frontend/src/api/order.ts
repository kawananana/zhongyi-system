import { request } from '@/utils/request'

export interface MarketOrderItemLine {
  productId: number
  productName: string
  category: string
  unitPrice: number
  quantity: number
}

export interface MarketOrderReturnRecord {
  id: number
  status: 0 | 1 | 2
  reason: string
  adminRemark?: string
  createTime: string
  auditTime?: string
}

export interface MarketOrderRecord {
  id: number
  orderNo: string
  items: MarketOrderItemLine[]
  totalAmount: number
  orderStatus: 0 | 1 | 2 | 3
  payStatus: 0 | 1 | 2
  createTime: string
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  returnRequest?: MarketOrderReturnRecord
}

export interface ShippingInfo {
  receiverName: string
  receiverPhone: string
  receiverAddr: string
}

export function createMarketOrder(data: {
  items: { productId: number; quantity: number }[]
} & ShippingInfo) {
  return request<MarketOrderRecord>({
    url: '/market/orders',
    method: 'post',
    data,
  })
}

export function fetchMarketOrders() {
  return request<MarketOrderRecord[]>({
    url: '/market/orders',
    method: 'get',
  })
}

export function fetchMarketOrderDetail(id: number) {
  return request<MarketOrderRecord>({
    url: `/market/orders/${id}`,
    method: 'get',
  })
}

export function applyOrderReturn(orderId: number, reason: string) {
  return request<MarketOrderReturnRecord>({
    url: `/market/orders/${orderId}/returns`,
    method: 'post',
    data: { reason },
  })
}
