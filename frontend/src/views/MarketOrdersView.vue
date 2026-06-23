<script setup lang="ts">
import { onMounted } from 'vue'
import { CircleCheck, ShoppingBag } from '@element-plus/icons-vue'
import MarketPageShell from '@/components/market/MarketPageShell.vue'
import { useOrderStore, orderStatusLabel, returnStatusLabel } from '@/store/order'
import { useUserStore } from '@/store/user'

const orderStore = useOrderStore()
const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn()) {
    await orderStore.loadOrders()
  }
})

function formatPrice(n: number) {
  return n.toFixed(2)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function statusClass(status: MarketOrder['orderStatus']) {
  if (status === 2) return 'done'
  if (status === 3) return 'cancel'
  if (status === 1) return 'ship'
  return 'pending'
}
</script>

<template>
  <MarketPageShell>
    <div class="orders-page">
      <header class="hero-card">
        <div class="hero-left">
          <span class="hero-icon">
            <el-icon><CircleCheck /></el-icon>
          </span>
          <div>
            <h1>订单管理中心</h1>
            <p>诚实经营，真实数据。您可以在此查看本草市集订单与售后进度。</p>
          </div>
        </div>
        <div class="hero-actions">
          <RouterLink to="/market/cart">
            <el-button class="btn-outline">&lt; 返回购物车</el-button>
          </RouterLink>
          <RouterLink to="/market">
            <el-button type="primary" class="btn-primary">继续逛逛</el-button>
          </RouterLink>
        </div>
      </header>

      <section class="history-section">
        <h2 class="section-title">
          <el-icon><ShoppingBag /></el-icon>
          我的历史订单
        </h2>

        <el-empty v-if="!orderStore.loading && orderStore.orders.length === 0" description="暂无历史订单">
          <RouterLink to="/market">
            <el-button type="primary" class="btn-primary">去市集逛逛</el-button>
          </RouterLink>
        </el-empty>

        <div v-else class="order-cards" v-loading="orderStore.loading">
          <article
            v-for="order in orderStore.orders"
            :key="order.id"
            class="order-card"
          >
            <div class="card-meta">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ formatTime(order.createTime) }}</span>
              <span class="status-badge" :class="statusClass(order.orderStatus)">
                {{ orderStatusLabel(order.orderStatus) }}
              </span>
            </div>

            <ul class="item-rows">
              <li v-for="item in order.items" :key="`${order.id}-${item.productId}`">
                <RouterLink :to="`/market/products/${item.productId}`" class="item-name">
                  {{ item.productName }}
                </RouterLink>
                <span class="item-price">¥ {{ formatPrice(item.unitPrice) }} × {{ item.quantity }}</span>
              </li>
            </ul>

            <div class="card-foot">
              <span class="ship-info">
                收货人：{{ order.receiverName || '—' }}
                <template v-if="order.receiverPhone"> | {{ order.receiverPhone }}</template>
                <template v-if="order.receiverAddress">
                  | {{ order.receiverAddress }}
                </template>
              </span>
              <div class="foot-actions">
                <el-tag
                  v-if="order.returnRequest"
                  size="small"
                  :type="order.returnRequest.status === 1 ? 'success' : order.returnRequest.status === 2 ? 'danger' : 'warning'"
                >
                  {{ returnStatusLabel(order.returnRequest.status) }}
                </el-tag>
                <RouterLink :to="`/market/orders/${order.id}`">
                  <el-button type="primary" link>查看详情</el-button>
                </RouterLink>
                <span class="paid">
                  实付：<strong>¥ {{ formatPrice(order.totalAmount) }}</strong>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </MarketPageShell>
</template>

<style scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  border-top: 4px solid #1a5f3f;
  box-shadow: 0 2px 12px rgba(61, 48, 40, 0.06);
}

.hero-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 240px;
}

.hero-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #1a5f3f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.hero-left h1 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #3d3028;
}

.hero-left p {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-outline {
  border-color: #dcdfe6;
  color: #5c5046;
}

.btn-primary {
  --el-button-bg-color: #1a5f3f;
  --el-button-border-color: #1a5f3f;
  border-radius: 8px;
}

.history-section {
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 12px;
  padding: 20px 24px 24px;
  box-shadow: 0 2px 12px rgba(61, 48, 40, 0.06);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  font-size: 17px;
  font-weight: 700;
  color: #3d3028;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  border: 1px solid #f0ebe3;
  border-radius: 10px;
  overflow: hidden;
  background: #faf8f4;
}

.card-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding: 14px 18px;
  background: #fff;
  border-bottom: 1px solid #f0ebe3;
  font-size: 13px;
}

.order-no {
  font-weight: 600;
  color: #3d3028;
}

.order-time {
  color: #909399;
  flex: 1;
}

.status-badge {
  font-style: normal;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}

.status-badge.pending {
  background: #fff8e6;
  color: #8b6914;
}

.status-badge.ship {
  background: #e8f4fc;
  color: #409eff;
}

.status-badge.done {
  background: #f0f9f4;
  color: #1a5f3f;
}

.status-badge.cancel {
  background: #f5f5f5;
  color: #909399;
}

.item-rows {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #fff;
}

.item-rows li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
  border-bottom: 1px solid #f5f0e8;
  font-size: 14px;
}

.item-rows li:last-child {
  border-bottom: none;
}

.item-name {
  color: #3d3028;
  text-decoration: none;
  flex: 1;
  min-width: 0;
}

.item-name:hover {
  color: #1a5f3f;
}

.item-price {
  color: #5c5046;
  flex-shrink: 0;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  background: #fff;
  border-top: 1px solid #f0ebe3;
  font-size: 13px;
}

.foot-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
}

.ship-info {
  color: #909399;
  flex: 1;
  min-width: 200px;
}

.paid {
  color: #5c5046;
}

.paid strong {
  font-size: 18px;
  color: #c45c26;
  font-weight: 700;
}
</style>
