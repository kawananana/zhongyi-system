<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameShell from '@/components/games/GameShell.vue'
import { useGameScoreStore } from '@/store/gameScore'
import { buildSeasonQuestions, type GameQuestion } from '@/utils/seasonGamePool'

const emit = defineEmits<{ back: [] }>()

const scoreStore = useGameScoreStore()
const loading = ref(true)
const questions = ref<GameQuestion[]>([])
const index = ref(0)
const selected = ref<number | null>(null)
const answered = ref(false)
const correctCount = ref(0)
const streak = ref(0)
const finished = ref(false)
const sessionPoints = ref(0)

const current = computed(() => questions.value[index.value])
const progress = computed(() =>
  questions.value.length ? Math.round(((index.value + (answered.value ? 1 : 0)) / questions.value.length) * 100) : 0,
)

function load() {
  loading.value = true
  index.value = 0
  selected.value = null
  answered.value = false
  correctCount.value = 0
  streak.value = 0
  finished.value = false
  sessionPoints.value = 0
  questions.value = buildSeasonQuestions(8)
  loading.value = false
}

function choose(i: number) {
  if (answered.value || !current.value) return
  selected.value = i
  answered.value = true
  const ok = i === current.value.answerIndex
  if (ok) {
    correctCount.value += 1
    streak.value += 1
    const bonus = streak.value >= 3 ? 5 : 0
    sessionPoints.value += 10 + bonus
  } else {
    streak.value = 0
  }
}

function next() {
  if (index.value >= questions.value.length - 1) {
    finished.value = true
    const stars = starsFromRatio(correctCount.value / questions.value.length)
    scoreStore.addPoints(sessionPoints.value, 'season', 'season', stars)
    return
  }
  index.value += 1
  selected.value = null
  answered.value = false
}

function restart() {
  load()
}

onMounted(load)
</script>

<template>
  <GameShell title="节气养生问答" subtitle="二十四节气的起居、饮食与养生要点" @back="emit('back')">
    <div v-if="loading" class="state-box">正在准备题目…</div>

    <div v-else-if="!questions.length" class="state-box">
      <p>暂无可用题目</p>
      <el-button type="primary" @click="load">重试</el-button>
    </div>

    <div v-else-if="finished" class="result-panel">
      <div class="result-icon">🍂</div>
      <h3>本轮结束</h3>
      <p>答对 <strong>{{ correctCount }}</strong> / {{ questions.length }} 题</p>
      <p class="points">获得积分 <strong>+{{ sessionPoints }}</strong></p>
      <div class="result-actions">
        <el-button type="primary" @click="restart">再来一局</el-button>
        <el-button @click="emit('back')">返回列表</el-button>
      </div>
    </div>

    <div v-else-if="current" class="quiz-panel">
      <div class="progress-row">
        <span>第 {{ index + 1 }} / {{ questions.length }} 题</span>
        <el-progress :percentage="progress" :stroke-width="8" color="#1a5f3f" />
        <span v-if="streak >= 3" class="streak">🔥 连对 {{ streak }}</span>
      </div>

      <p v-if="current.tag" class="term-tag">{{ current.tag }}</p>
      <h3 class="question">{{ current.prompt }}</h3>

      <div class="options">
        <button
          v-for="(opt, i) in current.options"
          :key="i"
          type="button"
          class="option-btn"
          :class="{
            selected: selected === i,
            correct: answered && i === current.answerIndex,
            wrong: answered && selected === i && i !== current.answerIndex,
          }"
          @click="choose(i)"
        >
          <span class="opt-letter">{{ String.fromCharCode(65 + i) }}</span>
          {{ opt }}
        </button>
      </div>

      <div v-if="answered" class="feedback">
        <p v-if="selected === current.answerIndex" class="ok">回答正确！+{{ streak >= 3 ? 15 : 10 }} 分</p>
        <p v-else class="fail">
          正确答案：{{ current.options[current.answerIndex] }}
        </p>
        <p v-if="current.hint" class="hint">{{ current.hint }}</p>
        <el-button type="primary" @click="next">
          {{ index >= questions.length - 1 ? '查看成绩' : '下一题' }}
        </el-button>
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

.quiz-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e4dc;
  padding: 24px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #909399;
}

.progress-row .el-progress {
  flex: 1;
}

.streak {
  color: #e6a23c;
  font-weight: 600;
  white-space: nowrap;
}

.term-tag {
  display: inline-block;
  margin: 0 0 10px;
  padding: 4px 10px;
  background: #e8f5ee;
  color: #1a5f3f;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.question {
  margin: 0 0 20px;
  font-size: 18px;
  line-height: 1.5;
  color: #303133;
}

.options {
  display: grid;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  padding: 14px 16px;
  border: 1px solid #e8e4dc;
  border-radius: 10px;
  background: #faf8f4;
  cursor: pointer;
  font-size: 15px;
  color: #303133;
  line-height: 1.45;
  transition: border-color 0.15s, background 0.15s;
}

.option-btn:hover:not(.correct):not(.wrong) {
  border-color: #1a5f3f;
  background: #e8f5ee;
}

.option-btn.selected {
  border-color: #1a5f3f;
  background: #e8f5ee;
}

.option-btn.correct {
  border-color: #67c23a;
  background: #f0f9eb;
}

.option-btn.wrong {
  border-color: #f56c6c;
  background: #fef0f0;
}

.opt-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 1px;
}

.feedback {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #e8e4dc;
}

.feedback .ok {
  color: #67c23a;
  font-weight: 600;
}

.feedback .fail {
  color: #f56c6c;
  margin-bottom: 8px;
}

.feedback .hint {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
</style>
