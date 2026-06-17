<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useGameScoreStore } from '@/store/gameScore'

defineProps<{
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{ back: [] }>()
const scoreStore = useGameScoreStore()
</script>

<template>
  <div class="game-shell">
    <header class="game-header">
      <button type="button" class="back-btn" @click="emit('back')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </button>
      <div class="title-block">
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="score-chip">
        <span class="score-label">累计积分</span>
        <strong>{{ scoreStore.totalPoints }}</strong>
      </div>
    </header>
    <div class="game-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.game-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 420px;
}

.game-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 18px;
  background: linear-gradient(120deg, #1a5f3f 0%, #2d8a5e 100%);
  border-radius: 12px;
  color: #fff;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

.title-block {
  flex: 1;
  min-width: 160px;
}

.title-block h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.title-block p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.score-chip {
  text-align: right;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.score-label {
  display: block;
  font-size: 11px;
  opacity: 0.85;
}

.score-chip strong {
  font-size: 20px;
}

.game-body {
  flex: 1;
}
</style>
