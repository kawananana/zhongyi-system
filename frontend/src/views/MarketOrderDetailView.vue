<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import MarketPageShell from '@/components/market/MarketPageShell.vue'
import { useOrderStore, orderStatusLabel } from '@/store/order'
import MarketProductImage from '@/components/market/MarketProductImage.vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const order = computed(() =>
  orderStore.orders.find((o) => o.id === route.params.id),
)

function formatPrice(n: number) {
  return n.toFixed(2)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <MarketPageShell>
    <div v-if="order" class="panel-card">
      <header class="panel-head">
        <button type="button" class="back-btn" @click="router.push('/market/orders')">
          <el-icon><ArrowLeft /></el-icon>
          返回订单列表
        </button>
        <em class="status">{{ orderStatusLabel(order.orderStatus) }}</em>
      </header>

      <section class="order-meta-block">
        <p class="label">订单编号</p>
        <p class="value">{{ order.orderNo }}</p>
        <p class="label">下单时间</p>
        <p class="value">{{ formatTime(order.createTime) }}</p>
      </section>

      <section class="items-section">
        <h2>商品明细</h2>
        <ul class="item-list">
          <li v-for="item in order.items" :key="item.productId" class="item-line">
            <RouterLink :to="`/market/products/${item.productId}`" class="line-thumb">
              <div class="thumb-inner">
                <MarketProductImage
                  :product-id="item.productId"
                  :product-name="item.productName"
                  :category="item.category"
                  :alt="item.productName"
                  fit="cover"
                />
              </div>
            </RouterLink>
            <div class="line-info">
              <RouterLink :to="`/market/products/${item.productId}`" class="line-name">
                {{ item.productName }}
              </RouterLink>
              <p class="line-sub">¥{{ formatPrice(item.unitPrice) }} × {{ item.quantity }}</p>
            </div>
            <p class="line-total">¥{{ formatPrice(item.unitPrice * item.quantity) }}</p>
          </li>
        </ul>
      </section>

      <footer class="panel-footer">
        <span>订单金额</span>
        <strong class="total-price">¥{{ formatPrice(order.totalAmount) }}</strong>
      </footer>
    </div>

    <div v-else class="panel-card empty-wrap">
      <el-empty description="订单不存在或已删除">
        <el-button type="primary" @click="router.push('/market/orders')">返回订单列表</el-button>
      </el-empty>
    </div>
  </MarketPageShell>
</template>

<style scoped>
.panel-card {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  overflow: hidden;
}

.empty-wrap {
  padding: 48px 24px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0ebe3;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: none;
  font-size: 14px;
  color: #1a5f3f;
  cursor: pointer;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.status {
  font-style: normal;
  font-size: 13px;
  color: #1a5f3f;
  background: #f0f9f4;
  padding: 4px 10px;
  border-radius: 4px;
}

.order-meta-block {
  padding: 20px 24px;
  border-bottom: 1px solid #f5f0e8;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
}

.label {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.value {
  margin: 0;
  font-size: 15px;
  color: #3d3028;
  font-weight: 500;
}

.items-section {
  padding: 20px 24px;
}

.items-section h2 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #3d3028;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item-line {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid #f5f0e8;
}

.item-line:last-child {
  border-bottom: none;
}

.line-thumb {
  text-decoration: none;
  flex-shrink: 0;
}

.thumb-inner {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bc-border, #e8e0d4);
}

.line-info {
  flex: 1;
  min-width: 0;
}

.line-name {
  display: block;
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: #3d3028;
  text-decoration: none;
}

.line-name:hover {
  color: #1a5f3f;
}

.line-sub {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.line-total {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #c45c26;
}

.panel-footer {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0ebe3;
  font-size: 15px;
  color: #5c5046;
}

.total-price {
  font-size: 26px;
  color: #c45c26;
}
</style>
