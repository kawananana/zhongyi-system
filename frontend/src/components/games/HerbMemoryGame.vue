<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import GameShell from '@/components/games/GameShell.vue'
import { useGameScoreStore } from '@/store/gameScore'
import { buildMemoryPairs, loadHerbPool, type MemoryPair } from '@/utils/herbGamePool'
import { starsFromMemoryMoves } from '@/utils/gameStars'

const emit = defineEmits<{ back: [] }>()

const scoreStore = useGameScoreStore()
const loading = ref(true)
const cards = ref<MemoryPair[]>([])
const flipped = ref<string[]>([])
const matched = ref<Set<string>>(new Set())
const lock = ref(false)
const moves = ref(0)
const finished = ref(false)
const sessionPoints = ref(0)

async function load() {
  loading.value = true
  try {
    const pool = await loadHerbPool(40)
    cards.value = buildMemoryPairs(pool, 4)
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function cardClass(card: MemoryPair) {
  const show = flipped.value.includes(card.id) || matched.value.has(card.pairKey)
  return {
    flipped: show,
    matched: matched.value.has(card.pairKey),
    name: card.kind === 'name',
    prop: card.kind === 'prop',
  }
}

function onFlip(card: MemoryPair) {
  if (lock.value || finished.value) return
  if (flipped.value.includes(card.id) || matched.value.has(card.pairKey)) return
  if (flipped.value.length >= 2) return

  flipped.value.push(card.id)
  if (flipped.value.length < 2) return

  moves.value += 1
  lock.value = true
  const [aId, bId] = flipped.value
  const a = cards.value.find((c) => c.id === aId)!
  const b = cards.value.find((c) => c.id === bId)!

  if (a.pairKey === b.pairKey && a.id !== b.id) {
    matched.value.add(a.pairKey)
    sessionPoints.value += 15
    flipped.value = []
    lock.value = false
    if (matched.value.size >= cards.value.length / 2) {
      finished.value = true
      const moveBonus = Math.max(0, 30 - moves.value * 2)
      sessionPoints.value += moveBonus
      const pairs = cards.value.length / 2
      const stars = starsFromMemoryMoves(pairs, moves.value)
      scoreStore.addPoints(sessionPoints.value, 'memory', 'memory', stars)
    }
  } else {
    setTimeout(() => {
      flipped.value = []
      lock.value = false
    }, 800)
  }
}

function restart() {
  flipped.value = []
  matched.value = new Set()
  moves.value = 0
  finished.value = false
  sessionPoints.value = 0
  lock.value = false
  load()
}

onMounted(load)
</script>

<template>
  <GameShell title="药性记忆翻牌" subtitle="配对药名与性味归经标签" @back="emit('back')">
    <div v-if="loading" class="state-box">洗牌中…</div>

    <div v-else-if="!cards.length" class="state-box">
      <p>暂无可用药材数据</p>
      <el-button type="primary" @click="load">重新加载</el-button>
    </div>

    <div v-else-if="finished" class="result-panel">
      <div class="result-icon">🃏</div>
      <h3>全部翻对啦</h3>
      <p>步数 {{ moves }} · 积分 <strong>+{{ sessionPoints }}</strong></p>
      <div class="result-actions">
        <el-button type="primary" @click="restart">再来一局</el-button>
        <el-button @click="emit('back')">返回列表</el-button>
      </div>
    </div>

    <div v-else class="memory-wrap">
      <p class="stats">已配对 {{ matched.size }} / {{ cards.length / 2 }} · 步数 {{ moves }}</p>
      <div class="memory-grid">
        <button
          v-for="card in cards"
          :key="card.id"
          type="button"
          class="memory-card"
          :class="cardClass(card)"
          @click="onFlip(card)"
        >
          <span class="card-back">🌿</span>
          <span class="card-front">{{ card.label }}</span>
        </button>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.state-box {
  text-align: center;
  padding: 48px;
  color: #606266;
}

.result-panel {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e4dc;
}

.result-icon {
  font-size: 48px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.memory-wrap {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e4dc;
  padding: 20px;
}

.stats {
  margin: 0 0 16px;
  text-align: center;
  font-size: 13px;
  color: #909399;
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

@media (max-width: 640px) {
  .memory-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.memory-card {
  aspect-ratio: 1;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  perspective: 600px;
  background: transparent;
  padding: 0;
}

.memory-card .card-back,
.memory-card .card-front {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 8px;
  font-size: 13px;
  line-height: 1.35;
  backface-visibility: hidden;
  transition: transform 0.35s;
}

.memory-card .card-back {
  background: linear-gradient(135deg, #1a5f3f, #2d8a5e);
  color: #fff;
  font-size: 24px;
  transform: rotateY(0deg);
}

.memory-card .card-front {
  background: #e8f5ee;
  color: #1a5f3f;
  font-weight: 600;
  transform: rotateY(180deg);
  border: 1px solid #b8d4c4;
}

.memory-card.prop .card-front {
  background: #fdf6ec;
  color: #b88230;
  border-color: #f5dab1;
  font-weight: 500;
  font-size: 12px;
}

.memory-card.flipped .card-back {
  transform: rotateY(180deg);
}

.memory-card.flipped .card-front {
  transform: rotateY(0deg);
}

.memory-card.matched .card-front {
  background: #f0f9eb;
  border-color: #67c23a;
  color: #529b2e;
}
</style>
