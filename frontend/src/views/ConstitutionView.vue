<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
import ConstitutionQuizPanel from '@/components/wellness/ConstitutionQuizPanel.vue'
</script>

<template>
  <div class="constitution-page">
    <HomeHeader />
    <main class="constitution-main">
      <ConstitutionQuizPanel />
    </main>
  </div>
</template>

<style scoped>
.constitution-page {
  min-height: 100vh;
  background: #f7f3eb;
}

.constitution-main {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 24px 48px;
}
</style>
