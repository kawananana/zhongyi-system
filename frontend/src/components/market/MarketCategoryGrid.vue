<script setup lang="ts">
import { MARKET_CATEGORIES } from '@/utils/marketCategories'
import MarketCategoryIcon from '@/components/market/MarketCategoryIcon.vue'

const active = defineModel<string>('active', { default: '' })

function select(key: string) {
  active.value = active.value === key ? '' : key
}
</script>

<template>
  <section class="category-grid">
    <button
      v-for="cat in MARKET_CATEGORIES"
      :key="cat.key"
      type="button"
      class="category-item"
      :class="{ active: active === cat.key }"
      @click="select(cat.key)"
    >
      <span class="icon-wrap" :style="{ background: cat.gradient }">
        <MarketCategoryIcon :name="cat.key" class="icon-svg" />
      </span>
      <span class="label">{{ cat.label }}</span>
    </button>
  </section>
</template>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px 14px;
  padding: 12px 0 24px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 12px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.category-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.6);
}

.category-item:hover .icon-wrap {
  box-shadow: 0 6px 16px rgba(92, 64, 51, 0.14);
}

.category-item.active .icon-wrap {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px #1a5f3f,
    0 6px 16px rgba(92, 64, 51, 0.12);
  transform: scale(1.04);
}

.category-item.active .label {
  color: #1a5f3f;
  font-weight: 600;
}

.icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(92, 64, 51, 0.08);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.icon-svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.06));
}

.label {
  font-size: 13px;
  color: #5c5046;
  letter-spacing: 0.02em;
  transition: color 0.2s;
}

.category-item:hover .label {
  color: #1a5f3f;
}

@media (max-width: 900px) {
  .category-grid {
    gap: 14px 8px;
  }

  .icon-wrap {
    width: 52px;
    height: 52px;
  }

  .label {
    font-size: 11px;
  }
}
</style>
