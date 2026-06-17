<script setup lang="ts">
import { computed } from 'vue'
import type { AcupointItem } from '@/api/acupoint'
import { MERIDIAN_ROUTES } from '@/data/meridianRoutes'
import { meridianCssColor } from '@/utils/meridianPaths'

const props = defineProps<{
  meridian: string
  points: AcupointItem[]
  selectedId: number | null
  flowPlaying: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  playFlow: []
}>()

const orderedPoints = computed(() => {
  const order = MERIDIAN_ROUTES[props.meridian]
  if (!order) return props.points
  const map = new Map(props.points.map((p) => [p.pointName, p]))
  return order.map((n) => map.get(n)).filter(Boolean) as AcupointItem[]
})

const accent = computed(() => meridianCssColor(props.meridian))
</script>

<template>
  <div v-if="meridian && meridian !== 'all'" class="bottom-bar">
    <div class="bar-head">
      <h3 class="title">{{ meridian }}</h3>
      <button
        type="button"
        class="flow-btn"
        :class="{ playing: flowPlaying }"
        @click="emit('playFlow')"
      >
        {{ flowPlaying ? '停止循行' : '循行动画' }}
      </button>
    </div>
    <div class="point-scroll">
      <button
        v-for="p in orderedPoints"
        :key="p.id"
        type="button"
        class="point-chip"
        :class="{ active: selectedId === p.id }"
        :style="{ '--accent': accent }"
        @click="emit('select', p.id)"
      >
        <span class="dot" />
        <span class="name">{{ p.pointName }}</span>
      </button>
    </div>
    <p class="wiki-link">经络百科 · 点击穴位查看定位与功效</p>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: absolute;
  left: 88px;
  right: 108px;
  bottom: 16px;
  z-index: 12;
  padding: 12px 16px 10px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.bar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #3d3830;
  font-family: 'Songti SC', 'SimSun', serif;
}

.flow-btn {
  padding: 6px 14px;
  border: 1px solid #c9a66b;
  border-radius: 20px;
  background: #fff;
  color: #8b6914;
  font-size: 13px;
  cursor: pointer;
}

.flow-btn.playing {
  background: #c9a66b;
  color: #fff;
}

.point-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.point-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #e8e4dc;
  border-radius: 10px;
  background: #faf8f4;
  cursor: pointer;
  min-width: 64px;
}

.point-chip.active {
  border-color: var(--accent);
  background: #fff;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
}

.name {
  font-size: 12px;
  color: #5c5348;
}

.wiki-link {
  margin: 8px 0 0;
  font-size: 11px;
  color: #999;
  text-align: right;
}
</style>
