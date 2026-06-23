<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Headset,
  Share,
  Star,
  ShoppingCart,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import HomeHeader from '@/components/home/HomeHeader.vue'
import MarketProductImage from '@/components/market/MarketProductImage.vue'
import { getMarketCategoryMeta } from '@/utils/marketCategories'
import { fetchProductDetail, type ProductItem } from '@/api/product'
import { useCartStore } from '@/store/cart'
import type { CartLine } from '@/store/cart'
import { saveCheckoutLines } from '@/utils/checkoutStorage'
import {
  formatSalesCount,
  parseProductDetail,
  productDisplayTitle,
  productOriginalPrice,
} from '@/utils/productDisplay'
import { requireUserLogin } from '@/utils/requireLogin'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const loading = ref(false)
const product = ref<ProductItem | null>(null)
const parsed = computed(() => parseProductDetail(product.value?.detail))
const displayTitle = computed(() =>
  product.value
    ? productDisplayTitle(product.value.productName, parsed.value.tag)
    : '',
)
const originalPrice = computed(() =>
  product.value ? productOriginalPrice(product.value.price) : 0,
)
const salesText = computed(() => formatSalesCount(product.value?.salesCount))
const catMeta = computed(() =>
  product.value
    ? getMarketCategoryMeta(product.value.category)
    : getMarketCategoryMeta('food_medicine'),
)
const selectedSpec = computed(() => parsed.value.spec || '默认规格')

function formatPrice(price: number) {
  const n = Number(price)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function goBack() {
  router.push('/market')
}

function addToCart() {
  if (!product.value) return
  if (!requireUserLogin(router, '登录后可加入购物车')) return
  cart.addProduct(product.value)
  ElMessage.success('已加入购物车')
}

async function buyNow() {
  if (!product.value) return
  if (!requireUserLogin(router, '登录后可购买商品')) return
  const line: CartLine = {
    productId: product.value.id,
    productName: product.value.productName,
    category: product.value.category,
    coverImage: product.value.coverImage,
    price: Number(product.value.price),
    quantity: 1,
  }
  saveCheckoutLines([line])
  router.push('/market/checkout')
}

async function loadProduct(id: number) {
  if (!id) {
    product.value = null
    loading.value = false
    return
  }
  loading.value = true
  product.value = null
  try {
    product.value = await fetchProductDetail(id)
  } catch {
    product.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (id) => loadProduct(Number(id)),
  { immediate: true },
)
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main v-loading="loading" class="main">
      <template v-if="product">
        <button type="button" class="back-link" @click="goBack">← 返回本草市集</button>

        <section class="gallery">
          <button type="button" class="float-btn back-btn" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <div class="gallery-slide">
            <MarketProductImage
              :product-id="product.id"
              :product-name="product.productName"
              :category="product.category"
              :cover-image="product.coverImage"
              :alt="displayTitle"
              fit="cover"
            />
          </div>
        </section>

        <article class="detail-panel">
          <section class="info-card">
            <div class="price-block">
              <div class="price-left">
                <span class="cur-price">¥ {{ formatPrice(product.price) }}</span>
                <span class="old-price">¥ {{ formatPrice(originalPrice) }}</span>
                <span class="badge promo">限时优惠</span>
                <span class="badge ship">包邮</span>
              </div>
              <div class="price-actions">
                <button type="button" class="icon-btn" aria-label="收藏">
                  <el-icon><Star /></el-icon>
                </button>
                <button type="button" class="icon-btn" aria-label="分享">
                  <el-icon><Share /></el-icon>
                </button>
              </div>
            </div>

            <div class="title-row">
              <h1 class="title">{{ displayTitle }}</h1>
              <div v-if="salesText || product.stock" class="stats">
                <span v-if="salesText">{{ salesText }}</span>
                <span v-if="salesText && product.stock" class="sep">|</span>
                <span v-if="product.stock">剩余 {{ product.stock }} 件</span>
              </div>
            </div>

            <ul class="guarantees">
              <li><el-icon><CircleCheck /></el-icon> 正品保证</li>
              <li><el-icon><CircleCheck /></el-icon> 可配送全国</li>
              <li><el-icon><CircleCheck /></el-icon> 免运费</li>
              <li><el-icon><CircleCheck /></el-icon> 七天无理由退货</li>
            </ul>
          </section>

          <section class="spec-card">
            <div class="spec-head">
              <span class="spec-label">选择规格</span>
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </div>
            <div class="spec-body">
              <div class="spec-thumb" :style="{ background: catMeta.gradient }">
                <span class="spec-emoji">{{ catMeta.icon }}</span>
              </div>
              <div>
                <p class="spec-selected">已选：{{ selectedSpec }}</p>
                <p class="spec-hint">共 1 种商品规格可选</p>
              </div>
            </div>
          </section>

          <section v-if="parsed.summary" class="detail-card">
            <h2>商品详情</h2>
            <p>{{ parsed.summary }}</p>
            <p v-if="parsed.spec" class="detail-spec">规格：{{ parsed.spec }}</p>
          </section>
        </article>

        <div class="footer-spacer" />
      </template>

      <el-empty v-else-if="!loading" description="商品不存在" />
    </main>

    <footer v-if="product" class="bottom-bar">
      <button type="button" class="service-btn">
        <el-icon><Headset /></el-icon>
        <span>客服</span>
      </button>
      <button type="button" class="cart-btn" @click="addToCart">
        <el-icon><ShoppingCart /></el-icon>
        加入购物车
      </button>
      <button type="button" class="buy-btn" @click="buyNow">立即购买</button>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
  padding-bottom: 72px;
}

.main {
  max-width: 900px;
  margin: 0 auto;
  padding: 16px 24px 48px;
}

.back-link {
  border: none;
  background: none;
  color: #4a7fb5;
  cursor: pointer;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 0;
}

.back-link:hover {
  text-decoration: underline;
}

.gallery {
  position: relative;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e0d4;
  margin-bottom: 16px;
}

.gallery-slide {
  width: 100%;
  height: 360px;
  overflow: hidden;
  background: #ebe3d6;
}

.spec-emoji {
  font-size: 32px;
  line-height: 1;
}

.float-btn {
  position: absolute;
  z-index: 10;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  top: 12px;
  left: 12px;
}

.img-counter {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 10;
  padding: 4px 10px;
  font-size: 12px;
  color: #fff;
  background: rgba(61, 48, 40, 0.55);
  border-radius: 12px;
}

.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card,
.spec-card,
.detail-card {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  padding: 18px 20px;
}

.price-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.price-left {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 8px;
}

.cur-price {
  font-size: 28px;
  font-weight: 700;
  color: #c45c26;
}

.old-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge.promo {
  background: #fff8e6;
  color: #8b6914;
  border: 1px solid #e8d4a8;
}

.badge.ship {
  background: #f0f9f4;
  color: #1a5f3f;
  border: 1px solid #a8d4bc;
}

.price-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e8e0d4;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c5046;
}

