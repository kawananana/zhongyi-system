<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ShoppingCart, List, Shop } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { useOrderStore } from '@/store/order'

const route = useRoute()
const cart = useCartStore()
const orderStore = useOrderStore()

const items = [
  { key: 'shop', label: '逛市集', path: '/market', icon: Shop },
  { key: 'cart', label: '购物车', path: '/market/cart', icon: ShoppingCart, count: () => cart.totalCount },
  { key: 'orders', label: '我的订单', path: '/market/orders', icon: List, count: () => orderStore.orderCount },
] as const

function isActive(path: string) {
  if (path === '/market') {
    return route.path === '/market' || route.path.startsWith('/market/products/')
  }
  if (path === '/market/orders') {
    return route.path === '/market/orders' || route.path.startsWith('/market/orders/')
  }
  return route.path === path || route.path.startsWith(`${path}/`)
}

const activeKey = computed(() => items.find((i) => isActive(i.path))?.key ?? 'shop')
</script>

<template>
  <aside class="market-nav">
    <RouterLink
      v-for="item in items"
      :key="item.key"
      :to="item.path"
      class="nav-item"
      :class="{ active: activeKey === item.key }"
    >
      <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
      <span class="nav-label">{{ item.label }}</span>
      <el-badge
        v-if="item.count && item.count() > 0"
        :value="item.count()"
        class="nav-badge"
      />
    </RouterLink>
  </aside>
</template>

<style scoped>
.market-nav {
  width: 140px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 80px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e8e0d4;
  border-radius: 10px;
  text-decoration: none;
  color: #5c5046;
  font-size: 15px;
  font-weight: 500;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.nav-item:hover {
  border-color: #1a5f3f;
  color: #1a5f3f;
}

.nav-item.active {
  background: #1a5f3f;
  border-color: #1a5f3f;
  color: #fff;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  flex: 1;
}

.nav-badge :deep(.el-badge__content) {
  border: none;
}
</style>
