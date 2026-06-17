<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Calendar, EditPen, List, Plus, Sunny } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { DIET_TAG_OPTIONS, getCurrentSolarTerm } from '@/utils/solarTerm'
import {
  avgMood,
  calcRecordStreak,
  formatDateKey,
  getRecentDateKeys,
  hasRecord,
  listHistoryLogs,
  loadCheckinPlans,
  loadDailyLogs,
  saveCheckinPlans,
  saveDailyLog,
  deleteDailyLog,
  weekCheckinSummary,
  type CheckinPlan,
  type DailyLog,
} from '@/utils/wellnessStorage'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedDate = ref(new Date())
const plans = ref<CheckinPlan[]>([])
const allLogs = ref<Record<string, DailyLog>>({})

const dateKey = computed(() => formatDateKey(selectedDate.value))
const userId = computed(() => userStore.userBrief?.userId)
const solarTerm = computed(() => getCurrentSolarTerm(selectedDate.value))
const isToday = computed(() => dateKey.value === formatDateKey(new Date()))

const currentLog = ref<DailyLog>({
  date: '',
  diet: '',
  lifestyle: '',
  mood: 3,
  checkins: {},
  dietTags: [],
  sleepTime: '',
  wakeTime: '',
})

const moodLabels = ['', '欠佳', '一般', '不错', '很好', '极佳']
const dietTags = DIET_TAG_OPTIONS

const daysWithRecord = computed(() => {
  const set = new Set<string>()
  for (const [key, log] of Object.entries(allLogs.value)) {
    if (hasRecord(log)) set.add(key)
  }
  return set
})

const dayStatusMap = computed(() => {
  const map: Record<string, 'full' | 'partial'> = {}
  for (const key of daysWithRecord.value) {
    const log = allLogs.value[key]
    const done = plans.value.filter((p) => log?.checkins?.[p.id]).length
    map[key] = done >= plans.value.length && plans.value.length > 0 ? 'full' : 'partial'
  }
  return map
})

const todayCheckinDone = computed(() => {
  const done = plans.value.filter((p) => currentLog.value.checkins[p.id]).length
  return { done, total: plans.value.length }
})

const recordStreak = computed(() => calcRecordStreak(allLogs.value))
const weekKeys = computed(() => getRecentDateKeys(7))
const weekAvgMood = computed(() => avgMood(allLogs.value, weekKeys.value))
const weekSummary = computed(() => weekCheckinSummary(allLogs.value, plans.value))

const historyCount = computed(() => listHistoryLogs(allLogs.value, plans.value.length).length)

const weekDayLabel = (date: string) => {
  const d = new Date(`${date}T12:00:00`)
  return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
}

function reloadStore() {
  plans.value = loadCheckinPlans(userId.value)
  allLogs.value = loadDailyLogs(userId.value)
  syncLogFromStore()
}

function syncLogFromStore() {
  const key = dateKey.value
  const existing = allLogs.value[key]
  currentLog.value = existing
    ? {
        ...existing,
        checkins: { ...existing.checkins },
        dietTags: [...(existing.dietTags ?? [])],
      }
    : {
        date: key,
        diet: '',
        lifestyle: '',
        mood: 3,
        checkins: {},
        dietTags: [],
        sleepTime: '',
        wakeTime: '',
      }
  currentLog.value.date = key
}

function persistLog(silent = false) {
  currentLog.value.date = dateKey.value
  saveDailyLog(
    {
      ...currentLog.value,
      checkins: { ...currentLog.value.checkins },
      dietTags: [...(currentLog.value.dietTags ?? [])],
    },
    userId.value,
  )
  allLogs.value = loadDailyLogs(userId.value)
  if (!silent) ElMessage.success('已保存当日记录')
}

function toggleCheckin(planId: string) {
  currentLog.value.checkins[planId] = !currentLog.value.checkins[planId]
  persistLog(true)
}

function checkinAll() {
  for (const p of plans.value) {
    currentLog.value.checkins[p.id] = true
  }
  persistLog(true)
  ElMessage.success('今日计划已全部打卡')
}

function toggleDietTag(id: string) {
  const tags = new Set(currentLog.value.dietTags ?? [])
  if (tags.has(id)) tags.delete(id)
  else tags.add(id)
  currentLog.value.dietTags = [...tags]
}

function onCalendarPick(day: string) {
  selectedDate.value = new Date(`${day}T12:00:00`)
}

