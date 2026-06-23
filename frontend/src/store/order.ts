import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { CartLine } from '@/store/cart'
import {
  createMarketOrder,
  fetchMarketOrderDetail,
  fetchMarketOrders,
  type MarketOrderRecord,
  type MarketOrderReturnRecord,
  type ShippingInfo,
} from '@/api/order'

export interface OrderItemLine {
  productId: number
  productName: string
  category: string
  unitPrice: number
  quantity: number
}

export interface OrderReturnInfo {
  id: number
  status: 0 | 1 | 2
  reason: string
  adminRemark?: string
  createTime: string
  auditTime?: string
}

export interface MarketOrder {
  id: string
  orderNo: string
  items: OrderItemLine[]
  totalAmount: number
  orderStatus: 0 | 1 | 2 | 3
  payStatus: 0 | 1 | 2
  createTime: string
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  returnRequest?: OrderReturnInfo
}

const ORDER_STATUS_TEXT: Record<MarketOrder['orderStatus'], string> = {
  0: '待发货',
  1: '待收货',
  2: '已完成',
  3: '已取消',
}

const RETURN_STATUS_TEXT: Record<OrderReturnInfo['status'], string> = {
  0: '退货审核中',
  1: '退货已同意',
  2: '退货已拒绝',
}

export function orderStatusLabel(status: MarketOrder['orderStatus']) {
  return ORDER_STATUS_TEXT[status] ?? '未知'
}

export function returnStatusLabel(status: OrderReturnInfo['status']) {
  return RETURN_STATUS_TEXT[status] ?? '未知'
}

function mapReturn(record?: MarketOrderReturnRecord): OrderReturnInfo | undefined {
  if (!record) return undefined
  return {
    id: record.id,
    status: record.status,
    reason: record.reason,
    adminRemark: record.adminRemark,
    createTime: record.createTime,
    auditTime: record.auditTime,
  }
}

function mapOrder(record: MarketOrderRecord): MarketOrder {
  return {
    id: String(record.id),
    orderNo: record.orderNo,
    items: (record.items || []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
    })),
    totalAmount: Number(record.totalAmount),
    orderStatus: record.orderStatus,
    payStatus: record.payStatus,
    createTime: record.createTime,
    receiverName: record.receiverName,
    receiverPhone: record.receiverPhone,
    receiverAddress: record.receiverAddress,
    returnRequest: mapReturn(record.returnRequest),
  }
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<MarketOrder[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  const orderCount = computed(() => orders.value.length)

  async function loadOrders() {
    loading.value = true
    try {
      const list = await fetchMarketOrders()
      orders.value = (list || []).map(mapOrder)
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (!loaded.value && !loading.value) {
      await loadOrders()
    }
  }

  async function createFromCart(cartItems: CartLine[], shipping: ShippingInfo) {
    if (!cartItems.length) return null
    const record = await createMarketOrder({
      items: cartItems.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
      ...shipping,
    })
    const order = mapOrder(record)
    orders.value = [order, ...orders.value.filter((o) => o.id !== order.id)]
    loaded.value = true
    return order
  }

  async function createFromSingle(line: CartLine, shipping: ShippingInfo) {
    return createFromCart([line], shipping)
  }

  async function fetchOrderById(id: string) {
    const cached = orders.value.find((o) => o.id === id)
    if (cached) return cached
    const record = await fetchMarketOrderDetail(Number(id))
    const order = mapOrder(record)
    const idx = orders.value.findIndex((o) => o.id === order.id)
    if (idx >= 0) orders.value[idx] = order
    else orders.value = [order, ...orders.value]
    return order
  }

  function patchOrder(order: MarketOrder) {
    const idx = orders.value.findIndex((o) => o.id === order.id)
    if (idx >= 0) orders.value[idx] = order
    else orders.value = [order, ...orders.value]
  }

  return {
    orders,
    loaded,
    loading,
    orderCount,
    loadOrders,
    ensureLoaded,
    createFromCart,
    createFromSingle,
    fetchOrderById,
    patchOrder,
  }
})
