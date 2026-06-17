<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { HerbCategory } from '@/utils/herbDisplay'
import { getCategoryTheme } from '@/utils/categoryTheme'

const props = defineProps<{
  category: HerbCategory
  count: number
}>()

const router = useRouter()
const theme = computed(() => getCategoryTheme(props.category.key))

function goList() {
  router.push({ path: '/atlas/herbs', query: { category: props.category.key } })
}
</script>

<template>
  <div class="category-card" :style="{ background: theme.bg }" @click="goList">
    <span class="card-icon" :style="{ color: theme.iconColor }">{{ theme.icon }}</span>
    <h3 class="card-title">{{ category.label }}</h3>
    <p class="card-count">{{ count }} 味药材</p>
  </div>
</template>

<style scoped>
.category-card {
  flex: 1;
  min-width: 0;
  padding: 18px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.65);
  text-align: center;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(26, 95, 63, 0.12);
}

.card-icon {
  display: block;
  font-size: 26px;
  margin-bottom: 6px;
  font-weight: 700;
}

.card-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-count {
  margin: 0;
  font-size: 12px;
  color: #606266;
}
</style>
