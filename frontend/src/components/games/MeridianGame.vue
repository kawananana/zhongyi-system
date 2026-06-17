<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GameShell from '@/components/games/GameShell.vue'
import { useGameScoreStore } from '@/store/gameScore'
import { buildMeridianRounds, type MeridianRound } from '@/utils/meridianGamePool'
import { starsFromRatio } from '@/utils/gameStars'

const emit = defineEmits<{ back: [] }>()
const router = useRouter()
const scoreStore = useGameScoreStore()

const loading = ref(true)
const rounds = ref<MeridianRound[]>([])
const roundIndex = ref(0)
const seqStep = ref(0)
const litPoints = ref<string[]>([])
const wrongFlash = ref(false)
const matchPick = ref<string | null>(null)
const matchAnswered = ref(false)
const matchCorrect = ref(false)
const finished = ref(false)
const sessionPoints = ref(0)
const perfectRounds = ref(0)

const current = computed(() => rounds.value[roundIndex.value])
const progress = computed(() => {
  if (!rounds.value.length) return 0
  let step = 0
  const r = current.value
  if (r?.type === 'sequence') {
    step = matchAnswered.value ? 1 : seqStep.value / r.sequence.length
  } else if (r?.type === 'match') {
    step = matchAnswered.value ? 1 : 0.3
  }
  return Math.round(((roundIndex.value + step) / rounds.value.length) * 100)
})

function load() {
  loading.value = true
  rounds.value = buildMeridianRounds(5)
  roundIndex.value = 0
  resetRoundState()
  finished.value = false
  sessionPoints.value = 0
  perfectRounds.value = 0
  loading.value = false
}

function resetRoundState() {
  seqStep.value = 0
  litPoints.value = []
  wrongFlash.value = false
  matchPick.value = null
  matchAnswered.value = false
  matchCorrect.value = false
}

function onSeqClick(name: string) {
  const r = current.value
  if (!r || r.type !== 'sequence' || wrongFlash.value) return
  const expected = r.sequence[seqStep.value]
  if (name !== expected) {
    wrongFlash.value = true
    setTimeout(() => {
      wrongFlash.value = false
    }, 500)
    return
  }
  litPoints.value = [...litPoints.value, name]
  seqStep.value += 1
  sessionPoints.value += 12
  if (seqStep.value >= r.sequence.length) {
    sessionPoints.value += 10
    perfectRounds.value += 1
    matchAnswered.value = true
  }
}

function seqChipClass(name: string) {
  const lit = litPoints.value.includes(name)
  const r = current.value
  if (!r || r.type !== 'sequence') return {}
  const isNext = !lit && name === r.sequence[seqStep.value]
  return {
    lit,
    next: isNext && !matchAnswered.value,
    dim: lit || matchAnswered.value,
  }
}

function onMatchClick(meridian: string) {
  const r = current.value
  if (!r || r.type !== 'match' || matchAnswered.value) return
  matchPick.value = meridian
  matchAnswered.value = true
  matchCorrect.value = meridian === r.answerMeridian
  if (matchCorrect.value) {
    sessionPoints.value += 15
    perfectRounds.value += 1
  }
}

function nextRound() {
  if (roundIndex.value >= rounds.value.length - 1) {
    finished.value = true
    const stars = starsFromRatio(perfectRounds.value / rounds.value.length)
    scoreStore.addPoints(sessionPoints.value, 'meridian', 'meridian', stars)
    return
  }
  roundIndex.value += 1
  resetRoundState()
}

function open3D() {
  const r = current.value
  const meridian = r?.type === 'sequence' ? r.meridian : r?.type === 'match' ? r.answerMeridian : undefined
  router.push({
    path: '/atlas/acupoint',
    query: meridian ? { meridian } : undefined,
  })
}

function restart() {
  load()
}

onMounted(load)
</script>

