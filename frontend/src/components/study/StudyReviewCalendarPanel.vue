<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Expand, Fold, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { requireUserLogin } from '@/utils/requireLogin'
import { formatDateKey } from '@/utils/wellnessStorage'
import {
  REVIEW_CATEGORY_LABEL,
  REVIEW_PRESETS,
  addReviewTask,
  calcReviewStreak,
  countChatActivityByDate,
  dayReviewStatus,
  deleteReviewTask,
  generateSevenDayPlan,
  loadReviewTasks,
  tasksForDate,
  toggleReviewTask,
  weekReviewSummary,
  type StudyReviewTask,
} from '@/utils/studyReviewStorage'

const props = defineProps<{ sidebarCollapsed?: boolean }>()
const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const router = useRouter()
const userStore = useUserStore()

const selectedDate = ref(new Date())
const tasks = ref<StudyReviewTask[]>([])
const chatByDate = ref<Record<string, number>>({})
const customTitle = ref('')

const userId = computed(() => userStore.userBrief?.userId)
const dateKey = computed(() => formatDateKey(selectedDate.value))
const isToday = computed(() => dateKey.value === formatDateKey(new Date()))

const dayTasks = computed(() => tasksForDate(tasks.value, dateKey.value))
const dayDone = computed(() => dayTasks.value.filter((t) => t.done).length)
const dayChatCount = computed(() => chatByDate.value[dateKey.value] ?? 0)

const streak = computed(() => calcReviewStreak(tasks.value))
const weekStats = computed(() => weekReviewSummary(tasks.value))

const statusByDate = computed(() => {
  const map: Record<string, ReturnType<typeof dayReviewStatus>> = {}
  const dates = new Set([
    ...tasks.value.map((t) => t.date),
    ...Object.keys(chatByDate.value),
  ])
  for (const date of dates) {
    map[date] = dayReviewStatus(date, tasks.value, chatByDate.value[date] ?? 0)
  }
  return map
})

function reload() {
  tasks.value = loadReviewTasks(userId.value)
  chatByDate.value = countChatActivityByDate(userId.value)
}

watch(userId, () => reload(), { immediate: true })

function dayNum(day: string) {
  return day.split('-')[2]?.replace(/^0/, '') ?? day
}

function onCalendarPick(day: string) {
  selectedDate.value = new Date(`${day}T12:00:00`)
}

function ensureLogin(message = '登录后可管理复习计划') {
  return requireUserLogin(router, message, router.currentRoute.value.fullPath)
}

function onAddPreset(preset: (typeof REVIEW_PRESETS)[number]) {
  if (!ensureLogin()) return
  tasks.value = addReviewTask(
    { date: dateKey.value, title: preset.title, category: preset.category },
    userId.value,
  )
  ElMessage.success('已加入当日复习')
}

function onAddCustom() {
  const title = customTitle.value.trim()
  if (!title) return
  if (!ensureLogin()) return
  tasks.value = addReviewTask(
    { date: dateKey.value, title, category: 'other' },
    userId.value,
  )
  customTitle.value = ''
  ElMessage.success('已添加复习项')
}

function onToggle(taskId: string) {
  if (!ensureLogin()) return
  tasks.value = toggleReviewTask(taskId, userId.value)
}

async function onDelete(taskId: string) {
  if (!ensureLogin()) return
  await ElMessageBox.confirm('确认删除这条复习计划？', '删除')
  tasks.value = deleteReviewTask(taskId, userId.value)
  ElMessage.success('已删除')
}

async function onGeneratePlan() {
  if (!ensureLogin()) return
  const { total } = weekStats.value
  if (total > 0) {
    await ElMessageBox.confirm(
      '将为未来 7 天追加一组系统复习计划（不影响已有条目），是否继续？',
      '生成 7 天计划',
    )
  }
  tasks.value = generateSevenDayPlan(userId.value)
  ElMessage.success('7 天复习计划已生成，可在日历中查看')
}

