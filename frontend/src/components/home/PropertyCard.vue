<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { NatureOption } from '@/api/herb'
import { getNatureTheme } from '@/utils/natureTheme'

const props = defineProps<{
  item: NatureOption
}>()

const router = useRouter()
const theme = computed(() => getNatureTheme(props.item.value))

function goList() {
  router.push({ path: '/atlas/herbs', query: { nature: props.item.value } })
}
</script>

<template>
  <div
    class="property-card"
    :style="{ background: theme.bg }"
    @click="goList"
  >
    <span class="card-icon" :style="{ color: theme.iconColor }">{{ theme.icon }}</span>
    <h3 class="card-title">{{ item.label }}</h3>
    <p class="card-count">{{ item.count }} ???</p>
  </div>
</template>

<style scoped>
.property-card {
  flex: 1;
  min-width: 0;
  padding: 20px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(26, 95, 63, 0.12);
}

.card-icon {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-count {
  margin: 0;
  font-size: 13px;
  color: #606266;
}
</style>
