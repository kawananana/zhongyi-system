<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { fetchDashboardOverview, type DashboardOverview } from '@/api/admin'
import AdminChart from '@/components/admin/AdminChart.vue'
import type { EChartsCoreOption } from 'echarts/core'
import type { ComponentPublicInstance } from 'vue'

const CHART_COLORS = ['#1a5f3f', '#2d8a5e', '#c45c26', '#e6a23c', '#409eff', '#9b59b6', '#67c23a', '#909399']

const loading = ref(true)
const error = ref('')
const data = ref<DashboardOverview | null>(null)
const activeTab = ref('content')
const chartRefs = ref<ComponentPublicInstance[]>([])

function setChartRef(el: Element | ComponentPublicInstance | null) {
  if (el && '$' in (el as ComponentPublicInstance)) {
    const inst = el as ComponentPublicInstance
    if (!chartRefs.value.includes(inst)) {
      chartRefs.value.push(inst)
    }
  }
}

function resizeCharts() {
  nextTick(() => {
    chartRefs.value.forEach((inst) => {
      const exposed = inst as ComponentPublicInstance & { resize?: () => void }
      exposed.resize?.()
    })
  })
}

onMounted(async () => {
  try {
    data.value = await fetchDashboardOverview()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
    resizeCharts()
  }
})

watch(activeTab, () => resizeCharts())

const content = computed(() => data.value?.content)

function pieLegendOption() {
  return {
    type: 'scroll' as const,
    orient: 'vertical' as const,
    right: 8,
    top: 'middle',
    height: '85%',
    textStyle: { fontSize: 12 },
  }
}

function pieSeriesOption(data: { name: string; value: number }[]) {
  return [{
    type: 'pie' as const,
    radius: ['42%', '70%'],
    center: ['36%', '50%'],
    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    labelLine: { show: false },
    emphasis: {
      label: { show: true, fontSize: 13, fontWeight: 500 },
      labelLine: { show: true },
    },
    data,
  }]
}

const contentPieOption = computed<EChartsCoreOption>(() => {
  const c = content.value
  if (!c) return {}
  return {
    color: CHART_COLORS,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: pieLegendOption(),
    series: pieSeriesOption([
      { name: '药材图鉴', value: c.herbCount },
      { name: '百科文章', value: c.articleCount },
      { name: '百科课程', value: c.courseCount },
      { name: '药膳食疗', value: c.recipeCount },
      { name: '市集商品', value: c.productCount },
      { name: '论坛帖子', value: c.forumPostCount },
    ].filter((i) => i.value > 0)),
  }
})