function goChat() {
  router.push('/study')
}

function goGames() {
  router.push('/study?tab=games')
}
</script>

<template>
  <div class="calendar-panel">
    <header class="panel-header">
      <button type="button" class="toggle-sidebar" @click="emit('toggle-sidebar')">
        <el-icon><component :is="props.sidebarCollapsed ? Expand : Fold" /></el-icon>
      </button>
      <div class="header-center">
        <span class="panel-title">复习日历</span>
        <span class="panel-hint">规划每日复习 · 追踪伴学打卡</span>
      </div>
    </header>

    <div class="panel-body">
      <section class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ streak }}</span>
          <span class="stat-label">连续复习天</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ weekStats.done }}/{{ weekStats.total }}</span>
          <span class="stat-label">近 7 日完成</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ dayChatCount }}</span>
          <span class="stat-label">当日 AI 提问</span>
        </div>
        <el-button type="primary" plain class="plan-btn" @click="onGeneratePlan">
          生成 7 天计划
        </el-button>
      </section>

      <div class="main-grid">
        <section class="calendar-card">
          <div class="card-head">
            <el-icon><Calendar /></el-icon>
            <span>学习日历</span>
          </div>
          <el-calendar v-model="selectedDate">
            <template #date-cell="{ data }">
              <div
                class="cal-cell"
                :class="{
                  'is-selected': data.day === dateKey,
                  [`status-${statusByDate[data.day]}`]: !!statusByDate[data.day] && statusByDate[data.day] !== 'none',
                }"
                @click.stop="onCalendarPick(data.day)"
              >
                <span class="cal-day">{{ dayNum(data.day) }}</span>
                <span v-if="statusByDate[data.day] && statusByDate[data.day] !== 'none'" class="cal-dot" />
              </div>
            </template>
          </el-calendar>
          <p class="cal-legend">
            <span class="legend-item"><i class="dot planned" />待复习</span>
            <span class="legend-item"><i class="dot partial" />进行中</span>
            <span class="legend-item"><i class="dot done" />已完成</span>
          </p>
        </section>

        <section class="detail-card">
          <div class="card-head">
            <span>{{ dateKey }} · 复习清单</span>
            <el-tag v-if="isToday" size="small" type="success" effect="plain">今天</el-tag>
          </div>

          <p v-if="dayChatCount > 0" class="chat-tip">
            当日已向 AI 提问 {{ dayChatCount }} 次 ·
            <button type="button" class="link-btn" @click="goChat">继续伴学</button>
          </p>

          <ul v-if="dayTasks.length" class="task-list">
            <li v-for="task in dayTasks" :key="task.id" class="task-item">
              <label class="task-check">
                <input type="checkbox" :checked="task.done" @change="onToggle(task.id)" />
                <span class="task-text" :class="{ done: task.done }">{{ task.title }}</span>
              </label>
              <span class="task-tag">{{ REVIEW_CATEGORY_LABEL[task.category] }}</span>
              <button type="button" class="task-del" aria-label="删除" @click="onDelete(task.id)">×</button>
            </li>
          </ul>
          <el-empty v-else description="这一天还没有复习计划" :image-size="72" />

          <div v-if="dayTasks.length" class="progress-line">
            完成进度 {{ dayDone }}/{{ dayTasks.length }}
            <el-progress
              :percentage="dayTasks.length ? Math.round((dayDone / dayTasks.length) * 100) : 0"
              :stroke-width="8"
              :show-text="false"
            />
          </div>

          <div class="preset-block">
            <p class="block-label">快捷添加</p>
            <div class="preset-grid">
              <button
                v-for="preset in REVIEW_PRESETS"
                :key="preset.title"
                type="button"
                class="preset-chip"
                @click="onAddPreset(preset)"
              >
                <span>{{ preset.icon }}</span>
                {{ preset.title }}
              </button>
            </div>
          </div>

          <div class="custom-add">
            <el-input
              v-model="customTitle"
              placeholder="自定义复习内容…"
              maxlength="40"
              @keyup.enter="onAddCustom"
            />
            <el-button type="primary" :icon="Plus" @click="onAddCustom">添加</el-button>
          </div>

          <div class="quick-links">
            <button type="button" class="quick-link" @click="goChat">AI 伴学提问</button>
            <button type="button" class="quick-link" @click="goGames">趣学小游戏</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--bc-bg);
}

