<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeHeader from '@/components/home/HomeHeader.vue'
import { fetchHerbPage, type HerbItem } from '@/api/herb'
import { DICE_FACES, HERB_MAP_LAST_INDEX, HERB_MAP_TILES } from '@/data/herbDiceMap'
import { formatPropertyLine, herbSummaryText } from '@/utils/herbDisplay'
import { IMAGE_ERROR_PLACEHOLDER } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const herbs = ref<HerbItem[]>([])
const herbsLoading = ref(true)
const position = ref(0)
const lastRoll = ref<number | null>(null)
const rolling = ref(false)
const learnHerb = ref<HerbItem | null>(null)
const learnTile = ref<(typeof HERB_MAP_TILES)[number] | null>(null)
const finished = ref(false)
const lastHerbId = ref<number | null>(null)

const canRoll = computed(() => !rolling.value && !finished.value && herbs.value.length > 0)
const progressText = computed(() => `${position.value} / ${HERB_MAP_LAST_INDEX}`)

function pickRandomHerb(): HerbItem | null {
  const pool = herbs.value
  if (!pool.length) return null
  if (pool.length === 1) return pool[0]

  let herb = pool[Math.floor(Math.random() * pool.length)]
  if (lastHerbId.value != null && pool.length > 1) {
    let guard = 0
    while (herb.id === lastHerbId.value && guard < 8) {
      herb = pool[Math.floor(Math.random() * pool.length)]
      guard += 1
    }
  }
  return herb
}

function resetGame() {
  position.value = 0
  lastRoll.value = null
  rolling.value = false
  learnHerb.value = null
  learnTile.value = null
  finished.value = false
  lastHerbId.value = null
}

async function loadHerbs() {
  herbsLoading.value = true
  try {
    const data = await fetchHerbPage({ page: 1, pageSize: 100, sort: 'hot' })
    herbs.value = data.list ?? []
    resetGame()
  } catch {
    herbs.value = []
  } finally {
    herbsLoading.value = false
  }
}

function showLearnCard(tileIndex: number) {
  const tile = HERB_MAP_TILES[tileIndex]
  const herb = pickRandomHerb()
  if (!tile || !herb) return
  learnTile.value = tile
  learnHerb.value = herb
  lastHerbId.value = herb.id
}

function rollDice() {
  if (!canRoll.value) return
  rolling.value = true
  learnHerb.value = null
  learnTile.value = null

  const value = Math.floor(Math.random() * 6) + 1
  let ticks = 0
  const tickTimer = setInterval(() => {
    lastRoll.value = Math.floor(Math.random() * 6) + 1
    ticks += 1
    if (ticks >= 8) {
      clearInterval(tickTimer)
      lastRoll.value = value
      const next = Math.min(position.value + value, HERB_MAP_LAST_INDEX)
      position.value = next
      rolling.value = false
      if (next >= HERB_MAP_LAST_INDEX) {
        finished.value = true
      }
      if (next > 0) {
        showLearnCard(next)
      }
    }
  }, 70)
}

function closeLearnCard() {
  learnHerb.value = null
  learnTile.value = null
}

function goHerbDetail() {
  if (!learnHerb.value) return
  router.push({ path: `/atlas/herbs/${learnHerb.value.id}`, query: { from: 'dice-map' } })
}

function goBack() {
  router.push('/atlas/herbs')
}

onMounted(loadHerbs)

watch(
  () => route.query._r,
  () => {
    if (herbs.value.length) resetGame()
  },
)
</script>

<template>
  <div class="dice-map-page">
    <HomeHeader />

    <main class="main" v-loading="herbsLoading">
      <header class="page-head">
        <button type="button" class="back-btn" @click="goBack">← 返回图鉴</button>
        <div>
          <h1>本草寻药地图</h1>
          <p>掷骰子前进，落点遇见一味本草，边走边学</p>
        </div>
        <button type="button" class="restart-btn" :disabled="herbsLoading" @click="resetGame">
          重新出发
        </button>
      </header>

      <div v-if="!herbsLoading && !herbs.length" class="empty-tip">
        暂无药材数据，请稍后再试
      </div>

      <template v-else-if="!herbsLoading">
        <section class="board-wrap">
          <div class="board">
            <div
              v-for="tile in HERB_MAP_TILES"
              :key="tile.id"
              class="tile"
              :class="{
                start: tile.id === 0,
                end: tile.id === HERB_MAP_LAST_INDEX,
                active: position === tile.id,
                passed: position > tile.id,
              }"
              :style="{ gridColumn: tile.col, gridRow: tile.row }"
            >
              <span class="tile-icon">{{ tile.icon }}</span>
              <span class="tile-label">{{ tile.label }}</span>
              <span v-if="position === tile.id" class="player" aria-label="当前位置">🧑‍⚕️</span>
            </div>

            <div class="board-center">
              <div class="dice-box" :class="{ rolling }">
                <span class="dice-face" aria-live="polite">
                  {{ lastRoll ? DICE_FACES[lastRoll - 1] : '🎲' }}
                </span>
                <span class="dice-num">{{ lastRoll ? `点数 ${lastRoll}` : '待掷骰' }}</span>
              </div>
              <button type="button" class="roll-btn" :disabled="!canRoll" @click="rollDice">
                {{ finished ? '已抵达终点' : rolling ? '掷骰中…' : '掷骰子' }}
              </button>
              <p class="progress">进度 {{ progressText }}</p>
              <p v-if="finished" class="finish-tip">🎉 本轮寻药完成，可点「重新出发」再来一局</p>
            </div>
          </div>
        </section>
      </template>

      <Transition name="modal">
        <div v-if="learnHerb && learnTile" class="learn-overlay" @click.self="closeLearnCard">
          <article class="learn-card" role="dialog" aria-label="本草学习卡">
            <header class="learn-head">
              <div>
                <span class="learn-place">{{ learnTile.icon }} {{ learnTile.label }}</span>
                <h2>遇见：{{ learnHerb.herbName }}</h2>
              </div>
              <button type="button" class="close-btn" aria-label="关闭" @click="closeLearnCard">×</button>
            </header>

            <div class="learn-body">
              <el-image class="learn-cover" :src="learnHerb.coverImage" fit="cover">
                <template #error>
                  <img :src="IMAGE_ERROR_PLACEHOLDER" alt="" class="error-img" />
                </template>
              </el-image>
              <div class="learn-info">
                <p v-if="formatPropertyLine(learnHerb)" class="property">
                  {{ formatPropertyLine(learnHerb) }}
                </p>
                <p v-if="herbSummaryText(learnHerb)" class="summary">
                  {{ herbSummaryText(learnHerb) }}
                </p>
                <p v-if="learnHerb.efficacy" class="efficacy">
                  <strong>功效</strong>{{ learnHerb.efficacy }}
                </p>
              </div>
            </div>

            <footer class="learn-foot">
              <button type="button" class="ghost-btn" @click="closeLearnCard">继续探险</button>
              <button type="button" class="primary-btn" @click="goHerbDetail">查看完整图鉴</button>
            </footer>
          </article>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.dice-map-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef6f0 0%, #f7f3eb 40%);
}

