import type { CartLine } from '@/store/cart'

const CHECKOUT_KEY = 'bencao_checkout_lines'
const ADDRESS_KEY = 'bencao_shipping_address'

export interface ShippingAddress {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detail: string
}

export const CHINA_PROVINCES = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
  '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区',
  '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区',
]

export function saveCheckoutLines(lines: CartLine[]) {
  sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(lines))
}

export function loadCheckoutLines(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function clearCheckoutLines() {
  sessionStorage.removeItem(CHECKOUT_KEY)
}

export function buildFullAddress(addr: ShippingAddress) {
  return `${addr.province} ${addr.city} ${addr.district} ${addr.detail}`.trim()
}

export function saveShippingAddress(addr: ShippingAddress) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addr))
}

export function loadShippingAddress(): ShippingAddress | null {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ShippingAddress
  } catch {
    return null
  }
}

export function emptyShippingAddress(): ShippingAddress {
  return {
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
  }
}
