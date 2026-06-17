<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { productCoverSrc } from '@/utils/productDisplay'
import { getMarketCategoryMeta } from '@/utils/marketCategories'

const props = withDefaults(
  defineProps<{
    productId?: number
    productName: string
    category: string
    coverImage?: string
    alt?: string
    fit?: 'cover' | 'contain'
  }>(),
  {
    alt: '',
    fit: 'cover',
  },
)

const loadFailed = ref(false)
const imgLoaded = ref(false)

const src = computed(() =>
  productCoverSrc({
    id: props.productId,
    productName: props.productName,
    category: props.category,
    coverImage: props.coverImage,
  }),
)

const catMeta = computed(() => getMarketCategoryMeta(props.category || 'food_medicine'))
const displayAlt = computed(() => props.alt || props.productName)

function onError() {
  loadFailed.value = true
  imgLoaded.value = true
}

function onLoad() {
  imgLoaded.value = true
}

watch(src, () => {
  loadFailed.value = false
  imgLoaded.value = false
})
</script>

<template>
  <div class="market-img-wrap">
    <div v-if="!imgLoaded && !loadFailed" class="img-skeleton" aria-hidden="true" />
    <img
      v-show="!loadFailed"
      class="market-img"
      :class="[`fit-${fit}`, { loaded: imgLoaded }]"
      :src="src"
      :alt="displayAlt"
      loading="eager"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />
    <div
      v-if="loadFailed"
      class="market-fallback"
      :style="{ background: catMeta.gradient }"
    >
      <div class="fallback-card">
        <span class="fallback-emoji">{{ catMeta.icon }}</span>
        <span class="fallback-text">{{ catMeta.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-img-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f2f3f5;
  overflow: hidden;
}

.img-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f2f3f5 25%, #e8e8e8 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.market-img {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.2s;
}

.market-img.loaded {
  opacity: 1;
}

.fit-cover {
  object-fit: cover;
}

.fit-contain {
  object-fit: contain;
  padding: 8px;
  background: #faf8f4;
}

.market-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  backdrop-filter: blur(1px);
}

.fallback-card {
  min-width: 120px;
  min-height: 120px;
  padding: 18px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.fallback-emoji {
  font-size: 40px;
  line-height: 1;
}

.fallback-text {
  font-size: 12px;
  font-weight: 600;
  color: #6b6258;
}
</style>
