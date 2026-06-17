import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { CartLine } from '@/store/cart'

export interface OrderItemLine {
  productId: number
  productName: string
  category: string
  unitPrice: number
  quantity: number
}

export interface MarketOrder {
  id: string
  orderNo: string
  items: OrderItemLine[]
  totalAmount: number
  orderStatus: 0 | 1 | 2 | 3
  payStatus: 0 | 1
  createTime: string
  receiverName?: string
  receiverAddress?: string
}

const STORAGE_KEY = 'bencao_market_orders'

const ORDER_STATUS_TEXT: Record<MarketOrder['orderStatus'], string> = {
  0: '待发货',
  1: '已发货',
  2: '已完成',
  3: '已取消',
}

function loadOrders(): MarketOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MarketOrder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function genOrderNo() {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `BC${t}${r}`
}

export function orderStatusLabel(status: MarketOrder['orderStatus']) {
  return ORDER_STATUS_TEXT[status] ?? '未知'
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<MarketOrder[]>(loadOrders())

  watch(
    orders,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  const orderCount = computed(() => orders.value.length)

  function createFromCart(cartItems: CartLine[]) {
    if (!cartItems.length) return null
    const items: OrderItemLine[] = cartItems.map((line) => ({
      productId: line.productId,
      productName: line.productName,
      category: line.category,
      unitPrice: line.price,
      quantity: line.quantity,
    }))
    const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const order: MarketOrder = {
      id: `ord_${Date.now()}`,
      orderNo: genOrderNo(),
      items,
      totalAmount,
      orderStatus: 0,
      payStatus: 1,
      createTime: new Date().toISOString(),
      receiverName: '本草用户',
      receiverAddress: '请在个人中心完善收货地址',
    }
    orders.value = [order, ...orders.value]
    return order
  }

  function createFromSingle(line: CartLine) {
    return createFromCart([line])
  }

  return {
    orders,
    orderCount,
    createFromCart,
    createFromSingle,
  }
})