.main {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 20px 48px;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px 16px;
  margin-bottom: 20px;
}

.page-head h1 {
  margin: 0;
  font-size: 26px;
  color: #1a5f3f;
}

.page-head p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #606266;
}

.back-btn,
.restart-btn {
  border: 1px solid #d4ebe0;
  background: #fff;
  color: #1a5f3f;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
}

.restart-btn {
  margin-left: auto;
}

.restart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-tip {
  text-align: center;
  padding: 48px 20px;
  color: #909399;
}

.board-wrap {
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 8px 28px rgba(26, 95, 63, 0.08);
}

.board {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, minmax(72px, 1fr));
  gap: 8px;
  min-height: 380px;
  position: relative;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  border-radius: 12px;
  border: 2px solid #e8e4dc;
  background: #faf8f4;
  text-align: center;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.tile.start {
  border-color: #8b6914;
  background: #fff8e8;
}

.tile.end {
  border-color: #1a5f3f;
  background: #f0f7f2;
}

.tile.passed {
  background: #f3faf6;
  border-color: #c5e0d2;
}

.tile.active {
  border-color: #1a5f3f;
  background: #e8f5ee;
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(26, 95, 63, 0.15);
  z-index: 2;
}

.tile-icon {
  font-size: 20px;
  line-height: 1;
}

.tile-label {
  font-size: 10px;
  color: #606266;
  line-height: 1.25;
}

.player {
  position: absolute;
  top: -10px;
  right: -4px;
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.board-center {
  grid-column: 2 / 6;
  grid-row: 2 / 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 16px;
  background: linear-gradient(145deg, #f0f7f2, #e3f0e8);
  border: 1px dashed #b8d9c8;
  padding: 16px;
}

.dice-box {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  background: #fff;
  border: 2px solid #1a5f3f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.dice-box.rolling {
  animation: shake 0.12s linear infinite;
}

.dice-face {
  font-size: 36px;
  line-height: 1;
}

.dice-num {
  font-size: 11px;
  color: #606266;
}

.roll-btn {
  border: none;
  background: linear-gradient(135deg, #1a5f3f, #2d8a5e);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 28px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(26, 95, 63, 0.25);
}

.roll-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.progress {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.finish-tip {
  margin: 0;
  font-size: 12px;
  color: #1a5f3f;
  text-align: center;
}

.learn-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(30, 40, 35, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.learn-card {
  width: min(480px, 100%);
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
}

.learn-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(120deg, #1a5f3f, #2d8a5e);
  color: #fff;
}

.learn-place {
  display: block;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.learn-head h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.learn-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.learn-cover {
  width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.error-img {
  width: 100%;
  height: 180px;
  object-fit: contain;
}

.learn-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property {
  margin: 0;
  font-size: 13px;
  color: #1a5f3f;
  font-weight: 600;
}

.summary,
.efficacy {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #4a4a4a;
}

.efficacy strong {
  color: #1a5f3f;
  margin-right: 6px;
}

.learn-foot {
  display: flex;
  gap: 10px;
  padding: 0 18px 18px;
}

.ghost-btn,
.primary-btn {
  flex: 1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
}

.ghost-btn {
  border: 1px solid #d4ebe0;
  background: #fff;
  color: #1a5f3f;
}

.primary-btn {
  border: none;
  background: #1a5f3f;
  color: #fff;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(4deg);
  }
}

@media (max-width: 720px) {
  .board {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(58px, auto));
    gap: 5px;
    min-height: 300px;
  }

  .tile-label {
    font-size: 9px;
  }

  .tile-icon {
    font-size: 16px;
  }

  .board-center {
    padding: 10px;
  }

  .dice-box {
    width: 72px;
    height: 72px;
  }

  .dice-face {
    font-size: 28px;
  }

  .roll-btn {
    font-size: 13px;
    padding: 8px 20px;
  }
}
</style>
