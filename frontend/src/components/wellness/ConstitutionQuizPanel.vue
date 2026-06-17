<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TcmDisclaimer from '@/components/common/TcmDisclaimer.vue'
import CareTextWithHerbLinks from '@/components/wellness/CareTextWithHerbLinks.vue'
import {
  CONSTITUTION_QUESTIONS,
  LIKERT_OPTIONS,
  QUIZ_INSTRUCTION,
  QUIZ_OPTION_LEGEND,
} from '@/data/constitutionQuiz'
import {
  evaluateConstitution,
  type ConstitutionResult,
} from '@/utils/constitutionEvaluate'
import { loadHerbLinkIndex } from '@/utils/constitutionHerbLinks'

const STORAGE_KEY = 'bencao_constitution_last'

const router = useRouter()
const answers = ref<Record<number, number>>({})
const result = ref<ConstitutionResult | null>(null)
const phase = ref<'quiz' | 'result'>('quiz')
const herbLinkIndex = ref<Map<string, number>>(new Map())
const herbLinksLoading = ref(false)

async function ensureHerbLinkIndex() {
  if (herbLinkIndex.value.size > 0 || herbLinksLoading.value) return
  herbLinksLoading.value = true
  try {
    herbLinkIndex.value = await loadHerbLinkIndex()
  } finally {
    herbLinksLoading.value = false
  }
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed.answers) answers.value = parsed.answers
    if (parsed.result) {
      result.value = parsed.result
      phase.value = 'result'
    }
  } catch {
    /* ignore */
  }
}

loadSaved()
watch(
  () => phase.value,
  (p) => {
    if (p === 'result') void ensureHerbLinkIndex()
  },
  { immediate: true },
)

function saveResult(data: Record<number, number>, evalResult: ConstitutionResult) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ answers: data, result: evalResult, time: new Date().toISOString() }),
  )
}

const answeredCount = computed(() => Object.keys(answers.value).length)
const progress = computed(() => Math.round((answeredCount.value / 20) * 100))
const allAnswered = computed(() => answeredCount.value >= 20)

const groupedQuestions = computed(() => {
  const groups: { label: string; items: typeof CONSTITUTION_QUESTIONS }[] = []
  let current = ''
  for (const q of CONSTITUTION_QUESTIONS) {
    if (q.groupLabel !== current) {
      current = q.groupLabel
      groups.push({ label: current, items: [] })
    }
    groups[groups.length - 1].items.push(q)
  }
  return groups
})

const biasScores = computed(() =>
  result.value?.scores.filter((s) => s.key !== 'pinghe').sort((a, b) => b.total - a.total) ?? [],
)

function selectAnswer(questionId: number, value: number) {
  answers.value = { ...answers.value, [questionId]: value }
}