function goHistory() {
  router.push('/wellness/history')
}

function applyDateFromRoute() {
  const d = route.query.date as string | undefined
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    selectedDate.value = new Date(`${d}T12:00:00`)
  }
}

function dayNum(day: string) {
  return new Date(`${day}T12:00:00`).getDate()
}

const showAddPlan = ref(false)
const newPlanTitle = ref('')

function addPlan() {
  const title = newPlanTitle.value.trim()
  if (!title) return
  plans.value.push({ id: `custom_${Date.now()}`, title, icon: '✨' })
  saveCheckinPlans(plans.value, userId.value)
  newPlanTitle.value = ''
  showAddPlan.value = false
  ElMessage.success('已添加打卡项')
}

function removePlan(id: string) {
  plans.value = plans.value.filter((p) => p.id !== id)
  saveCheckinPlans(plans.value, userId.value)
}

async function clearDayRecord() {
  await ElMessageBox.confirm('确定清空该日记录吗？', '提示', { type: 'warning' })
  deleteDailyLog(dateKey.value, userId.value)
  allLogs.value = loadDailyLogs(userId.value)
  syncLogFromStore()
  ElMessage.success('已清空')
}

function goLogin() {
  router.push('/login')
}

onMounted(() => {
  reloadStore()
  applyDateFromRoute()
})

watch(dateKey, syncLogFromStore)
watch(userId, reloadStore)
watch(() => route.query.date, applyDateFromRoute)
</script>