.title-row {
  margin-top: 14px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #3d3028;
  line-height: 1.5;
  font-family: 'Songti SC', 'SimSun', serif;
}

.stats {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.sep {
  margin: 0 6px;
}

.guarantees {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  font-size: 12px;
  color: #1a5f3f;
}

.guarantees li {
  display: flex;
  align-items: center;
  gap: 4px;
}

.spec-card {
  cursor: default;
}

.spec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.spec-label {
  font-size: 15px;
  font-weight: 600;
  color: #3d3028;
}

.arrow {
  color: #c0c4cc;
}

.spec-body {
  display: flex;
  gap: 12px;
  align-items: center;
}

.spec-thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid #e8e0d4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-selected {
  margin: 0 0 4px;
  font-size: 14px;
  color: #3d3028;
}

.spec-hint {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.detail-card h2 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #3d3028;
}

.detail-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #5c5046;
}

.detail-spec {
  margin-top: 10px !important;
  color: #909399;
  font-size: 13px !important;
}

.footer-spacer {
  height: 16px;
}

.bottom-bar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  z-index: 200;
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #e8e0d4;
  box-shadow: 0 -2px 12px rgba(92, 64, 51, 0.08);
}

.service-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: none;
  background: none;
  font-size: 11px;
  color: #5c5046;
  cursor: pointer;
  padding: 0 8px;
  flex-shrink: 0;
}

.cart-btn {
  flex: 1;
  height: 44px;
  border: 1px solid #1a5f3f;
  border-radius: 8px;
  background: #fff;
  color: #1a5f3f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cart-btn:hover {
  background: #f0f9f4;
}

.buy-btn {
  flex: 1.2;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: #1a5f3f;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.buy-btn:hover {
  background: #2d7a5a;
}
</style>