function submitQuiz() {
  if (!allAnswered.value) return
  const evalResult = evaluateConstitution(answers.value)
  result.value = evalResult
  saveResult(answers.value, evalResult)
  phase.value = 'result'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function retake() {
  answers.value = {}
  result.value = null
  phase.value = 'quiz'
}

function askAiDeep() {
  if (!result.value) return
  sessionStorage.setItem(
    'bencao_constitution_payload',
    JSON.stringify({ answers: answers.value, result: result.value }),
  )
  router.push({ path: '/study', query: { tab: 'chat', from: 'constitution' } })
}

function renderMarkdownLite(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}
</script>

<template>
  <div class="constitution-quiz">
    <header class="quiz-header">
      <div>
        <h2>中医九体质 · 20 题标准自测</h2>
        <p class="instruction">{{ QUIZ_INSTRUCTION }}</p>
        <p class="instruction option-legend">{{ QUIZ_OPTION_LEGEND }}</p>
      </div>
      <div v-if="phase === 'quiz'" class="progress-chip">
        <span>答题进度</span>
        <strong>{{ answeredCount }}/20</strong>
      </div>
    </header>

    <TcmDisclaimer class="disclaimer-top" />

    <div v-if="phase === 'quiz'" class="quiz-body">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
      </div>

      <section v-for="group in groupedQuestions" :key="group.label" class="question-group">
        <h3 class="group-title">{{ group.label }}</h3>
        <article v-for="q in group.items" :key="q.id" class="question-card">
          <p class="question-text">
            <span class="q-no">{{ q.id }}.</span>
            {{ q.text }}
          </p>
          <div class="options">
            <label
              v-for="opt in LIKERT_OPTIONS"
              :key="opt.value"
              class="option"
              :class="{ selected: answers[q.id] === opt.value }"
            >
              <input
                type="radio"
                :name="`q-${q.id}`"
                :value="opt.value"
                :checked="answers[q.id] === opt.value"
                @change="selectAnswer(q.id, opt.value)"
              />
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-score">{{ opt.value }}分</span>
            </label>
          </div>
        </article>
      </section>

      <footer class="quiz-actions">
        <el-button type="primary" size="large" :disabled="!allAnswered" @click="submitQuiz">
          提交测评
        </el-button>
        <p v-if="!allAnswered" class="hint">请完成全部 20 题后提交</p>
      </footer>
    </div>

    <div v-else-if="result" class="result-body">
      <div class="result-hero" :class="{ balanced: result.isBalanced }">
        <span class="result-icon">{{ result.isBalanced ? '🌿' : '📋' }}</span>
        <h3>{{ result.summary }}</h3>
        <p v-html="renderMarkdownLite(result.conclusionText)" />
      </div>

      <section class="result-section">
        <h4>各体质分项得分</h4>
        <div class="score-grid">
          <div
            v-for="s in result.scores"
            :key="s.key"
            class="score-item"
            :class="{ highlight: s.key === result.primary || s.key === result.secondary }"
          >
            <span class="score-name">{{ s.name }}</span>
            <div class="score-bar-wrap">
              <div class="score-bar" :style="{ width: `${(s.total / s.max) * 100}%` }" />
            </div>
            <span class="score-num">{{ s.total }}/{{ s.max }}</span>
          </div>
        </div>
      </section>

      <section v-if="result.evidence.length" class="result-section">
        <h4>判定依据（对应您的作答）</h4>
        <ul class="evidence-list">
          <li v-for="e in result.evidence" :key="e.questionId">
            第 {{ e.questionId }} 题「{{ e.text }}」→
            <strong>{{ e.optionLabel }}</strong>（{{ e.score }} 分）
          </li>
        </ul>
      </section>

      <section class="result-section care-grid">
        <div class="care-card">
          <h4>🍽 饮食宜忌</h4>
          <ul>
            <li v-for="(t, i) in result.care.diet" :key="`d-${i}`">
              <CareTextWithHerbLinks :text="t" :herb-link-index="herbLinkIndex" />
            </li>
          </ul>
        </div>
        <div class="care-card">
          <h4>🌙 作息养护</h4>
          <ul>
            <li v-for="(t, i) in result.care.rest" :key="`r-${i}`">
              <CareTextWithHerbLinks :text="t" :herb-link-index="herbLinkIndex" />
            </li>
          </ul>
        </div>
        <div class="care-card">
          <h4>🏃 运动建议</h4>
          <ul>
            <li v-for="(t, i) in result.care.exercise" :key="`e-${i}`">
              <CareTextWithHerbLinks :text="t" :herb-link-index="herbLinkIndex" />
            </li>
          </ul>
        </div>
        <div class="care-card">
          <h4>🏠 居家温和养生</h4>
          <ul>
            <li v-for="(t, i) in result.care.home" :key="`h-${i}`">
              <CareTextWithHerbLinks :text="t" :herb-link-index="herbLinkIndex" />
            </li>
          </ul>
        </div>
      </section>

      <section v-if="biasScores.length && !result.isBalanced" class="result-section muted-box">
        <h4>偏颇体质参考排序</h4>
        <p class="muted-desc">
          {{ biasScores.slice(0, 3).map((s) => `${s.name}（${s.total} 分）`).join(' · ') }}
        </p>
      </section>

      <TcmDisclaimer class="disclaimer-result" />

      <footer class="result-actions">
        <el-button type="primary" @click="askAiDeep">AI 深入解读</el-button>
        <el-button @click="retake">重新测评</el-button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.constitution-quiz {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quiz-header {
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

.quiz-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.instruction {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  opacity: 0.92;
  max-width: 640px;
}

.instruction.option-legend {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.88;
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
}

.progress-chip strong {
  font-size: 24px;
}

.disclaimer-top,
.disclaimer-result {
  margin-top: 0;
}

.quiz-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-bar {
  height: 6px;
  background: #ebe6dc;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a5f3f, #2d8a5e);
  transition: width 0.25s;
}

.question-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  margin: 8px 0 0;
  font-size: 15px;
  color: #1a5f3f;
  padding-left: 10px;
  border-left: 3px solid #1a5f3f;
}

.question-card {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
}

.question-text {
  margin: 0 0 12px;
  font-size: 14px;
  color: #303133;
  line-height: 1.55;
}

.q-no {
  color: #1a5f3f;
  font-weight: 700;
  margin-right: 4px;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e8e4dc;
  border-radius: 20px;
  background: #faf8f4;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  font-size: 13px;
}

.option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option.selected {
  border-color: #1a5f3f;
  background: #e8f5ee;
  color: #1a5f3f;
}

.opt-score {
  font-size: 11px;
  color: #909399;
}

.option.selected .opt-score {
  color: #1a5f3f;
}

.quiz-actions {
  text-align: center;
  padding: 8px 0 16px;
}

.hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: #909399;
}

.result-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-hero {
  text-align: center;
  padding: 28px 20px;
  background: linear-gradient(135deg, #fffdf6 0%, #fff 100%);
  border: 1px solid #f0d78c;
  border-radius: 16px;
}

.result-hero.balanced {
  border-color: #b8d4c4;
  background: linear-gradient(135deg, #f0f7f2 0%, #fff 100%);
}

.result-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.result-hero h3 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #1a5f3f;
}

.result-hero p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.result-section {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
}

.result-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  color: #303133;
}

.score-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-item {
  display: grid;
  grid-template-columns: 72px 1fr 52px;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.score-item.highlight .score-name {
  color: #1a5f3f;
  font-weight: 600;
}

.score-bar-wrap {
  height: 8px;
  background: #f0ebe3;
  border-radius: 4px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  background: linear-gradient(90deg, #8b6914, #1a5f3f);
  border-radius: 4px;
  min-width: 4px;
}

.score-item.highlight .score-bar {
  background: linear-gradient(90deg, #e6a23c, #1a5f3f);
}

.score-num {
  text-align: right;
  color: #909399;
}

.evidence-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
}

.evidence-list strong {
  color: #1a5f3f;
}

.care-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0;
  border: none;
  background: transparent;
}

.care-card {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
}

.care-card h4 {
  margin: 0 0 10px;
  font-size: 14px;
}

.care-card ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #606266;
  line-height: 1.65;
}

.muted-box {
  background: #faf8f4;
}

.muted-desc {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 8px;
}

@media (max-width: 768px) {
  .care-grid {
    grid-template-columns: 1fr;
  }

  .options {
    flex-direction: column;
  }

  .option {
    width: 100%;
    justify-content: space-between;
  }

  .score-item {
    grid-template-columns: 64px 1fr 48px;
  }
}
</style>
