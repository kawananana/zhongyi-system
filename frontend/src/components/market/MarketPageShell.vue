<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
import MarketNav from '@/components/market/MarketNav.vue'
</script>

<template>
  <div class="page">
    <HomeHeader />
    <div class="market-layout">
      <MarketNav />
      <main class="market-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3efe6;
}

.market-layout {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px 48px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.market-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 960px) {
  .market-layout {
    flex-direction: column;
  }
}
</style>
