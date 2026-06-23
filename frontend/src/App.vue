<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeConstitutionBot from '@/components/home/HomeConstitutionBot.vue'

const route = useRoute()

const showFloatingBot = computed(() => {
  const path = route.path
  if (path.startsWith('/admin')) return false
  return path !== '/login' && path !== '/register'
})
</script>

<template>
  <router-view />
  <HomeConstitutionBot v-if="showFloatingBot" />
</template>
