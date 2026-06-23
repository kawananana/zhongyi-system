<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

echarts.use([BarChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  option: EChartsCoreOption
  height?: string
}>()

const chartRef = ref<HTMLDivElement | null>(null)
const chart = shallowRef<echarts.ECharts | null>(null)
let resizeObserver: ResizeObserver | null = null

function ensureChart() {
  if (!chartRef.value) return
  if (!chart.value) {
    chart.value = echarts.init(chartRef.value)
  }
}

function render() {
  ensureChart()
  if (!chart.value) return
  chart.value.setOption(props.option, { notMerge: true })
  nextTick(() => chart.value?.resize())
}

function resize() {
  chart.value?.resize()
}

function scheduleResize() {
  nextTick(() => {
    resize()
    window.setTimeout(resize, 80)
    window.setTimeout(resize, 240)
  })
}

onMounted(() => {
  render()
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(chartRef.value)
  }
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', resize)
  chart.value?.dispose()
  chart.value = null
})

watch(() => props.option, render, { deep: true })

defineExpose({ resize: scheduleResize })
</script>

<template>
  <div ref="chartRef" class="admin-chart" :style="{ height: height || '360px' }" />
</template>

<style scoped>
.admin-chart {
  width: 100%;
  min-width: 0;
}
</style>