const engagementBarOption = computed<EChartsCoreOption>(() => {
  const c = content.value
  if (!c) return {}
  const labels = ['图鉴浏览', '图鉴收藏', '百科浏览', '课程浏览', '药膳浏览', '市集销量']
  const values = [c.herbViews, c.herbCollects, c.articleViews, c.courseViews, c.recipeViews, c.productSales]
  return {
    color: ['#1a5f3f'],
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 16, top: 24, bottom: 48 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { rotate: 20, fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      data: values,
      barMaxWidth: 40,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  }
})

const moduleBarOption = computed<EChartsCoreOption>(() => {
  const metrics = data.value?.moduleMetrics || []
  return {
    color: ['#2d8a5e', '#c45c26'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 4 },
    grid: { left: 48, right: 56, top: 48, bottom: 72 },
    xAxis: {
      type: 'category',
      data: metrics.map((m) => m.module),
      axisLabel: { interval: 0, rotate: 28, fontSize: 12, margin: 14 },
    },
    yAxis: [
      {
        type: 'value',
        name: '内容条数',
        minInterval: 1,
        nameTextStyle: { fontSize: 12 },
      },
      {
        type: 'value',
        name: '浏览/销量',
        minInterval: 1,
        splitLine: { show: false },
        nameTextStyle: { fontSize: 12 },
      },
    ],
    series: [
      {
        name: '内容条数',
        type: 'bar',
        yAxisIndex: 0,
        data: metrics.map((m) => m.itemCount),
        barMaxWidth: 32,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '浏览/销量',
        type: 'bar',
        yAxisIndex: 1,
        data: metrics.map((m) => m.viewCount),
        barMaxWidth: 32,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  }
})

const topHerbBarOption = computed<EChartsCoreOption>(() => {
  const items = [...(data.value?.topHerbs || [])].reverse()
  return {
    color: ['#1a5f3f'],
    tooltip: { trigger: 'axis' },
    grid: { left: 100, right: 24, top: 16, bottom: 24 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: {
      type: 'category',
      data: items.map((i) => i.title),
      axisLabel: { width: 90, overflow: 'truncate' },
    },
    series: [{
      type: 'bar',
      data: items.map((i) => i.viewCount),
      barMaxWidth: 18,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    }],
  }
})

const userPieOption = computed<EChartsCoreOption>(() => {
  const u = data.value?.userBehavior
  if (!u) return {}
  return {
    color: ['#67c23a', '#409eff', '#e6a23c'],
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: pieLegendOption(),
    series: pieSeriesOption([
      { name: '活跃用户(30日)', value: u.activeUsers },
      { name: '低频用户', value: u.lowFreqUsers },
      { name: '新用户(7日)', value: u.newUsers },
    ].filter((i) => i.value > 0)),
  }
})

function categoryPieOption(items: { label: string; count: number }[]): EChartsCoreOption {
  return {
    color: CHART_COLORS,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: pieLegendOption(),
    series: pieSeriesOption(items.map((i) => ({ name: i.label, value: i.count }))),
  }
}

const wikiPieOption = computed(() => categoryPieOption(data.value?.wikiByCategory || []))
const coursePieOption = computed(() => categoryPieOption(data.value?.courseByCategory || []))
const productPieOption = computed(() => categoryPieOption(data.value?.productByCategory || []))

const topProductBarOption = computed<EChartsCoreOption>(() => {
  const items = [...(data.value?.topProducts || [])].reverse()
  return {
    color: ['#c45c26'],
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 24, top: 16, bottom: 24 },
    xAxis: { type: 'value', minInterval: 1 },
    yAxis: {
      type: 'category',
      data: items.map((i) => i.title),
      axisLabel: { width: 110, overflow: 'truncate' },
    },
    series: [{
      name: '本站销量',
      type: 'bar',
      data: items.map((i) => i.viewCount),
      barMaxWidth: 18,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
    }],
  }
})

function exportCsv() {
  if (!data.value) return
  const c = data.value.content
  const rows = [
    ['指标', '数值'],
    ['药材图鉴(上架)', String(c.herbCount)],
    ['百科文章', String(c.articleCount)],
    ['百科课程', String(c.courseCount)],
    ['药膳食疗', String(c.recipeCount)],
    ['市集商品', String(c.productCount)],
    ['论坛帖子', String(c.forumPostCount)],
    ['待审帖子', String(c.forumPendingAudit)],
    ['针灸穴位', String(c.acupointCount)],
    ['图鉴站内浏览', String(c.herbViews)],
    ['图鉴收藏量', String(c.herbCollects)],
    ['百科站内浏览', String(c.articleViews)],
    ['课程站内浏览', String(c.courseViews)],
    ['药膳站内浏览', String(c.recipeViews)],
    ['市集本站销量', String(c.productSales)],
  ]
  const csv = rows.map((r) => r.map((x) => `"${x}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = '平台内容统计.csv'
  a.click()
}
</script>

<template>
  <div v-loading="loading" class="dashboard">
    <div class="dash-header">
      <h2>数据看板</h2>
      <el-button type="primary" plain :disabled="!data" @click="exportCsv">导出内容报表</el-button>
    </div>

    <el-alert v-if="error" type="error" :title="error" show-icon style="margin-bottom: 12px" />

    <el-tabs v-if="data" v-model="activeTab">
      <el-tab-pane label="内容总览" name="content" lazy>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="8" :md="6" v-for="item in [
            { label: '药材图鉴', val: content?.herbCount },
            { label: '百科文章', val: content?.articleCount },
            { label: '百科课程', val: content?.courseCount },
            { label: '药膳食疗', val: content?.recipeCount },
            { label: '市集商品', val: content?.productCount },
            { label: '论坛帖子', val: content?.forumPostCount },
            { label: '待审帖子', val: content?.forumPendingAudit },
            { label: '针灸穴位', val: content?.acupointCount },
          ]" :key="item.label">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-val">{{ item.val ?? 0 }}</div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>平台内容结构</template>
              <AdminChart :ref="setChartRef" :option="contentPieOption" height="380px" />
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>站内互动指标</template>
              <AdminChart :ref="setChartRef" :option="engagementBarOption" height="380px" />
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :md="12">
            <el-card shadow="never">
              <template #header>热门药材（按站内浏览）</template>
              <AdminChart :ref="setChartRef" :option="topHerbBarOption" height="320px" />
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card shadow="never">
              <template #header>热门百科文章（按站内浏览）</template>
              <el-table :data="data.topArticles" size="small" stripe empty-text="暂无数据" max-height="280">
                <el-table-column prop="title" label="文章" show-overflow-tooltip />
                <el-table-column prop="viewCount" label="浏览量" width="100" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="模块数据" name="module" lazy>
        <el-card shadow="never" class="chart-card">
          <template #header>各模块内容条数 vs 浏览/销量</template>
          <AdminChart :ref="setChartRef" :option="moduleBarOption" height="420px" />
          <p class="hint">3D 针灸暂无浏览埋点；市集模块显示本站销量合计。</p>
        </el-card>

        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :md="12">
            <el-card shadow="never">
              <template #header>热门课程（按站内浏览）</template>
              <el-table :data="data.topCourses" size="small" stripe empty-text="暂无数据">
                <el-table-column prop="title" label="课程" show-overflow-tooltip />
                <el-table-column prop="viewCount" label="浏览量" width="100" />
              </el-table>
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card shadow="never">
              <template #header>热门药膳（按站内浏览）</template>
              <el-table :data="data.topRecipes" size="small" stripe empty-text="暂无数据">
                <el-table-column prop="title" label="食谱" show-overflow-tooltip />
                <el-table-column prop="viewCount" label="浏览量" width="100" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>市集商品分类分布</template>
              <AdminChart :ref="setChartRef" :option="productPieOption" height="400px" />
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card shadow="never">
              <template #header>市集热销商品（按本站销量）</template>
              <AdminChart :ref="setChartRef" :option="topProductBarOption" height="400px" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="用户&学习" name="user" lazy>
        <el-row :gutter="16">
          <el-col :span="6"><el-statistic title="注册用户" :value="data.userBehavior.totalUsers" /></el-col>
          <el-col :span="6"><el-statistic title="新用户(7日)" :value="data.userBehavior.newUsers" /></el-col>
          <el-col :span="6"><el-statistic title="活跃(30日登录)" :value="data.userBehavior.activeUsers" /></el-col>
          <el-col :span="6"><el-statistic title="低频用户" :value="data.userBehavior.lowFreqUsers" /></el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :span="8"><el-statistic title="题库题目数" :value="data.learning.quizCount" /></el-col>
          <el-col :span="8"><el-statistic title="药匣收藏次数" :value="data.learning.favoriteCount" /></el-col>
          <el-col :span="8"><el-statistic title="收藏用户数" :value="data.learning.favoriteUsers" /></el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :span="24">
            <el-card shadow="never" class="chart-card">
              <template #header>用户活跃结构</template>
              <AdminChart :ref="setChartRef" :option="userPieOption" height="340px" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>百科文章 · 分类分布</template>
              <AdminChart :ref="setChartRef" :option="wikiPieOption" height="400px" />
            </el-card>
          </el-col>
          <el-col :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>百科课程 · 分类分布</template>
              <AdminChart :ref="setChartRef" :option="coursePieOption" height="400px" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.dashboard { min-height: 400px; }
.dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dash-header h2 { margin: 0; font-size: 20px; color: #1a5f3f; }
.stat-card { text-align: center; margin-bottom: 12px; }
.stat-label { font-size: 13px; color: #909399; }
.stat-val { font-size: 22px; font-weight: 600; color: #1a5f3f; margin-top: 6px; }
.chart-card :deep(.el-card__body) {
  padding: 12px 16px 16px;
  overflow: visible;
}
.hint { margin: 12px 0 0; font-size: 12px; color: #909399; }
</style>