<template>
  <div class="journal-panel">
    <!-- 节气养生 -->
    <div class="solar-banner">
      <div class="solar-head">
        <el-icon><Sunny /></el-icon>
        <span class="solar-name">{{ solarTerm.name }}</span>
        <span class="solar-season">{{ solarTerm.season }}季养生</span>
      </div>
      <p class="solar-tip">{{ solarTerm.tip }}</p>
      <div class="solar-tags">
        <span class="solar-tag diet">宜：{{ solarTerm.diet }}</span>
        <span v-if="solarTerm.avoid" class="solar-tag avoid">忌：{{ solarTerm.avoid }}</span>
      </div>
    </div>

    <div v-if="!userStore.isLoggedIn()" class="login-tip">
      <span>登录后记录将保存在你的账号下，换设备也不丢失</span>
      <el-button type="primary" size="small" link @click="goLogin">去登录</el-button>
    </div>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ todayCheckinDone.done }}/{{ todayCheckinDone.total }}</span>
        <span class="stat-label">今日打卡</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ recordStreak }}<small>天</small></span>
        <span class="stat-label">连续记录</span>
      </div>
      <div class="stat-card clickable" @click="goHistory">
        <span class="stat-value">{{ daysWithRecord.size }}</span>
        <span class="stat-label">累计记录 · 查看历史</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ weekAvgMood ?? '—' }}</span>
        <span class="stat-label">本周均分</span>
      </div>
    </div>

    <!-- 本周概览 -->
    <el-card class="panel-card week-card" shadow="never">
      <template #header>
        <div class="card-head">近 7 日概览</div>
      </template>
      <div class="week-chart">
        <div v-for="item in weekSummary" :key="item.date" class="week-col">
          <div class="bar-wrap">
            <div
              class="bar checkin-bar"
              :style="{ height: `${Math.max(item.rate, item.rate > 0 ? 8 : 0)}%` }"
              :title="`打卡 ${item.rate}%`"
            />
            <div
              v-if="item.mood"
              class="bar mood-bar"
              :style="{ height: `${item.mood * 20}%` }"
              :title="`状态 ${item.mood} 分`"
            />
          </div>
          <span class="week-day">{{ weekDayLabel(item.date) }}</span>
          <span v-if="item.date === formatDateKey(new Date())" class="week-today">今</span>
        </div>
      </div>
      <p class="week-legend">
        <span><i class="dot green" />打卡完成率</span>
        <span><i class="dot gold" />当日状态</span>
      </p>
    </el-card>

    <!-- 历史打卡入口 -->
    <div class="history-entry" @click="goHistory">
      <div class="entry-icon"><el-icon><List /></el-icon></div>
      <div class="entry-text">
        <h3>历史打卡详情</h3>
        <p>{{ historyCount ? `共 ${historyCount} 天有记录，点击查看每日打卡详情` : '完成打卡后，可在这里查看历史记录' }}</p>
      </div>
      <el-button type="primary" round @click.stop="goHistory">
        进入
        <el-icon class="entry-arrow"><ArrowRight /></el-icon>
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="10">
        <el-card class="panel-card" shadow="never">
          <template #header>
            <div class="card-head">
              <el-icon><Calendar /></el-icon>
              <span>养生日历</span>
            </div>
          </template>
          <el-calendar v-model="selectedDate">
            <template #date-cell="{ data }">
              <div
                class="cal-cell"
                :class="{
                  'has-record': daysWithRecord.has(data.day),
                  'is-full': dayStatusMap[data.day] === 'full',
                  'is-selected': data.day === dateKey,
                }"
                @click.stop="onCalendarPick(data.day)"
              >
                <span class="cal-day">{{ dayNum(data.day) }}</span>
                <span
                  v-if="daysWithRecord.has(data.day)"
                  class="cal-dot"
                  :class="dayStatusMap[data.day]"
                />
              </div>
            </template>
          </el-calendar>
          <p class="cal-hint">
            <span class="dot green" />全部打卡
            <span class="dot partial" />部分记录
          </p>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="14">
        <el-card class="panel-card" shadow="never">
          <template #header>
            <div class="card-head-row">
              <div class="card-head">
                <el-icon><EditPen /></el-icon>
                <span>{{ dateKey }} · 当日记录</span>
                <el-tag v-if="isToday" size="small" type="success" effect="plain">今天</el-tag>
              </div>
              <el-button
                v-if="hasRecord(currentLog)"
                type="danger"
                link
                size="small"
                @click="clearDayRecord"
              >
                清空
              </el-button>
            </div>
          </template>

          <section class="section">
            <div class="section-head">
              <h4 class="section-title">每日打卡计划</h4>
              <el-button
                v-if="todayCheckinDone.done < todayCheckinDone.total"
                size="small"
                type="primary"
                plain
                @click="checkinAll"
              >
                一键全打卡
              </el-button>
            </div>
            <div class="checkin-list">
              <label v-for="plan in plans" :key="plan.id" class="checkin-item">
                <el-checkbox
                  :model-value="!!currentLog.checkins[plan.id]"
                  @change="toggleCheckin(plan.id)"
                />
                <span class="plan-icon">{{ plan.icon }}</span>
                <span class="plan-title">{{ plan.title }}</span>
                <el-button
                  v-if="plan.id.startsWith('custom_')"
                  type="danger"
                  link
                  size="small"
                  @click.prevent="removePlan(plan.id)"
                >
                  删除
                </el-button>
              </label>
            </div>
            <div v-if="showAddPlan" class="add-plan-row">
              <el-input v-model="newPlanTitle" placeholder="新打卡项名称" maxlength="32" />
              <el-button type="primary" size="small" @click="addPlan">确定</el-button>
              <el-button size="small" @click="showAddPlan = false">取消</el-button>
            </div>
            <el-button v-else class="add-plan-btn" :icon="Plus" text type="primary" @click="showAddPlan = true">
              添加打卡项
            </el-button>
          </section>

          <section class="section">
            <h4 class="section-title">作息记录</h4>
            <div class="time-row">
              <div class="time-field">
                <label>起床</label>
                <el-time-picker
                  v-model="currentLog.wakeTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择起床时间"
                  :clearable="true"
                  class="time-picker"
                />
              </div>
              <div class="time-field">
                <label>入睡</label>
                <el-time-picker
                  v-model="currentLog.sleepTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="选择入睡时间"
                  :clearable="true"
                  class="time-picker"
                />
              </div>
            </div>
          </section>

          <section class="section">
            <h4 class="section-title">饮食标签</h4>
            <div class="tag-grid">
              <button
                v-for="tag in dietTags"
                :key="tag.id"
                type="button"
                class="diet-tag"
                :class="{ active: currentLog.dietTags?.includes(tag.id) }"
                @click="toggleDietTag(tag.id)"
              >
                <span>{{ tag.icon }}</span>
                {{ tag.label }}
              </button>
            </div>
          </section>

          <section class="section">
            <h4 class="section-title">饮食记录</h4>
            <el-input
              v-model="currentLog.diet"
              type="textarea"
              :rows="3"
              placeholder="记录今日三餐、茶饮、药膳等…"
              maxlength="500"
              show-word-limit
            />
          </section>

          <section class="section">
            <h4 class="section-title">生活起居</h4>
            <el-input
              v-model="currentLog.lifestyle"
              type="textarea"
              :rows="3"
              placeholder="运动、情绪、天气感受、身体变化等…"
              maxlength="500"
              show-word-limit
            />
          </section>

          <section class="section">
            <h4 class="section-title">今日状态</h4>
            <el-rate v-model="currentLog.mood" :max="5" show-text :texts="moodLabels.slice(1)" />
          </section>

          <el-button type="primary" class="save-btn" @click="persistLog()">保存当日记录</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.journal-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.solar-banner {
  background: linear-gradient(120deg, #1a5f3f 0%, #2d8a5e 100%);
  color: #fff;
  border-radius: 12px;
  padding: 18px 22px;
}

.solar-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.solar-name {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Songti SC', 'SimSun', serif;
}

.solar-season {
  font-size: 13px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 6px;
}

.solar-tip {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.95;
}

.solar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.solar-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
}

