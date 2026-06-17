<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameShell from '@/components/games/GameShell.vue'
import { useGameScoreStore } from '@/store/gameScore'
import { buildFormulaComposeRounds, type FormulaComposeRound } from '@/utils/formulaGamePool'
import { starsFromRatio } from '@/utils/gameStars'

const emit = defineEmits<{ back: [] }>()

type Phase = 'compose' | 'jun' | 'feedback'

const scoreStore = useGameScoreStore()
const loading = ref(true)
const rounds = ref<FormulaComposeRound[]>([])
const roundIndex = ref(0)
const phase = ref<Phase>('compose')
const selectedHerbs = ref<Set<string>>(new Set())
const junPick = ref<string | null>(null)
const composeChecked = ref(false)
const composeCorrect = ref(false)
const junCorrect = ref(false)
const finished = ref(false)
const sessionPoints = ref(0)
const perfectRounds = ref(0)

const current = computed(() => rounds.value[roundIndex.value])
const needCount = computed(() => current.value?.targetHerbs.length ?? 4)
const progress = computed(() => {
  if (!rounds.value.length) return 0
  const step = phase.value === 'feedback' ? 1 : phase.value === 'jun' ? 0.65 : 0.3
  return Math.round(((roundIndex.value + step) / rounds.value.length) * 100)
})

function load() {
  loading.value = true
  rounds.value = buildFormulaComposeRounds(4)
  roundIndex.value = 0
  phase.value = 'compose'
  selectedHerbs.value = new Set()
  junPick.value = null
  composeChecked.value = false
  composeCorrect.value = false
  junCorrect.value = false
  finished.value = false
  sessionPoints.value = 0
  perfectRounds.value = 0
  loading.value = false
}

function toggleHerb(name: string) {
  if (phase.value !== 'compose' || composeChecked.value) return
  const next = new Set(selectedHerbs.value)
  if (next.has(name)) {
    next.delete(name)
  } else if (next.size < needCount.value) {
    next.add(name)
  }
  selectedHerbs.value = next
}

function herbClass(name: string) {
  if (phase.value === 'compose' && !composeChecked.value) {
    return { picked: selectedHerbs.value.has(name) }
  }
  const target = new Set(current.value?.targetHerbs ?? [])
  const picked = selectedHerbs.value.has(name)
  if (target.has(name) && picked) return { correct: true }
  if (target.has(name) && !picked) return { missed: true }
  if (!target.has(name) && picked) return { wrong: true }
  return { dim: true }
}

function confirmCompose() {
  if (!current.value || selectedHerbs.value.size !== needCount.value) return
  composeChecked.value = true
  const target = new Set(current.value.targetHerbs)
  composeCorrect.value =
    selectedHerbs.value.size === target.size &&
    [...selectedHerbs.value].every((h) => target.has(h))
  phase.value = 'jun'
}

function pickJun(name: string) {
  if (phase.value !== 'jun' || !current.value) return
  junPick.value = name
  junCorrect.value = name === current.value.formula.jun
  let pts = 0
  if (composeCorrect.value) pts += 15
  if (junCorrect.value) pts += 10
  if (composeCorrect.value && junCorrect.value) perfectRounds.value += 1
  sessionPoints.value += pts
  phase.value = 'feedback'
}

function nextRound() {
  if (roundIndex.value >= rounds.value.length - 1) {
    finished.value = true
    const stars = starsFromRatio(perfectRounds.value / rounds.value.length)
    scoreStore.addPoints(sessionPoints.value, 'formula', 'formula', stars)
    return
  }
  roundIndex.value += 1
  phase.value = 'compose'
  selectedHerbs.value = new Set()
  junPick.value = null
  composeChecked.value = false
  composeCorrect.value = false
  junCorrect.value = false
}

function restart() {
  load()
}

onMounted(load)
</script>

