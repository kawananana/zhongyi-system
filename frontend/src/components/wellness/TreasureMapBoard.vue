<script setup lang="ts">
import { computed } from 'vue'
import { Trophy } from '@element-plus/icons-vue'
import { ADVENTURE_LEVELS, ADVENTURE_MAP_META } from '@/data/wellnessGames'
import { useGameScoreStore } from '@/store/gameScore'

const emit = defineEmits<{
  play: [levelId: string]
}>()

const scoreStore = useGameScoreStore()

const pathPoints = computed(() =>
  ADVENTURE_LEVELS.map((l) => `${l.mapX},${l.mapY}`).join(' '),
)

function onNodeClick(level: typeof ADVENTURE_LEVELS[number]) {
  if (level.status === 'soon') return
  emit('play', level.id)
}

function starClass(levelId: string, n: number) {
  return scoreStore.getLevelStars(levelId) >= n ? 'on' : 'off'
}
</script>

<template>
  <div class="treasure-map">
    <div class="map-header">
      <div>
        <h3>{{ ADVENTURE_MAP_META.title }}</h3>
        <p>任意关卡可随时挑战，根据成绩在地图上点亮星级</p>
      </div>
      <div class="progress-chip">
        <span>累计星数</span>
        <strong>{{ scoreStore.totalStars }}/{{ scoreStore.maxStars }}</strong>
      </div>
    </div>

    <div class="map-stage">
      <div class="map-deco map-deco--left">🌲</div>
      <div class="map-deco map-deco--right">🏔️</div>
      <div class="map-deco map-deco--cloud">☁️</div>

      <div class="map-start">
        <span class="pin-icon">🏡</span>
        <span class="pin-label">{{ ADVENTURE_MAP_META.startLabel }}</span>
      </div>

      <svg class="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          :points="pathPoints"
          fill="none"
          stroke="url(#pathGrad)"
          stroke-width="1.2"
          stroke-dasharray="3 2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#8b6914" />
            <stop offset="100%" stop-color="#1a5f3f" />
          </linearGradient>
        </defs>
      </svg>

      <button
        v-for="level in ADVENTURE_LEVELS"
        :key="level.id"
        type="button"
        class="map-node"
        :class="{
          soon: level.status === 'soon',
          played: scoreStore.hasPlayedLevel(level.id),
        }"
        :style="{ left: `${level.mapX}%`, top: `${level.mapY}%` }"
        :disabled="level.status === 'soon'"
        @click="onNodeClick(level)"
      >
        <span class="node-ring">
          <span class="node-icon">{{ level.icon }}</span>
        </span>
        <span class="node-stars" aria-label="星级">
          <span v-for="n in 3" :key="n" class="star" :class="starClass(level.id, n)">★</span>
        </span>
        <span class="node-level">第 {{ level.levelNo }} 关</span>
        <span class="node-title">{{ level.title }}</span>
      </button>

      <div class="map-end" :class="{ open: scoreStore.treasuryOpen }">
        <span class="treasure-icon">{{ scoreStore.treasuryOpen ? '🎁' : '🗺️' }}</span>
        <span class="pin-label">{{ ADVENTURE_MAP_META.endLabel }}</span>
        <span v-if="scoreStore.treasuryOpen" class="treasure-tip">全部关卡已有成绩</span>
        <span v-else class="treasure-tip">每关至少挑战一次后开启</span>
      </div>
    </div>

    <div class="map-legend">
      <span class="legend-item"><span class="star on">★</span> 已获得</span>
      <span class="legend-item"><span class="star off">★</span> 待挑战</span>
      <span class="legend-item">已挑战 {{ scoreStore.playedCount }}/{{ ADVENTURE_LEVELS.filter((l) => l.status === 'beta').length }} 关</span>
      <span v-if="scoreStore.treasuryOpen" class="legend-win">
        <el-icon><Trophy /></el-icon>
        本草寻宝图已点亮！
      </span>
    </div>

    <div class="level-list">
      <article
        v-for="level in ADVENTURE_LEVELS"
        :key="`card-${level.id}`"
        class="level-card"
        :class="{ soon: level.status === 'soon', played: scoreStore.hasPlayedLevel(level.id) }"
        @click="onNodeClick(level)"
      >
        <span class="level-no">{{ level.levelNo }}</span>
        <div class="level-body">
          <div class="level-head">
            <strong>{{ level.chapter }} · {{ level.title }}</strong>
            <span class="card-stars">
              <span v-for="n in 3" :key="n" class="star" :class="starClass(level.id, n)">★</span>
            </span>
          </div>
          <p>{{ level.desc }}</p>
          <span v-if="level.points" class="level-points">{{ level.points }}</span>
        </div>
        <span class="level-icon">{{ level.icon }}</span>
      </article>
    </div>
  </div>