.solar-tag.avoid {
  background: rgba(255, 200, 100, 0.2);
}

.login-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 8px;
  font-size: 13px;
  color: #b88230;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 720px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: linear-gradient(135deg, #e8f5ee 0%, #f7f3eb 100%);
  border: 1px solid #d4e8dc;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1a5f3f;
}

.stat-value small {
  font-size: 14px;
  font-weight: 500;
}

.stat-label {
  font-size: 12px;
  color: #606266;
}

.week-card {
  margin-bottom: 0;
}

.week-chart {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  height: 100px;
  padding: 0 4px;
}

.week-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.bar-wrap {
  flex: 1;
  width: 100%;
  max-width: 36px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 72px;
}

.bar {
  width: 10px;
  border-radius: 4px 4px 0 0;
  min-height: 0;
  transition: height 0.3s;
}

.checkin-bar {
  background: #67c23a;
}

.mood-bar {
  background: #e6a23c;
}

.week-day {
  font-size: 12px;
  color: #909399;
}

.week-today {
  position: absolute;
  top: -2px;
  font-size: 10px;
  color: #1a5f3f;
  font-weight: 700;
}

.week-legend {
  display: flex;
  gap: 16px;
  margin: 12px 0 0;
  font-size: 12px;
  color: #909399;
}

.week-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-card.clickable {
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.stat-card.clickable:hover {
  border-color: #1a5f3f;
  transform: translateY(-1px);
}

.history-entry {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #e8e4dc;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.history-entry:hover {
  border-color: #1a5f3f;
  box-shadow: 0 4px 14px rgba(26, 95, 63, 0.1);
}

.entry-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #e8f5ee;
  color: #1a5f3f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.entry-text {
  flex: 1;
  min-width: 0;
}

.entry-text h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #303133;
}

.entry-text p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.entry-arrow {
  margin-left: 4px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.green {
  background: #67c23a;
}

.dot.gold {
  background: #e6a23c;
}

.dot.partial {
  background: #e6a23c;
}

.panel-card {
  border-radius: 12px;
  border: 1px solid #e8e4dc;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1a5f3f;
}

.card-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cal-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-radius: 6px;
}

.cal-day {
  font-size: 13px;
}

.cal-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e6a23c;
  margin-top: 2px;
}

.cal-dot.full,
.cal-cell.is-full .cal-dot {
  background: #67c23a;
}

.cal-hint {
  margin: 12px 0 0;
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 16px;
}

.section {
  margin-bottom: 20px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-head .section-title {
  margin-bottom: 0;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkin-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #faf8f4;
  border-radius: 8px;
  cursor: pointer;
}

.plan-icon {
  font-size: 18px;
}

.plan-title {
  flex: 1;
  font-size: 14px;
}

.time-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.time-field {
  flex: 1;
  min-width: 140px;
}

.time-field label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.time-picker {
  width: 100%;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.diet-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e8e4dc;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.diet-tag:hover {
  border-color: #1a5f3f;
}

.diet-tag.active {
  border-color: #1a5f3f;
  background: #e8f5ee;
  color: #1a5f3f;
  font-weight: 500;
}

.add-plan-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.add-plan-btn {
  margin-top: 4px;
}

.save-btn {
  width: 100%;
  margin-top: 8px;
}

:deep(.el-calendar-table td.is-selected .cal-cell) {
  background: #e8f5ee;
}

:deep(.el-calendar-table .el-calendar-day) {
  padding: 4px;
  height: 52px;
}
</style>
