<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import MarketPageShell from '@/components/market/MarketPageShell.vue'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import { requireUserLogin } from '@/utils/requireLogin'
import { saveCheckoutLines } from '@/utils/checkoutStorage'
import MarketProductImage from '@/components/market/MarketProductImage.vue'
import { productCategoryLabel } from '@/utils/productDisplay'

const router = useRouter()
const cart = useCartStore()
const userStore = useUserStore()

const hasItems = computed(() => cart.items.length > 0)

function formatPrice(n: number) {
  return n.toFixed(2)
}

function lineTag(line: { tag?: string; category: string }) {
  return line.tag || productCategoryLabel(line.category)
}

function checkout() {
  if (!requireUserLogin(router, '登录后可结算下单')) return
  if (!cart.selectedItems.length) {
    ElMessage.warning('请先勾选要结算的商品')
    return
  }
  saveCheckoutLines(cart.selectedItems)
  router.push('/market/checkout')
}
</script>

<template>
  <MarketPageShell>
    <div class="cart-page">
      <header class="cart-header">
        <span class="cart-icon-wrap">
          <el-icon><ShoppingCart /></el-icon>
        </span>
        <h1>我的购物车 <span class="count">(共 {{ cart.totalCount }} 件商品)</span></h1>
      </header>

      <el-alert
        v-if="!userStore.isLoggedIn() && hasItems"
        type="info"
        :closable="false"
        show-icon
        class="guest-alert"
        title="游客可浏览市集与商品，登录后方可结算下单"
      />

      <el-empty v-if="!hasItems" class="cart-empty" description="购物车是空的">
        <RouterLink to="/market">
          <el-button type="primary" class="shop-btn">去逛逛</el-button>
        </RouterLink>
      </el-empty>

      <template v-else>
        <div class="cart-table">
          <div class="table-head row">
            <span class="col-check" />
            <span class="col-info">商品信息</span>
            <span class="col-price">单价</span>
            <span class="col-qty">数量</span>
            <span class="col-sub">小计</span>
            <span class="col-op">操作</span>
          </div>

          <div
            v-for="line in cart.items"
            :key="line.productId"
            class="table-row row"
          >
            <div class="col-check">
              <el-checkbox
                :model-value="cart.isSelected(line.productId)"
                @change="(v: boolean) => cart.toggleSelect(line.productId, v)"
              />
            </div>

            <div class="col-info">
              <RouterLink :to="`/market/products/${line.productId}`" class="thumb-link">
                <div class="thumb">
                  <MarketProductImage
                    :product-id="line.productId"
                    :product-name="line.productName"
                    :category="line.category || 'food_medicine'"
                    :cover-image="line.coverImage"
                    :alt="line.productName"
                    fit="cover"
                  />
                </div>
              </RouterLink>
              <div class="info-text">
                <RouterLink :to="`/market/products/${line.productId}`" class="name">
                  {{ line.productName }}
                </RouterLink>
                <span class="tag">{{ lineTag(line) }}</span>
              </div>
            </div>

            <div class="col-price">¥{{ formatPrice(line.price) }}</div>

            <div class="col-qty">
              <el-input-number
                :model-value="line.quantity"
                :min="1"
                :max="99"
                size="small"
                controls-position="right"
                @change="(v: number | undefined) => cart.changeQuantity(line.productId, v ?? 1)"
              />
            </div>

            <div class="col-sub">¥{{ formatPrice(line.price * line.quantity) }}</div>

            <div class="col-op">
              <button
                type="button"
                class="del-btn"
                aria-label="删除"
                @click="cart.removeProduct(line.productId)"
              >
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <footer class="cart-footer">
          <div class="footer-left">
            <el-checkbox
              :model-value="cart.allSelected"
              :indeterminate="cart.isIndeterminate"
              @change="(v: boolean) => cart.toggleSelectAll(v)"
            >
              全选
            </el-checkbox>
            <span class="selected-tip">已选 {{ cart.selectedCount }} 件</span>
          </div>
          <div class="footer-right">
            <span class="pay-label">合计：</span>
            <strong class="pay-amount">¥ {{ formatPrice(cart.selectedAmount) }}</strong>
            <el-button
              type="primary"
              class="checkout-btn"
              :disabled="cart.selectedCount === 0"
              @click="checkout"
            >
              {{ userStore.isLoggedIn() ? '去结算' : '登录后结算' }}
            </el-button>
          </div>
        </footer>
      </template>
    </div>
  </MarketPageShell>
</template>

<style scoped>
.guest-alert {
  margin: 0 24px 16px;
}

.cart-page {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(61, 48, 40, 0.06);
}

.cart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ebe3;
}

.cart-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f9f4;
  color: #1a5f3f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.cart-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #3d3028;
}

.cart-header .count {
  font-size: 15px;
  font-weight: 500;
  color: #909399;
}

.cart-empty {
  padding: 48px 24px;
}

.shop-btn {
  --el-button-bg-color: #1a5f3f;
  --el-button-border-color: #1a5f3f;
}

.row {
  display: grid;
  grid-template-columns: 48px 1fr 100px 120px 100px 64px;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
}

.table-head {
  height: 44px;
  background: #faf8f4;
  border-bottom: 1px solid #f0ebe3;
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.table-row {
  padding: 20px;
  border-bottom: 1px solid #f5f0e8;
}

.col-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.thumb-link {
  flex-shrink: 0;
  text-decoration: none;
}

.thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bc-border, #e8e0d4);
}

.info-text {
  min-width: 0;
}

.name {
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #3d3028;
  text-decoration: none;
  line-height: 1.4;
}

.name:hover {
  color: #1a5f3f;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: #1a5f3f;
  background: #f0f9f4;
  border-radius: 4px;
}

.col-price {
  font-size: 14px;
  color: #5c5046;
}

.col-sub {
  font-size: 16px;
  font-weight: 700;
  color: #c45c26;
}

.del-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #fdf2f0;
  color: #c45c26;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.del-btn:hover {
  background: #f5ddd6;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #faf8f4;
  border-top: 1px solid #f0ebe3;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #5c5046;
}

.selected-tip {
  color: #909399;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pay-label {
  font-size: 14px;
  color: #5c5046;
}

.pay-amount {
  font-size: 22px;
  font-weight: 700;
  color: #c45c26;
  margin-right: 8px;
}

.checkout-btn {
  min-width: 140px;
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  --el-button-bg-color: #1a5f3f;
  --el-button-border-color: #1a5f3f;
}

.checkout-btn:hover {
  --el-button-bg-color: #2d7a5a;
  --el-button-border-color: #2d7a5a;
}

@media (max-width: 900px) {
  .row {
    grid-template-columns: 40px 1fr 80px 100px;
    grid-template-rows: auto auto;
  }

  .table-head .col-price,
  .table-head .col-sub,
  .table-head .col-op {
    display: none;
  }

  .table-row .col-price,
  .table-row .col-sub {
    grid-column: 2;
    font-size: 13px;
  }

  .table-row .col-qty {
    grid-column: 3 / -1;
  }

  .table-row .col-op {
    position: absolute;
    right: 16px;
    top: 20px;
  }

  .table-row {
    position: relative;
  }
}
</style>