</template>

<style scoped>
.treasure-map {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 22px;
  background: linear-gradient(120deg, #1a5f3f 0%, #2d8a5e 100%);
  color: #fff;
  border-radius: 12px;
}

.map-header h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.map-header p {
  margin: 0;
  font-size: 13px;
  opacity: 0.92;
  line-height: 1.55;
  max-width: 520px;
}

.progress-chip {
  text-align: center;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.progress-chip span {
  display: block;
  font-size: 12px;
  opacity: 0.9;
}

.progress-chip strong {
  font-size: 26px;
}

.map-stage {
  position: relative;
  min-height: 420px;
  border-radius: 16px;
  border: 2px solid #d4c4a8;
  background:
    radial-gradient(circle at 20% 80%, rgba(26, 95, 63, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 80% 20%, rgba(139, 105, 20, 0.1) 0%, transparent 40%),
    linear-gradient(165deg, #f9f4ea 0%, #efe6d6 45%, #e8dcc8 100%);
  box-shadow: inset 0 0 60px rgba(139, 105, 20, 0.08);
  overflow: hidden;
}

.map-deco {
  position: absolute;
  font-size: 28px;
  opacity: 0.35;
  pointer-events: none;
}

.map-deco--left {
  left: 8px;
  bottom: 12px;
}

.map-deco--right {
  right: 12px;
  top: 8px;
}

.map-deco--cloud {
  right: 28%;
  top: 6%;
  font-size: 22px;
}

.map-path {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.75;
}

.map-start,
.map-end {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.map-start {
  left: 4%;
  bottom: 6%;
}

.map-end {
  right: 4%;
  top: 4%;
  text-align: center;
}

.map-end.open .treasure-icon {
  animation: treasure-glow 2s ease-in-out infinite;
}

.pin-icon,
.treasure-icon {
  font-size: 28px;
  line-height: 1;
}

.pin-label {
  font-size: 12px;
  font-weight: 600;
  color: #5c5046;
  background: rgba(255, 255, 255, 0.75);
  padding: 2px 8px;
  border-radius: 10px;
}

.treasure-tip {
  font-size: 11px;
  color: #8b6914;
}

.map-node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  z-index: 2;
  max-width: 92px;
}

.map-node:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.map-node:not(:disabled):hover .node-ring {
  transform: scale(1.08);
  box-shadow: 0 6px 18px rgba(26, 95, 63, 0.25);
}

.node-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 3px solid #1a5f3f;
  box-shadow: 0 4px 12px rgba(61, 48, 40, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.map-node.played .node-ring {
  border-color: #e6a23c;
  background: linear-gradient(145deg, #fff8e1, #fff);
}

.node-icon {
  font-size: 22px;
}

.node-stars {
  display: flex;
  gap: 1px;
  line-height: 1;
}

.star {
  font-size: 12px;
}

.star.on {
  color: #e6a23c;
}

.star.off {
  color: #d4c4a8;
}

.node-level {
  font-size: 10px;
  color: #8b6914;
  font-weight: 600;
}

.node-title {
  font-size: 11px;
  font-weight: 600;
  color: #3d3028;
  text-align: center;
  line-height: 1.3;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  font-size: 12px;
  color: #606266;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.legend-win {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1a5f3f;
  font-weight: 600;
}

.level-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.level-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.level-card:not(.soon):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(26, 95, 63, 0.1);
}

.level-card.soon {
  opacity: 0.72;
  cursor: not-allowed;
}

.level-card.played {
  border-color: #f0d78c;
  background: linear-gradient(135deg, #fffdf6 0%, #fff 100%);
}

.card-stars {
  display: inline-flex;
  gap: 1px;
}

.level-no {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bc-primary-light);
  color: var(--bc-primary);
  font-weight: 700;
  font-size: 14px;
}

.level-body {
  flex: 1;
  min-width: 0;
}

.level-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.level-head strong {
  font-size: 14px;
  color: #303133;
}

.level-body p {
  margin: 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.45;
}

.level-points {
  font-size: 11px;
  color: #e6a23c;
  font-weight: 600;
}

.level-icon {
  font-size: 28px;
  flex-shrink: 0;
}

@keyframes treasure-glow {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .map-stage {
    min-height: 360px;
  }

  .map-node {
    max-width: 76px;
  }

  .node-ring {
    width: 44px;
    height: 44px;
  }

  .node-title {
    font-size: 10px;
  }
}
</style>
