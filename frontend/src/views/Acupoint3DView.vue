<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import HomeHeader from '@/components/home/HomeHeader.vue'
import AcupointScene from '@/components/acupoint/AcupointScene.vue'
import AcupointInfoPanel from '@/components/acupoint/AcupointInfoPanel.vue'
import AcupointMeridianRail from '@/components/acupoint/AcupointMeridianRail.vue'
import AcupointToolRail from '@/components/acupoint/AcupointToolRail.vue'
import AcupointBottomBar from '@/components/acupoint/AcupointBottomBar.vue'
import { fetchAcupointList, type AcupointItem } from '@/api/acupoint'
import { MERIDIAN_LIST } from '@/data/meridianRoutes'
import { matchRegion, parseCoord3d } from '@/utils/acupointMeta'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const loadPercent = ref(0)
const apiReady = ref(false)
const modelReady = ref(false)
const allPoints = ref<AcupointItem[]>([])
const activeMeridian = ref('手太阴肺经')
const region = ref('all')
const keyword = ref('')
const selectedId = ref<number | null>(null)
const showHelp = ref(false)
const showIntro = ref(false)
const showSearch = ref(false)
const showLabels = ref(true)
const skinTranslucent = ref(false)
const flowPlaying = ref(false)
const sceneRef = ref<InstanceType<typeof AcupointScene> | null>(null)

const meridianPoints = computed(() =>
  allPoints.value.filter((p) => p.meridian === activeMeridian.value),
)

const filteredPoints = computed(() => {
  const kw = keyword.value.trim()
  return meridianPoints.value.filter((p) => {
    if (!matchRegion(parseCoord3d(p.coord3d), region.value)) return false
    if (kw && !p.pointName.includes(kw) && !p.positionDesc.includes(kw)) return false
    return true
  })
})

const selectedPoint = computed(
  () => allPoints.value.find((p) => p.id === selectedId.value) ?? null,
)

function updateLoadOverlay() {
  const apiPart = apiReady.value ? 35 : 0
  const modelPart = modelReady.value ? 65 : 0
  loadPercent.value = Math.min(99, apiPart + modelPart)
  if (apiReady.value && modelReady.value) {
    loadPercent.value = 100
    loading.value = false
  }
}

function onModelProgress(p: number) {
  loadPercent.value = Math.max(loadPercent.value, Math.round(p * 0.65))
}

function onModelReady() {
  modelReady.value = true
  updateLoadOverlay()
}

async function loadPoints() {
  loading.value = true
  loadPercent.value = 0
  apiReady.value = false
  modelReady.value = false
  try {
    const data = await fetchAcupointList()
    allPoints.value = data ?? []
    const queryMeridian = String(route.query.meridian || '')
    if (queryMeridian && MERIDIAN_LIST.includes(queryMeridian)) {
      activeMeridian.value = queryMeridian
    } else if (!allPoints.value.some((p) => p.meridian === activeMeridian.value)) {
      activeMeridian.value = MERIDIAN_LIST[0]
    }
  } catch {
    allPoints.value = []
  } finally {
    apiReady.value = true
    updateLoadOverlay()
  }
}

function onSelectPoint(id: number) {
  selectedId.value = id
  sceneRef.value?.focusPoint(id)
}

function closePanel() {
  selectedId.value = null
}

function onSearch() {
  showSearch.value = true
  if (filteredPoints.value.length === 1) {
    onSelectPoint(filteredPoints.value[0].id)
  }
}

function onMeridianSelect(m: string) {
  activeMeridian.value = m
  selectedId.value = null
  flowPlaying.value = false
}

function toggleFlow() {
  flowPlaying.value = !flowPlaying.value
}

function goHome() {
  router.push('/')
}

function resetView() {
  sceneRef.value?.resetCamera()
  selectedId.value = null
  flowPlaying.value = false
}

onMounted(() => {
  if (!localStorage.getItem('bencao_acupoint_intro')) {
    showIntro.value = true
    localStorage.setItem('bencao_acupoint_intro', '1')
  }
  loadPoints()
})

watch(activeMeridian, () => {
  selectedId.value = null
  flowPlaying.value = false
})
</script>

