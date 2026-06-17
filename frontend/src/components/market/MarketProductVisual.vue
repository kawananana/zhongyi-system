<script setup lang="ts">
import { computed } from 'vue'
import MarketCategoryIcon from '@/components/market/MarketCategoryIcon.vue'
import { MARKET_CATEGORIES, marketCategoryLabel } from '@/utils/marketCategories'

const props = defineProps<{
  category: string
  size?: 'card' | 'detail' | 'thumb'
}>()

const meta = computed(
  () => MARKET_CATEGORIES.find((c) => c.key === props.category) ?? MARKET_CATEGORIES[4],
)

const label = computed(() => marketCategoryLabel(props.category || 'food_medicine'))
</script>

<template>
  <div
    class="market-visual"
    :class="size || 'card'"
    :style="{ background: meta.gradient }"
  >
    <MarketCategoryIcon :name="meta.key" class="visual-icon" />
    <span v-if="size !== 'thumb'" class="visual-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.market-visual {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
}

.market-visual.card {
  min-height: 140px;
}

.market-visual.detail {
  min-height: 320px;
  gap: 16px;
}

.market-visual.thumb {
  min-height: 56px;
  gap: 0;
}

.visual-icon {
  flex-shrink: 0;
}

.market-visual.card :deep(.cat-svg) {
  width: 72px;
  height: 72px;
}

.market-visual.detail :deep(.cat-svg) {
  width: 120px;
  height: 120px;
}

.market-visual.thumb :deep(.cat-svg) {
  width: 36px;
  height: 36px;
}

.visual-label {
  font-size: 13px;
  font-weight: 600;
  color: #5c5046;
  padding: 0 8px;
  text-align: center;
  line-height: 1.3;
}

.market-visual.detail .visual-label {
  font-size: 18px;
  color: #3d3028;
  font-family: 'Songti SC', 'SimSun', serif;
}
</style>
