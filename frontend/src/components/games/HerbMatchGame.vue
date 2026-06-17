<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import GameShell from '@/components/games/GameShell.vue'
import type { HerbItem } from '@/api/herb'
import { useGameScoreStore } from '@/store/gameScore'
import { loadHerbPool, pickMatchHerbs } from '@/utils/herbGamePool'
import { starsFromMatchAttempts } from '@/utils/gameStars'

const emit = defineEmits<{ back: [] }>()

const scoreStore = useGameScoreStore()
const loading = ref(true)
const herbs = ref<HerbItem[]>([])
const selectedImageId = ref<number | null>(null)
const matchedIds = ref<Set<number>>(new Set())
const wrongFlash = ref(false)
const finished = ref(false)
const sessionPoints = ref(0)
const attempts = ref(0)

const names = ref<{ id: number; name: string }[]>([])

async function load() {
  loading.value = true
  finished.value = false
  matchedIds.value = new Set()
  selectedImageId.value = null
  sessionPoints.value = 0
  attempts.value = 0
  try {
    const pool = await loadHerbPool(40)
    herbs.value = pickMatchHerbs(pool, 4)
    if (herbs.value.length < 2) {
      ElMessage.warning('药材数据不足，请稍后再试')
      herbs.value = []
      names.value = []
      return
    }
    const list = herbs.value.map((h) => ({ id: h.id, name: h.herbName }))
    names.value = [...list].sort(() => Math.random() - 0.5)
  } catch {
    ElMessage.error('加载药材失败')
    herbs.value = []
    names.value = []
  } finally {
    loading.value = false
  }
}

function onImageClick(id: number) {
  if (matchedIds.value.has(id) || finished.value) return
  selectedImageId.value = id
}

function onNameClick(id: number) {
  if (matchedIds.value.has(id) || finished.value || selectedImageId.value == null) return
  attempts.value += 1
  if (selectedImageId.value === id) {
    matchedIds.value = new Set([...matchedIds.value, id])
    sessionPoints.value += 20
    selectedImageId.value = null
    if (matchedIds.value.size >= herbs.value.length) {
      finished.value = true
      const perfectBonus = attempts.value === herbs.value.length ? 20 : 0
      sessionPoints.value += perfectBonus
      const stars = starsFromMatchAttempts(herbs.value.length, attempts.value)
      scoreStore.addPoints(sessionPoints.value, 'match', 'herb-match', stars)
    }
  } else {
    wrongFlash.value = true
    setTimeout(() => {
      wrongFlash.value = false
      selectedImageId.value = null
    }, 600)
  }
}

function restart() {
  matchedIds.value = new Set()
  selectedImageId.value = null
  finished.value = false
  sessionPoints.value = 0
  attempts.value = 0
  load()
}

onMounted(load)
</script>

<template>
  <GameShell title="认药配对" subtitle="点击药材图片，再点对应名称完成配对" @back="emit('back')">
    <div v-if="loading" class="state-box">加载药材图片…</div>

    <div v-else-if="!herbs.length" class="state-box">
      <p>暂无可用药材数据</p>
      <el-button type="primary" @click="load">重新加载</el-button>
    </div>

    <div v-else-if="finished" class="result-panel">
      <div class="result-icon">✨</div>
      <h3>全部配对成功</h3>
      <p>尝试次数 {{ attempts }} · 获得积分 <strong>+{{ sessionPoints }}</strong></p>
      <div class="result-actions">
        <el-button type="primary" @click="restart">再来一局</el-button>
        <el-button @click="emit('back')">返回列表</el-button>
      </div>
    </div>

    <div v-else class="match-board" :class="{ shake: wrongFlash }">
      <div class="col">
        <p class="col-label">药材图</p>
        <button
          v-for="h in herbs"
          :key="'img-' + h.id"
          type="button"
          class="match-card image-card"
          :class="{
            active: selectedImageId === h.id,
            done: matchedIds.has(h.id),
          }"
          :disabled="matchedIds.has(h.id)"
          @click="onImageClick(h.id)"
        >
          <img v-if="h.coverImage" :src="h.coverImage" :alt="h.herbName" />
          <span v-else class="no-img">{{ h.herbName.slice(0, 1) }}</span>
        </button>
      </div>
      <div class="col">
        <p class="col-label">药名</p>
        <button
          v-for="n in names"
          :key="'name-' + n.id"
          type="button"
          class="match-card name-card"
          :class="{ done: matchedIds.has(n.id) }"
          :disabled="matchedIds.has(n.id)"
          @click="onNameClick(n.id)"
        >
          {{ n.name }}
        </button>
      </div>
      <p class="hint">已配对 {{ matchedIds.size }} / {{ herbs.length }}</p>
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

.match-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e4dc;
  padding: 20px;
}

.match-board.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.col-label {
  margin: 0 0 10px;
  font-size: 13px;
  color: #909399;
  grid-column: span 1;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-card {
  border: 2px solid #e8e4dc;
  border-radius: 10px;
  background: #faf8f4;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.match-card:hover:not(:disabled) {
  border-color: #1a5f3f;
  transform: translateY(-1px);
}

.match-card.active {
  border-color: #1a5f3f;
  box-shadow: 0 0 0 3px rgba(26, 95, 63, 0.2);
}

.match-card.done {
  opacity: 0.45;
  cursor: default;
  border-color: #67c23a;
}

.image-card {
  padding: 8px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-card img {
  max-height: 72px;
  max-width: 100%;
  object-fit: contain;
}

.no-img {
  font-size: 28px;
  color: #1a5f3f;
  font-weight: 700;
}

.name-card {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.hint {
  grid-column: 1 / -1;
  text-align: center;
  margin: 8px 0 0;
  font-size: 13px;
  color: #909399;
}

@media (max-width: 560px) {
  .match-board {
    grid-template-columns: 1fr;
  }
}
</style>
