import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { ProductItem } from '@/api/product'
import { parseProductDetail } from '@/utils/productDisplay'

export interface CartLine {
  productId: number
  productName: string
  category: string
  coverImage?: string
  tag?: string
  price: number
  quantity: number
}

const STORAGE_KEY = 'bencao_market_cart'

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartLine[]>(loadCart())
  const selectedIds = ref<number[]>(items.value.map((i) => i.productId))

  watch(
    items,
    (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      const ids = new Set(val.map((i) => i.productId))
      selectedIds.value = selectedIds.value.filter((id) => ids.has(id))
      if (selectedIds.value.length === 0 && val.length) {
        selectedIds.value = val.map((i) => i.productId)
      }
    },
    { deep: true },
  )

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))

  const totalAmount = computed(() =>
    items.value.reduce((s, i) => s + i.price * i.quantity, 0),
  )

  const selectedItems = computed(() =>
    items.value.filter((i) => selectedIds.value.includes(i.productId)),
  )

  const selectedCount = computed(() =>
    selectedItems.value.reduce((s, i) => s + i.quantity, 0),
  )

  const selectedAmount = computed(() =>
    selectedItems.value.reduce((s, i) => s + i.price * i.quantity, 0),
  )

  const allSelected = computed(
    () => items.value.length > 0 && selectedIds.value.length === items.value.length,
  )

  const isIndeterminate = computed(
    () =>
      selectedIds.value.length > 0 && selectedIds.value.length < items.value.length,
  )

  function isSelected(productId: number) {
    return selectedIds.value.includes(productId)
  }

  function toggleSelect(productId: number, checked: boolean) {
    if (checked) {
      if (!selectedIds.value.includes(productId)) {
        selectedIds.value = [...selectedIds.value, productId]
      }
    } else {
      selectedIds.value = selectedIds.value.filter((id) => id !== productId)
    }
  }

  function toggleSelectAll(checked: boolean) {
    selectedIds.value = checked ? items.value.map((i) => i.productId) : []
  }

  function addProduct(product: ProductItem, quantity = 1) {
    const tag = parseProductDetail(product.detail).tag
    const existing = items.value.find((i) => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
      if (tag) existing.tag = tag
      if (!selectedIds.value.includes(product.id)) {
        selectedIds.value = [...selectedIds.value, product.id]
      }
      return
    }
    items.value.push({
      productId: product.id,
      productName: product.productName,
      category: product.category,
      coverImage: product.coverImage,
      tag,
      price: Number(product.price),
      quantity,
    })
    selectedIds.value = [...selectedIds.value, product.id]
  }

  function changeQuantity(productId: number, quantity: number) {
    const line = items.value.find((i) => i.productId === productId)
    if (!line) return
    if (quantity <= 0) {
      removeProduct(productId)
      return
    }
    line.quantity = quantity
  }

  function removeProduct(productId: number) {
    items.value = items.value.filter((i) => i.productId !== productId)
    selectedIds.value = selectedIds.value.filter((id) => id !== productId)
  }

  function clearCart() {
    items.value = []
    selectedIds.value = []
  }

  function removeSelected() {
    const set = new Set(selectedIds.value)
    items.value = items.value.filter((i) => !set.has(i.productId))
    selectedIds.value = items.value.map((i) => i.productId)
  }

  return {
    items,
    selectedIds,
    totalCount,
    totalAmount,
    selectedItems,
    selectedCount,
    selectedAmount,
    allSelected,
    isIndeterminate,
    isSelected,
    toggleSelect,
    toggleSelectAll,
    addProduct,
    changeQuantity,
    removeProduct,
    clearCart,
    removeSelected,
  }
})
