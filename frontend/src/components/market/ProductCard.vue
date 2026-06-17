<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ProductItem } from '@/api/product'
import { useCartStore } from '@/store/cart'
import MarketProductImage from '@/components/market/MarketProductImage.vue'
import {
  formatSalesCount,
  parseProductDetail,
  productCategoryLabel,
  productDisplayTitle,
  productOriginalPrice,
} from '@/utils/productDisplay'
import { requireUserLogin } from '@/utils/requireLogin'

const props = defineProps<{
  product: ProductItem
}>()

const router = useRouter()
const cart = useCartStore()

const parsed = computed(() => parseProductDetail(props.product.detail))
const displayTitle = computed(() =>
  productDisplayTitle(props.product.productName, parsed.value.tag),
)
const categoryLabel = computed(() => productCategoryLabel(props.product.category))
const originalPrice = computed(() => productOriginalPrice(props.product.price))
const salesText = computed(() => formatSalesCount(props.product.salesCount))
const detailTo = computed(() => `/market/products/${props.product.id}`)

function formatPrice(price: number) {
  const n = Number(price)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function addToCart(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  if (!requireUserLogin(router, '登录后可加入购物车')) return
  cart.addProduct(props.product)
  ElMessage.success('已加入购物车')
}
</script>

<template>
  <RouterLink :to="detailTo" class="product-card">
    <div class="card-img-wrap">
      <MarketProductImage
        :product-id="product.id"
        :product-name="product.productName"
        :category="product.category"
        :cover-image="product.coverImage"
        :alt="displayTitle"
        fit="cover"
      />
      <button type="button" class="cart-fab" aria-label="加入购物车" @click="addToCart">
        <el-icon><ShoppingCart /></el-icon>
      </button>
    </div>
    <div class="card-body">
      <div class="title-row">
        <h3 class="name">{{ displayTitle }}</h3>
        <span class="category-tag">{{ categoryLabel }}</span>
      </div>
      <p v-if="parsed.spec" class="spec">{{ parsed.spec }}</p>
      <p v-if="parsed.summary" class="summary">{{ parsed.summary }}</p>
      <div class="price-row">
        <span class="price">¥{{ formatPrice(product.price) }}</span>
        <span class="origin-price">¥{{ formatPrice(originalPrice) }}</span>
      </div>
      <div class="meta-row">
        <span v-if="salesText" class="sales">{{ salesText }}</span>
        <span class="ship-tag">现货包邮</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  height: 100%;
  transition: box-shadow 0.25s, transform 0.25s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(92, 64, 51, 0.1);
}

.card-img-wrap {
  position: relative;
  aspect-ratio: 1;
  min-height: 150px;
  overflow: hidden;
  background: #ebe3d6;
}

.cart-fab {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #1a5f3f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(26, 95, 63, 0.35);
}

.cart-fab:hover {
  background: #2d7a5a;
}

.card-body {
  padding: 10px 10px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #3d3028;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-tag {
  flex-shrink: 0;
  font-size: 11px;
  color: #8b6914;
  border: 1px solid #e5d5b3;
  background: #fff8ea;
  border-radius: 999px;
  padding: 0 8px;
  line-height: 20px;
}

.spec,
.summary {
  margin: 0;
  font-size: 12px;
  color: #6b6258;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spec {
  -webkit-line-clamp: 1;
}

.summary {
  -webkit-line-clamp: 2;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 2px;
}

.price {
  font-size: 17px;
  font-weight: 700;
  color: #c45c26;
}

.origin-price {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sales {
  margin: 0;
  font-size: 11px;
  color: #909399;
}

.ship-tag {
  align-self: flex-start;
  font-size: 11px;
  color: #1a5f3f;
  border: 1px solid #a8d4bc;
  background: #f0f9f4;
  border-radius: 3px;
  padding: 0 6px;
  line-height: 18px;
  white-space: nowrap;
}
</style>