<template>
  <GameShell title="方剂配伍挑战" subtitle="先组方选药，再定君药——两步完成一关" @back="emit('back')">
    <div v-if="loading" class="state-box">正在准备方剂…</div>

    <div v-else-if="!rounds.length" class="state-box">
      <p>暂无可用关卡</p>
      <el-button type="primary" @click="load">重试</el-button>
    </div>

    <div v-else-if="finished" class="result-panel">
      <div class="result-icon">⚗️</div>
      <h3>组方闯关完成</h3>
      <p>完美组方 <strong>{{ perfectRounds }}</strong> / {{ rounds.length }} 关</p>
      <p class="points">获得积分 <strong>+{{ sessionPoints }}</strong></p>
      <div class="result-actions">
        <el-button type="primary" @click="restart">再来一局</el-button>
        <el-button @click="emit('back')">返回列表</el-button>
      </div>
    </div>

    <div v-else-if="current" class="compose-panel">
      <div class="progress-row">
        <span>第 {{ roundIndex + 1 }} / {{ rounds.length }} 关</span>
        <el-progress :percentage="progress" :stroke-width="8" color="#b88230" />
        <span class="phase-label">
          {{ phase === 'compose' ? '① 组方' : phase === 'jun' ? '② 定君' : '解析' }}
        </span>
      </div>

      <div class="prescription-card">
        <span class="card-label">主治功效</span>
        <p class="efficacy">{{ current.formula.efficacy }}</p>
        <p v-if="phase === 'compose'" class="task">
          从下方点选 <strong>{{ needCount }}</strong> 味药，组成与此功效相符的方剂
        </p>
        <p v-else-if="phase === 'jun'" class="task">
          组方已锁定，请指出<strong>君药</strong>（主药）
        </p>
        <p v-else class="task reveal">
          此方为 <strong>{{ current.formula.name }}</strong>，君药是 <strong>{{ current.formula.jun }}</strong>
        </p>
      </div>

      <!-- 组方阶段：8 味药点选 -->
      <div v-if="phase === 'compose'" class="herb-grid">
        <button
          v-for="herb in current.herbPool"
          :key="herb"
          type="button"
          class="herb-chip"
          :class="herbClass(herb)"
          @click="toggleHerb(herb)"
        >
          {{ herb }}
        </button>
      </div>

      <!-- 组方反馈 + 定君阶段 -->
      <div v-else class="herb-grid jun-grid">
        <button
          v-for="herb in current.targetHerbs"
          :key="'jun-' + herb"
          type="button"
          class="herb-chip jun-chip"
          :class="{
            correct: phase === 'feedback' && herb === current.formula.jun,
            picked: junPick === herb,
            wrong: phase === 'feedback' && junPick === herb && herb !== current.formula.jun,
            disabled: phase === 'feedback',
          }"
          :disabled="phase === 'feedback'"
          @click="pickJun(herb)"
        >
          <span v-if="phase === 'feedback' && herb === current.formula.jun" class="jun-badge">君</span>
          {{ herb }}
        </button>
      </div>

      <!-- 组方反馈（定君完成后展示） -->
      <div v-if="phase === 'feedback'" class="compose-review">
        <p v-for="herb in current.herbPool" :key="'rv-' + herb" class="review-item" :class="herbClass(herb)">
          <span>{{ herb }}</span>
          <span class="review-tag">
            <template v-if="current.targetHerbs.includes(herb) && selectedHerbs.has(herb)">✓ 应选</template>
            <template v-else-if="current.targetHerbs.includes(herb)">应选未选</template>
            <template v-else-if="selectedHerbs.has(herb)">✗ 误选</template>
          </span>
        </p>
      </div>

      <div class="action-bar">
        <template v-if="phase === 'compose'">
          <span class="pick-count">已选 {{ selectedHerbs.size }} / {{ needCount }}</span>
          <el-button
            type="primary"
            :disabled="selectedHerbs.size !== needCount"
            @click="confirmCompose"
          >
            确认组方
          </el-button>
        </template>

        <template v-else-if="phase === 'jun'">
          <p class="jun-hint">
            <span v-if="composeCorrect" class="ok">组方正确！</span>
            <span v-else class="fail">组方有误，仍可练习定君 →</span>
            君药起主要治疗作用，点击上方一味药
          </p>
        </template>

        <template v-else>
          <div class="round-score">
            <span v-if="composeCorrect" class="ok">组方正确 +15</span>
            <span v-else class="fail">组方有误</span>
            <span v-if="junCorrect" class="ok">君药正确 +10</span>
            <span v-else class="fail">君药应为 {{ current.formula.jun }}</span>
          </div>
          <el-button type="primary" @click="nextRound">
            {{ roundIndex >= rounds.length - 1 ? '查看成绩' : '下一关' }}
          </el-button>
        </template>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.state-box {
  text-align: center;
  padding: 48px 24px;
  color: #606266;
}

.result-panel {
  text-align: center;
  padding: 32px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e4dc;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.result-panel h3 {
  margin: 0 0 12px;
  color: #1a5f3f;
}

.result-panel p {
  margin: 0 0 8px;
  color: #606266;
}

.points {
  font-size: 18px;
  color: #e6a23c;
  margin: 16px 0 !important;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.compose-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e4dc;
  padding: 24px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #909399;
}

.progress-row .el-progress {
  flex: 1;
}

.phase-label {
  color: #b88230;
  font-weight: 600;
  white-space: nowrap;
}

.prescription-card {
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border: 1px solid #f5dab1;
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.card-label {
  font-size: 12px;
  color: #b88230;
  font-weight: 600;
}

.efficacy {
  margin: 6px 0 10px;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.task {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.task.reveal {
  color: #1a5f3f;
}

.herb-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .herb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.herb-chip {
  position: relative;
  padding: 14px 8px;
  border: 2px solid #e8e4dc;
  border-radius: 10px;
  background: #faf8f4;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}

.herb-chip:hover:not(.disabled):not(:disabled) {
  border-color: #b88230;
  transform: translateY(-1px);
}

.herb-chip.picked {
  border-color: #b88230;
  background: #fdf6ec;
  box-shadow: 0 0 0 3px rgba(184, 130, 48, 0.2);
}

.herb-chip.correct {
  border-color: #67c23a;
  background: #f0f9eb;
  color: #529b2e;
}

.herb-chip.wrong {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #c45656;
}

.herb-chip.missed {
  border-color: #e6a23c;
  background: #fdf6ec;
  border-style: dashed;
}

.herb-chip.dim {
  opacity: 0.45;
}

.jun-chip.disabled {
  cursor: default;
}

.jun-badge {
  position: absolute;
  top: -8px;
  right: -4px;
  background: #b88230;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
}

.compose-review {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
}

.review-item.correct { color: #67c23a; }
.review-item.wrong { color: #f56c6c; }
.review-item.missed { color: #e6a23c; }
.review-item.dim { color: #909399; }

.review-tag {
  font-size: 11px;
  opacity: 0.85;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px dashed #e8e4dc;
}

.pick-count {
  font-size: 14px;
  color: #606266;
}

.jun-hint {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.round-score {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
}

.round-score .ok {
  color: #67c23a;
  font-weight: 600;
}

.round-score .fail {
  color: #f56c6c;
}
</style>
