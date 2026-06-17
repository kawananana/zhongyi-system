<script setup lang="ts">
import type { AcupointItem } from '@/api/acupoint'
import { meridianColor } from '@/utils/acupointMeta'

defineProps<{
  point: AcupointItem | null
  visible: boolean
}>()

const emit = defineEmits<{ close: [] }>()

function colorStyle(meridian: string) {
  const c = meridianColor(meridian)
  const r = (c >> 16) & 255
  const g = (c >> 8) & 255
  const b = c & 255
  return { color: `rgb(${r},${g},${b})` }
}
</script>

<template>
  <aside class="info-panel" :class="{ show: visible && point }">
    <button v-if="point" type="button" class="close-btn" aria-label="关闭" @click="emit('close')">×</button>
    <template v-if="point">
      <p class="meridian-tag" :style="colorStyle(point.meridian)">{{ point.meridian }}</p>
      <h2>{{ point.pointName }}</h2>
      <section>
        <h3>定位</h3>
        <p>{{ point.positionDesc }}</p>
      </section>
      <section v-if="point.efficacy">
        <h3>功效</h3>
        <p>{{ point.efficacy }}</p>
      </section>
    </template>
    <p v-else class="placeholder">点击 3D 人体上的亮点查看穴位详情</p>
  </aside>
</template>

<style scoped>
.info-panel {
  position: absolute;
  top: 24px;
  right: 112px;
  width: 300px;
  max-height: calc(100% - 120px);
  overflow-y: auto;
  padding: 20px;
  background: rgba(39, 43, 49, 0.94);
  border: 1px solid #3d4a5c;
  border-radius: 10px;
  color: #e8e8e8;
  z-index: 12;
  opacity: 0;
  pointer-events: none;
  transform: translateX(12px);
  transition: opacity 0.25s, transform 0.25s;
}

.info-panel.show {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: none;
  color: #aaa;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.meridian-tag {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.info-panel h2 {
  margin: 0 0 16px;
  font-size: 22px;
  font-family: 'Songti SC', 'SimSun', serif;
  color: #fff;
  padding-right: 24px;
}

.info-panel h3 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #1a5f3f;
  font-weight: 600;
}

.info-panel section {
  margin-bottom: 14px;
}

.info-panel p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #c8c8c8;
}

.placeholder {
  text-align: center;
  padding: 40px 12px;
  color: #888;
}
</style>
