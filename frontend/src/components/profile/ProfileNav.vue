<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Lock, ShoppingBag, Star, Sunny, User } from '@element-plus/icons-vue'

const route = useRoute()

const items = [
  { key: 'profile', label: '个人资料', path: '/profile?tab=profile', icon: User },
  { key: 'security', label: '账号安全', path: '/profile?tab=security', icon: Lock },
  { key: 'overview', label: '我的概览', path: '/profile?tab=overview', icon: Sunny },
  { key: 'favorites', label: '我的收藏', path: '/profile?tab=favorites', icon: Star },
  { key: 'orders', label: '我的订单', path: '/market/orders', icon: ShoppingBag },
] as const

const activeKey = computed(() => {
  const tab = route.query.tab
  if (tab === 'security' || tab === 'overview' || tab === 'favorites') return tab
  if (route.path.startsWith('/market/orders')) return 'orders'
  return 'profile'
})
</script>

<template>
  <aside class="profile-nav">
    <RouterLink
      v-for="item in items"
      :key="item.key"
      :to="item.path"
      class="nav-item"
      :class="{ active: activeKey === item.key }"
    >
      <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
      <span class="nav-label">{{ item.label }}</span>
    </RouterLink>
  </aside>
</template>

<style scoped>
.profile-nav {
  width: 152px;
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
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  border-radius: var(--bc-radius);
  text-decoration: none;
  color: var(--bc-text-secondary);
  font-size: 15px;
  font-weight: 500;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.nav-item:hover {
  border-color: var(--bc-primary);
  color: var(--bc-primary);
}

.nav-item.active {
  background: var(--bc-primary);
  border-color: var(--bc-primary);
  color: #fff;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  flex: 1;
}

@media (max-width: 960px) {
  .profile-nav {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    position: static;
  }

  .nav-item {
    flex: 1;
    min-width: calc(50% - 4px);
    justify-content: center;
  }
}
</style>
