<script setup lang="ts">
import { useAdminStore } from '@/store'
import { useRouter } from 'vue-router'

const adminStore = useAdminStore()
const router = useRouter()

function handleLogout() {
  adminStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-navbar">
    <div class="brand">
      <span class="brand-title">本草萌智</span>
      <span class="brand-sub">运营管理后台</span>
    </div>
    <div class="navbar-right">
      <span class="user-name">{{ adminStore.adminBrief?.username || '管理员' }}</span>
      <el-button type="primary" link @click="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<style scoped>
.admin-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.brand-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a5f3f;
}

.brand-sub {
  font-size: 13px;
  color: #909399;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: #606266;
}
</style>