<template>
  <GameShell title="经络穴位闯关" subtitle="按循行顺序点亮穴位，或辨认穴位归属经络" @back="emit('back')">
    <div v-if="loading" class="state-box">正在加载经络数据…</div>

    <div v-else-if="!rounds.length" class="state-box">
      <p>暂无可用关卡</p>
      <el-button type="primary" @click="load">重试</el-button>
    </div>

    <div v-else-if="finished" class="result-panel">
      <div class="result-icon">🎯</div>
      <h3>闯关完成</h3>
      <p>完美通关 <strong>{{ perfectRounds }}</strong> / {{ rounds.length }} 关</p>
      <p class="points">获得积分 <strong>+{{ sessionPoints }}</strong></p>
      <div class="result-actions">
        <el-button type="primary" @click="restart">再来一局</el-button>
        <el-button @click="open3D">打开 3D 针灸</el-button>
        <el-button @click="emit('back')">返回列表</el-button>
      </div>
    </div>

    <div v-else-if="current" class="meridian-panel">
      <div class="progress-row">
        <span>第 {{ roundIndex + 1 }} / {{ rounds.length }} 关</span>
        <el-progress :percentage="progress" :stroke-width="8" :color="current.color" />
        <button type="button" class="link-3d" @click="open3D">3D 查看</button>
      </div>

      <!-- 循行顺序关 -->
      <template v-if="current.type === 'sequence'">
        <div class="meridian-banner" :style="{ borderColor: current.color }">
          <span class="meridian-dot" :style="{ background: current.color }" />
          <div>
            <h3>{{ current.meridian }}</h3>
            <p>请按<strong>循行顺序</strong>依次点亮穴位（{{ current.sequence.length }} 个）</p>
          </div>
        </div>

        <div class="path-strip">
          <div
            v-for="(name, i) in current.sequence"
            :key="'step-' + name"
            class="path-node"
            :class="{ done: i < seqStep, active: i === seqStep && !matchAnswered }"
            :style="i < seqStep ? { borderColor: current.color, color: current.color } : {}"
          >
            <span class="node-num">{{ i + 1 }}</span>
            <span class="node-name">{{ i < seqStep ? name : '?' }}</span>
          </div>
        </div>

        <div class="point-grid" :class="{ shake: wrongFlash }">
          <button
            v-for="name in current.pool"
            :key="name"
            type="button"
            class="point-chip"
            :class="seqChipClass(name)"
            :style="litPoints.includes(name) ? { borderColor: current.color, background: current.color + '22' } : {}"
            :disabled="litPoints.includes(name) || matchAnswered"
            @click="onSeqClick(name)"
          >
            {{ name }}
          </button>
        </div>

        <div v-if="matchAnswered" class="round-feedback ok">
          循行点亮完成！+{{ current.sequence.length * 12 + 10 }} 分
          <el-button type="primary" size="small" @click="nextRound">
            {{ roundIndex >= rounds.length - 1 ? '查看成绩' : '下一关' }}
          </el-button>
        </div>
        <p v-else-if="wrongFlash" class="round-feedback fail">顺序不对，请按路线继续点</p>
        <p v-else class="hint">下一个：<strong>{{ current.sequence[seqStep] }}</strong></p>
      </template>

      <!-- 认经关 -->
      <template v-else>
        <div class="match-card">
          <span class="match-label">穴位认经</span>
          <h3 class="point-name">{{ current.pointName }}</h3>
          <p class="match-task">这个穴位属于哪条经络？</p>
        </div>

        <div class="meridian-options">
          <button
            v-for="opt in current.options"
            :key="opt.meridian"
            type="button"
            class="meridian-opt"
            :class="{
              picked: matchPick === opt.meridian,
              correct: matchAnswered && opt.meridian === current.answerMeridian,
              wrong: matchAnswered && matchPick === opt.meridian && opt.meridian !== current.answerMeridian,
            }"
            :disabled="matchAnswered"
            @click="onMatchClick(opt.meridian)"
          >
            {{ opt.short }}
          </button>
        </div>

        <div v-if="matchAnswered" class="round-feedback" :class="matchCorrect ? 'ok' : 'fail'">
          <template v-if="matchCorrect">认经正确！+15 分</template>
          <template v-else>正确答案：{{ current.meridianShort }}（{{ current.answerMeridian }}）</template>
          <el-button type="primary" size="small" @click="nextRound">
            {{ roundIndex >= rounds.length - 1 ? '查看成绩' : '下一关' }}
          </el-button>
        </div>
      </template>
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
  flex-wrap: wrap;
  margin-top: 20px;
}

.meridian-panel {
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

.link-3d {
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: #1a5f3f;
  cursor: pointer;
  white-space: nowrap;
}

.link-3d:hover {
  border-color: #1a5f3f;
  background: #e8f5ee;
}

.meridian-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-left: 4px solid;
  background: #f5f7fa;
  border-radius: 0 10px 10px 0;
  margin-bottom: 20px;
}

.meridian-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.meridian-banner h3 {
  margin: 0 0 4px;
  font-size: 17px;
  color: #303133;
}

.meridian-banner p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.path-strip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.path-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  padding: 8px 6px;
  border: 2px dashed #dcdfe6;
  border-radius: 10px;
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.path-node.done {
  border-style: solid;
  background: #f0f9eb;
}

.path-node.active {
  border-color: #1a5f3f;
  border-style: solid;
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(26, 95, 63, 0.25); }
  50% { box-shadow: 0 0 0 6px rgba(26, 95, 63, 0); }
}

.node-num {
  font-weight: 700;
  margin-bottom: 2px;
}

.node-name {
  font-weight: 600;
}

.point-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.point-grid.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

@media (max-width: 560px) {
  .point-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.point-chip {
  padding: 16px 8px;
  border: 2px solid #e8e4dc;
  border-radius: 10px;
  background: #faf8f4;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}

.point-chip:hover:not(:disabled) {
  border-color: #1a5f3f;
  transform: translateY(-1px);
}

.point-chip.next {
  box-shadow: 0 0 0 3px rgba(26, 95, 63, 0.15);
}

.point-chip.lit {
  cursor: default;
  opacity: 0.85;
}

.point-chip.dim:not(.lit) {
  opacity: 0.5;
}

.hint {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.match-card {
  text-align: center;
  padding: 28px 20px;
  background: linear-gradient(135deg, #eef2f7 0%, #e8f0fe 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.match-label {
  font-size: 12px;
  color: #606266;
}

.point-name {
  margin: 8px 0;
  font-size: 32px;
  color: #1a5f3f;
  font-family: 'Songti SC', 'SimSun', serif;
}

.match-task {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.meridian-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.meridian-opt {
  padding: 18px 12px;
  border: 2px solid #e8e4dc;
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.meridian-opt:hover:not(:disabled) {
  border-color: #1a5f3f;
  background: #e8f5ee;
}

.meridian-opt.correct {
  border-color: #67c23a;
  background: #f0f9eb;
  color: #529b2e;
}

.meridian-opt.wrong {
  border-color: #f56c6c;
  background: #fef0f0;
}

.round-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.round-feedback.ok {
  color: #67c23a;
}

.round-feedback.fail {
  color: #f56c6c;
}
</style>
