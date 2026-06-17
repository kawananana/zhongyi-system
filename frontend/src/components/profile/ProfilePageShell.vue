<script setup lang="ts">
import HomeHeader from '@/components/home/HomeHeader.vue'
import ProfileNav from '@/components/profile/ProfileNav.vue'
</script>

<template>
  <div class="page">
    <HomeHeader />
    <div class="profile-layout">
      <ProfileNav />
      <main class="profile-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bc-bg);
}

.profile-layout {
  max-width: 1080px;
  margin: 0 auto;
  padding: 16px 24px 48px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 960px) {
  .profile-layout {
    flex-direction: column;
  }
}
</style>
