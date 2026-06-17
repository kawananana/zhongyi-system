<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, List } from '@element-plus/icons-vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import WellnessDayDetail from '@/components/wellness/WellnessDayDetail.vue'
import { useUserStore } from '@/store/user'
import {
  formatShortDateLabel,
  groupHistoryByMonth,
  listHistoryLogs,
  loadCheckinPlans,
  loadDailyLogs,
  type DailyLog,
  type HistoryLogItem,
} from '@/utils/wellnessStorage'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const plans = ref(loadCheckinPlans())
const allLogs = ref<Record<string, DailyLog>>({})
const historyFilter = ref<'all' | 'full' | 'partial'>('all')
const expandedMonths = ref<Set<string>>(new Set())
const selectedDate = ref<string>('')

const userId = computed(() => userStore.userBrief?.userId)

const allHistory = computed(() => listHistoryLogs(allLogs.value, plans.value.length))

const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') return allHistory.value
  return allHistory.value.filter((item) => item.status === historyFilter.value)
})

const groupedHistory = computed(() => groupHistoryByMonth(filteredHistory.value))

const selectedItem = computed(() =>
  allHistory.value.find((item) => item.date === selectedDate.value) ?? null,
)

function reload() {
  plans.value = loadCheckinPlans(userId.value)
  allLogs.value = loadDailyLogs(userId.value)
  syncSelection()
}

function syncSelection() {
  const list = filteredHistory.value
  if (!list.length) {
    selectedDate.value = ''
    return
  }
  if (!list.some((item) => item.date === selectedDate.value)) {
    selectedDate.value = list[0].date
  }
}

function syncExpandedMonths() {
  const groups = groupedHistory.value
  if (!groups.length) {
    expandedMonths.value = new Set()
    return
  }
  const next = new Set(expandedMonths.value)
  const validKeys = new Set(groups.map((g) => g.key))
  for (const key of next) {
    if (!validKeys.has(key)) next.delete(key)
  }
  for (const group of groups) next.add(group.key)
  expandedMonths.value = next
}

function toggleMonth(key: string) {
  const next = new Set(expandedMonths.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedMonths.value = next
}

function selectItem(item: HistoryLogItem) {
  selectedDate.value = item.date
}

function goBack() {
  router.push('/wellness?tab=journal')
}

function goEdit(date: string) {
  router.push({ path: '/wellness', query: { tab: 'journal', date } })
}

onMounted(() => {
  reload()
  const q = route.query.date as string | undefined
  if (q) selectedDate.value = q
})

watch(userId, reload)
watch(historyFilter, () => {
  syncExpandedMonths()
  syncSelection()
})
watch(groupedHistory, syncExpandedMonths, { immediate: true })
watch(filteredHistory, syncSelection)
</script>

<template>
  <div class="history-page">
    <HomeHeader />

    <main class="history-main">
      <header class="page-head">
        <button type="button" class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回生活记录
        </button>
        <div>
          <h1>历史打卡</h1>
          <p>共 {{ allHistory.length }} 天有记录，点选日期查看详情</p>
        </div>
      </header>

      <div class="history-layout">
        <aside class="history-list-panel">
          <div class="list-toolbar">
            <span class="toolbar-title"><el-icon><List /></el-icon> 打卡日期</span>
            <el-radio-group v-model="historyFilter" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="full">完成</el-radio-button>
              <el-radio-button value="partial">部分</el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="!filteredHistory.length" class="list-empty">
            还没有历史打卡，先去生活记录里完成今日打卡吧
          </div>

          <div v-else class="history-groups">
            <section v-for="group in groupedHistory" :key="group.key" class="month-group">
              <button type="button" class="month-head" @click="toggleMonth(group.key)">
                <span class="month-title">{{ group.label }}</span>
                <span class="month-meta">{{ group.items.length }} 天</span>
                <span class="month-chevron">{{ expandedMonths.has(group.key) ? '▾' : '▸' }}</span>
              </button>

              <ul v-show="expandedMonths.has(group.key)" class="history-compact-list">
                <li
                  v-for="item in group.items"
                  :key="item.date"
                  class="history-row"
                  :class="{ active: item.date === selectedDate, full: item.status === 'full' }"
                  @click="selectItem(item)"
                >
                  <span class="row-date">{{ formatShortDateLabel(item.date) }}</span>
                  <div class="row-progress">
                    <div class="progress-track">
                      <div class="progress-fill" :style="{ width: `${item.checkinRate}%` }" />
                    </div>
                    <span class="row-rate">{{ item.checkinDone }}/{{ item.checkinTotal }}</span>
                  </div>
                  <span class="row-mood">{{ item.log.mood }}分</span>
                </li>
              </ul>
            </section>
          </div>
        </aside>

        <section class="history-detail-panel">
          <el-card v-if="selectedItem" shadow="never" class="detail-card">
            <WellnessDayDetail
              :log="selectedItem.log"
              :plans="plans"
              @edit="goEdit(selectedItem.date)"
            />
          </el-card>
          <div v-else class="detail-empty">
            <p>请选择左侧日期查看打卡详情</p>
            <el-button type="primary" @click="goBack">去生活记录打卡</el-button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f7f3eb;
}

.history-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #606266;
  font-size: 13px;
  flex-shrink: 0;
}

.back-btn:hover {
  border-color: #1a5f3f;
  color: #1a5f3f;
}

.page-head h1 {
  margin: 0 0 4px;
  font-size: 22px;
  color: #1a5f3f;
}

.page-head p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.history-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 16px;
  align-items: start;
}

@media (max-width: 860px) {
  .history-layout {
    grid-template-columns: 1fr;
  }
}

.history-list-panel,
.detail-card {
  border: 1px solid #e8e4dc;
  border-radius: 12px;
  background: #fff;
}

.history-list-panel {
  padding: 14px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.toolbar-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1a5f3f;
  font-size: 14px;
}

.list-empty,
.detail-empty {
  text-align: center;
  padding: 48px 20px;
  color: #909399;
  font-size: 14px;
}

.detail-empty p {
  margin: 0 0 16px;
}

.history-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.month-group {
  border: 1px solid #e8e4dc;
  border-radius: 10px;
  overflow: hidden;
}

.month-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: none;
  background: #f5f7fa;
  cursor: pointer;
  font-size: 13px;
}

.month-title {
  font-weight: 600;
  color: #303133;
}

.month-meta {
  flex: 1;
  color: #909399;
  text-align: right;
}

.month-chevron {
  color: #909399;
}

.history-compact-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history-row {
  display: grid;
  grid-template-columns: 80px 1fr 36px;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-top: 1px solid #f0ebe3;
  font-size: 13px;
}

.history-row:hover {
  background: #faf8f4;
}

.history-row.active {
  background: #e8f5ee;
}

.row-date {
  font-weight: 500;
}

.row-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: #eef2f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #67c23a;
}

.history-row:not(.full) .progress-fill {
  background: #e6a23c;
}

.row-rate,
.row-mood {
  font-size: 12px;
  color: #909399;
}

.detail-card {
  min-height: 360px;
  padding: 8px 4px;
}
</style>