.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--bc-border);
  background: var(--bc-bg-card);
}

.toggle-sidebar {
  border: 1px solid var(--bc-border);
  background: var(--bc-bg-card);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bc-text-secondary);
}

.header-center {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bc-text);
}

.panel-hint {
  font-size: 12px;
  color: var(--bc-text-muted);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px 32px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: stretch;
}

.stat-card {
  min-width: 110px;
  padding: 14px 18px;
  border-radius: 12px;
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border-light);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--bc-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--bc-text-muted);
}

.plan-btn {
  margin-left: auto;
  align-self: center;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.calendar-card,
.detail-card {
  background: var(--bc-bg-card);
  border: 1px solid var(--bc-border);
  border-radius: var(--bc-radius-lg);
  padding: 16px 18px 18px;
  box-shadow: var(--bc-shadow);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--bc-primary);
}

.cal-cell {
  height: 100%;
  min-height: 44px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.cal-cell:hover {
  background: var(--bc-primary-light);
}

.cal-cell.is-selected {
  background: var(--bc-primary-soft);
}

.cal-day {
  font-size: 13px;
  color: var(--bc-text);
}

.cal-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-planned .cal-dot {
  background: #e6a23c;
}

.status-partial .cal-dot {
  background: #409eff;
}

.status-done .cal-dot {
  background: var(--bc-primary);
}

.cal-legend {
  margin: 10px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: var(--bc-text-muted);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.planned {
  background: #e6a23c;
}

.dot.partial {
  background: #409eff;
}

.dot.done {
  background: var(--bc-primary);
}

.chat-tip {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bc-primary-light);
  font-size: 13px;
  color: var(--bc-text-secondary);
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: var(--bc-primary);
  cursor: pointer;
  font-size: inherit;
}

.task-list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--bc-border-light);
  border-radius: 10px;
  background: var(--bc-bg-muted);
}

.task-check {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.task-check input {
  margin-top: 3px;
  accent-color: var(--bc-primary);
}

.task-text {
  font-size: 14px;
  color: var(--bc-text);
  line-height: 1.5;
}

.task-text.done {
  color: var(--bc-text-muted);
  text-decoration: line-through;
}

.task-tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--bc-primary-soft);
  color: var(--bc-primary);
}

.task-del {
  border: none;
  background: none;
  color: var(--bc-text-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

.task-del:hover {
  color: var(--bc-price);
}

.progress-line {
  margin-bottom: 18px;
  font-size: 13px;
  color: var(--bc-text-secondary);
}

.preset-block {
  margin-bottom: 14px;
}

.block-label {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--bc-text-muted);
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-chip {
  border: 1px solid var(--bc-border);
  border-radius: 20px;
  padding: 8px 12px;
  background: var(--bc-bg-card);
  font-size: 12px;
  color: var(--bc-text-secondary);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.preset-chip:hover {
  border-color: var(--bc-primary);
  background: var(--bc-primary-light);
  color: var(--bc-primary);
}

.custom-add {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-link {
  border: 1px solid var(--bc-border);
  border-radius: 8px;
  padding: 8px 14px;
  background: transparent;
  font-size: 13px;
  color: var(--bc-primary);
  cursor: pointer;
}

.quick-link:hover {
  background: var(--bc-primary-light);
}

:deep(.el-calendar-table .el-calendar-day) {
  padding: 4px;
  height: 52px;
}

:deep(.el-calendar-table td.is-selected .cal-cell) {
  background: var(--bc-primary-soft);
}

@media (max-width: 960px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .plan-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>