<template>
  <div class="acupoint-page">
    <HomeHeader />

    <div class="demo-shell">
      <div v-if="loading" class="load-overlay">
        <img class="load-logo" src="/favicon.svg" alt="" />
        <p class="load-percent">{{ loadPercent }}%</p>
        <p class="load-tip">正在加载真人 3D 模型与经络穴位…</p>
      </div>

      <div class="watermark" aria-hidden="true">本草萌智 · 经络穴位</div>

      <AcupointToolRail
        :skin-translucent="skinTranslucent"
        @home="goHome"
        @reset="resetView"
        @help="showHelp = true"
        @intro="showIntro = true"
        @toggle-skin="skinTranslucent = !skinTranslucent"
      />

      <AcupointMeridianRail
        :active="activeMeridian"
        @select="onMeridianSelect"
        @search="showSearch = true"
      />

      <AcupointScene
        ref="sceneRef"
        class="scene-layer"
        :points="filteredPoints"
        :all-points="allPoints"
        :selected-id="selectedId"
        :active-meridian="activeMeridian"
        :show-labels="showLabels"
        :skin-translucent="skinTranslucent"
        :flow-playing="flowPlaying"
        @select="onSelectPoint"
        @load-progress="onModelProgress"
        @model-ready="onModelReady"
      />

      <AcupointBottomBar
        :meridian="activeMeridian"
        :points="meridianPoints"
        :selected-id="selectedId"
        :flow-playing="flowPlaying"
        @select="onSelectPoint"
        @play-flow="toggleFlow"
      />

      <AcupointInfoPanel
        :point="selectedPoint"
        :visible="!!selectedId"
        @close="closePanel"
      />

      <el-dialog v-model="showSearch" title="搜索穴位" width="420px" class="search-dialog">
        <el-input
          v-model="keyword"
          placeholder="输入穴位名，如：足三里、合谷"
          clearable
          @keyup.enter="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <template #footer>
          <el-button @click="showSearch = false">关闭</el-button>
          <el-button type="primary" @click="onSearch">定位</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="showHelp" title="3D 针灸使用说明" width="520px">
        <ul class="help-list">
          <li>左侧工具栏：解剖模式可半透明皮肤，便于观察经络走向</li>
          <li>右侧经络列表：切换不同经络，显示对应穴位与循行线</li>
          <li>底部穴位条：快速选穴；「循行动画」演示气血沿经络流动</li>
          <li>鼠标左键拖动旋转，滚轮缩放，右键平移</li>
          <li>点击穴位亮点或底部名称：查看定位与功效</li>
        </ul>
        <el-checkbox v-model="showLabels" label="显示穴位名称标签" />
        <p class="help-note">
          请在 Blender 中删除多余衣物物体，设置肤色材质后导出 GLB（勾选 Draco），覆盖
          <code>public/models/human-body.glb</code>。经络线由
          <code>meridiansData.ts</code> + 数据库穴位坐标绘制。
        </p>
      </el-dialog>

      <el-dialog v-model="showIntro" title="欢迎使用 3D 针灸" width="480px">
        <p>参考专业经络 3D 互动：真人模型、彩色经络线、穴位标签、循行动画与经络切换。点击穴位即可学习。</p>
        <template #footer>
          <el-button type="primary" @click="showIntro = false">开始体验</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.acupoint-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bc-bg);
}

.demo-shell {
  position: relative;
  flex: 1;
  min-height: calc(100vh - 64px);
  background: #f0ebe0;
  overflow: hidden;
}

.watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(48px, 12vw, 120px);
  font-family: 'Songti SC', 'SimSun', serif;
  color: rgba(139, 120, 90, 0.06);
  pointer-events: none;
  z-index: 1;
  user-select: none;
}

.load-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0ebe0;
  gap: 12px;
}

.load-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
}

.load-percent {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #3d3830;
}

.load-tip {
  margin: 0;
  font-size: 14px;
  color: #888;
}

@keyframes pulse {
  50% {
    opacity: 0.65;
    transform: scale(0.96);
  }
}

.scene-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.help-list {
  margin: 0 0 16px;
  padding-left: 20px;
  line-height: 1.8;
  color: var(--bc-text-secondary);
}

.help-note {
  margin: 12px 0 0;
  font-size: 12px;
  color: var(--bc-text-muted);
  line-height: 1.6;
}

.help-note code {
  font-size: 11px;
}

@media (max-width: 900px) {
  .watermark {
    display: none;
  }
}
</style>
