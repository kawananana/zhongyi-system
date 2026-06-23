<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataAnalysis,
  Goods,
  ChatDotRound,
  Collection,
  User,
  RefreshLeft,
  ShoppingBag,
} from '@element-plus/icons-vue'

interface MenuItem {
  title: string
  path: string
  icon: typeof Collection
}

const menuItems: MenuItem[] = [
  { title: '数据看板', path: '/admin/dashboard', icon: DataAnalysis },
  { title: '学员管理', path: '/admin/users', icon: User },
  { title: '图鉴管理', path: '/admin/herbs', icon: Collection },
  { title: '市集商品', path: '/admin/products', icon: Goods },
  { title: '订单管理', path: '/admin/orders', icon: ShoppingBag },
  { title: '退货审核', path: '/admin/returns', icon: RefreshLeft },
  { title: '论坛管控', path: '/admin/forum', icon: ChatDotRound },
]

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    class="admin-sidebar-menu"
    background-color="#1a5f3f"
    text-color="#e8f5ee"
    active-text-color="#ffffff"
  >
    <el-menu-item
      v-for="item in menuItems"
      :key="item.path"
      :index="item.path"
      @click="navigate(item.path)"
    >
      <el-icon><component :is="item.icon" /></el-icon>
      <span>{{ item.title }}</span>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.admin-sidebar-menu {
  border-right: none;
  min-height: calc(100vh - 60px);
}

.admin-sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}
</style>
