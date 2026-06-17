<script setup lang="ts">
import AdminNavbar from '@/components/AdminNavbar.vue'
import AdminSidebar from '@/components/AdminSidebar.vue'
</script>

<template>
  <el-container class="admin-layout">
    <el-header class="admin-header" height="60px">
      <AdminNavbar />
    </el-header>
    <el-container>
      <el-aside class="admin-aside" width="220px">
        <AdminSidebar />
      </el-aside>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f5f7fa;
}

.admin-header {
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.admin-aside {
  background: #1a5f3f;
  overflow: hidden;
}

.admin-main {
  padding: 20px;
}
</style>
