<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
import AcupointViewer from '@/modules/3d-zhenjiu/AcupointViewer.vue'
</script>

<template>
  <div class="page">
    <HomeHeader />
    <div class="viewer-shell">
      <AcupointViewer />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
}

.viewer-shell {
  flex: 1;
  min-height: 480px;
  height: calc(100vh - 64px);
  position: relative;
  overflow: hidden;
}

.viewer-shell :deep(.viewer-root) {
  width: 100%;
  height: 100%;
}
</style>
