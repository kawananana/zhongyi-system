<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
</script>

<template>
  <div class="page">
    <HomeHeader />
    <main class="main">
      <el-empty :description="`${$route.meta.title}模块开发中`" />
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f7f3eb;
}
.main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 24px;
}
</style>
