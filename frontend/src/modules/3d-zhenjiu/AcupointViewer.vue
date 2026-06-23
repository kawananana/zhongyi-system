<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { fetchAcupoints } from './api/acupoints.js'
import { BODY_PART_OPTIONS, getBodyPartCamera } from './config/bodyPartViews.js'
import { snapAcupointQuick } from './utils/acupointSurface.js'

const props = defineProps({
  /** 嵌入到大作业项目时可传入 API 根路径，如 https://api.example.com/api/acupoints */
  apiBase: { type: String, default: '' },
  /** 模型资源路径前缀，默认 /models/ */
  modelPath: { type: String, default: '/models/' },
})

const router = useRouter()

const containerRef = ref(null)
const selectedBodyPart = ref('全部')
const loading = ref(true)
const loadError = ref('')
const sceneReady = ref(false)
const loadingProgress = ref(0)
const loadingMessage = ref('正在初始化…')
const acupointList = ref([])

const infoCardVisible = ref(false)
const infoCard = ref({ title: '', description: '', typeLabel: '' })

const GEOMETRY = {
  ACUPOINT_RADIUS: 0.004,
  ACUPOINT_SEGMENTS: 16,
  ACUPOINT_GLOW_SCALE: 1.8,
  ACUPOINT_HALO_SCALE: 2.4,
}

let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null
let model = null
let modelSize = null
let raycaster = null
let mouse = null
let cameraTween = null
let modelReady = false
let acupointsReady = false

const acupointMeshMap = new Map()

function setLoadingProgress(value, message) {
  loadingProgress.value = Math.min(100, Math.max(0, Math.round(value)))
  if (message) loadingMessage.value = message
}

function getAcupointById(id) {
  return acupointList.value.find((item) => item.id === id)
}

function hideInfoCard() {
  infoCardVisible.value = false
}

function goAcupunctureLearn() {
  router.push({ path: '/atlas/articles', query: { category: 'acupuncture' } })
}

function goThermosensitiveMoxibustionLearn() {
  router.push({ path: '/atlas/articles', query: { category: 'thermosensitive_moxibustion' } })
}

function showAcupointInfo(acupointId) {
  const acupoint = getAcupointById(acupointId)
  if (!acupoint) return

  infoCard.value = {
    title: acupoint.name,
    description: acupoint.description || '暂无介绍',
    typeLabel: acupoint.bodyPart || '穴位',
  }
  infoCardVisible.value = true
}

function getAcupointIdFromObject(object) {
  let current = object
  while (current) {
    if (current.userData.acupointId) return current.userData.acupointId
    current = current.parent
  }
  return null
}

function createAcupointMarkerParts(color) {
  const threeColor = new THREE.Color(color)
  const segments = GEOMETRY.ACUPOINT_SEGMENTS

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(GEOMETRY.ACUPOINT_RADIUS, segments, segments),
    new THREE.MeshBasicMaterial({ color: threeColor, depthTest: true, depthWrite: true })
  )

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(GEOMETRY.ACUPOINT_RADIUS * GEOMETRY.ACUPOINT_GLOW_SCALE, 16, 16),
    new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    })
  )

  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(GEOMETRY.ACUPOINT_RADIUS * GEOMETRY.ACUPOINT_HALO_SCALE, 12, 12),
    new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    })
  )

  return { core, glow, outerGlow }
}

function disposeAcupointMarker(marker) {
  marker.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) child.material.dispose()
  })
}

function createAcupointMesh(acupoint) {
  const pos = { x: acupoint.x, y: acupoint.y, z: acupoint.z }
  const group = new THREE.Group()
  const parts = createAcupointMarkerParts(acupoint.color || '#409eff')
  group.add(parts.outerGlow, parts.glow, parts.core)
  group.userData.acupointId = acupoint.id
  group.userData.bodyPart = acupoint.bodyPart
  group.userData.markerParts = parts

  if ((acupoint.bodyPart === '下肢' || acupoint.bodyPart === '背部' || acupoint.bodyPart === '上肢') && model) {
    model.updateMatrixWorld(true)
    const localPos = new THREE.Vector3(pos.x, pos.y, pos.z)
    model.worldToLocal(localPos)
    group.position.copy(localPos)
    model.add(group)
  } else {
    group.position.set(pos.x, pos.y, pos.z)
    scene.add(group)
  }

  return group
}

function clearAcupointMeshes() {
  acupointMeshMap.forEach((mesh) => {
    mesh.parent?.remove(mesh)
    disposeAcupointMarker(mesh)
  })
  acupointMeshMap.clear()
}

function resolveAcupointPosition(acupoint) {
  return { x: acupoint.x, y: acupoint.y, z: acupoint.z }
}

function snapAcupointPosition(acupoint) {
  if (!model || !raycaster) {
    return resolveAcupointPosition(acupoint)
  }

  if (
    acupoint.bodyPart === '下肢' ||
    acupoint.bodyPart === '背部' ||
    acupoint.bodyPart === '上肢'
  ) {
    return resolveAcupointPosition(acupoint)
  }

  if (acupoint.bodyPart !== '胸腹') {
    return resolveAcupointPosition(acupoint)
  }

  model.updateMatrixWorld(true)
  const surface = acupoint.surface || 'front'
  const snapped = snapAcupointQuick(model, raycaster, acupoint.x, acupoint.y, surface)
  return snapped || resolveAcupointPosition(acupoint)
}

function applySurfaceSnapToMeshes() {
  return new Promise((resolve) => {
    if (!model || !raycaster) {
      resolve()
      return
    }

    model.updateMatrixWorld(true)
    const torsoPoints = acupointList.value.filter((item) => item.bodyPart === '胸腹')
    if (!torsoPoints.length) {
      resolve()
      return
    }

    let index = 0
    const batchSize = 15

    const processBatch = () => {
      const batch = torsoPoints.slice(index, index + batchSize)
      index += batchSize

      batch.forEach((acupoint) => {
        const mesh = acupointMeshMap.get(acupoint.id)
        if (!mesh) return
        const pos = snapAcupointPosition(acupoint)
        mesh.position.set(pos.x, pos.y, pos.z)
      })

      const snapProgress = 88 + Math.min(10, (index / torsoPoints.length) * 10)
      setLoadingProgress(snapProgress, `正在标注穴位 ${Math.min(index, torsoPoints.length)}/${torsoPoints.length}`)

      if (index < torsoPoints.length) {
        requestAnimationFrame(processBatch)
      } else {
        resolve()
      }
    }

    processBatch()
  })
}

function syncAcupointMeshes({ hidden = false } = {}) {
  if (!scene || !model) return
  clearAcupointMeshes()
  acupointList.value.forEach((acupoint) => {
    const mesh = createAcupointMesh(acupoint)
    mesh.visible = !hidden
    acupointMeshMap.set(acupoint.id, mesh)
  })
  if (!hidden) {
    applyBodyPartFilter(selectedBodyPart.value)
  }
}

async function finalizeScene() {
  if (!modelReady || !acupointsReady || sceneReady.value) return

  setLoadingProgress(86, `正在标注穴位 0/${acupointList.value.length}`)
  syncAcupointMeshes({ hidden: true })

  await Promise.race([
    applySurfaceSnapToMeshes(),
    new Promise((resolve) => setTimeout(resolve, 12000)),
  ])

  if (model) model.visible = true
  applyBodyPartFilter(selectedBodyPart.value)
  focusCameraOnBodyPart(selectedBodyPart.value)

  setLoadingProgress(100, '加载完成')
  sceneReady.value = true
  loading.value = false
}

function trySyncScene() {
  if (modelReady && acupointsReady) {
    finalizeScene()
  }
}

function applyBodyPartFilter(part) {
  acupointMeshMap.forEach((mesh, id) => {
    const acupoint = getAcupointById(id)
    if (!acupoint) return
    mesh.visible = part === '全部' || acupoint.bodyPart === part
  })
}

function focusCameraOnBodyPart(part) {
  if (!camera || !controls || !modelSize) return

  const view = getBodyPartCamera(part, modelSize)
  cameraTween = {
    start: performance.now(),
    duration: 700,
    fromPos: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPos: new THREE.Vector3(...view.position),
    toTarget: new THREE.Vector3(...view.target),
  }
}

function updateCameraTween(now) {
  if (!cameraTween || !controls) return

  const t = Math.min(1, (now - cameraTween.start) / cameraTween.duration)
  const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

  camera.position.lerpVectors(cameraTween.fromPos, cameraTween.toPos, eased)
  controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased)
  controls.update()

  if (t >= 1) cameraTween = null
}

function applyStandardMaterials(object) {
  object.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const oldMaterial = child.material
    const color = oldMaterial.color
      ? oldMaterial.color.clone()
      : new THREE.Color(0xd4a574)
    color.lerp(new THREE.Color(0xffffff), 0.35)
    child.material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: 0.05,
    })
    if (oldMaterial.map) oldMaterial.map.dispose()
    oldMaterial.dispose()
  })
}

function fitModelToView(object) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  object.position.sub(center)
  object.updateMatrixWorld(true)
  modelSize = size.clone()

  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = camera.fov * (Math.PI / 180)
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.3

  camera.position.set(0, size.y * 0.12, cameraZ)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  controls.update()
}

function loadModel() {
  const base = props.modelPath.endsWith('/') ? props.modelPath : `${props.modelPath}/`
  const mtlLoader = new MTLLoader()
  mtlLoader.setPath(base)
  mtlLoader.setResourcePath(base)

  setLoadingProgress(18, '正在加载模型材质…')

  mtlLoader.load(
    '3d1.mtl',
    (materials) => {
      materials.preload()
      setLoadingProgress(22, '正在加载人体模型…')

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.setPath(base)
      objLoader.load(
        '3d1.obj',
        (object) => {
          model = object
          applyStandardMaterials(model)
          model.visible = false
          scene.add(model)
          fitModelToView(model)
          modelReady = true
          setLoadingProgress(85, '人体模型加载完成，正在标注穴位…')
          trySyncScene()
        },
        (xhr) => {
          if (xhr.lengthComputable && xhr.total > 0) {
            const ratio = xhr.loaded / xhr.total
            setLoadingProgress(22 + ratio * 62, `正在加载人体模型 ${Math.round(ratio * 100)}%`)
          }
        },
        (error) => {
          console.error('OBJ 加载失败:', error)
          loadError.value = '人体模型加载失败，请检查 /models/3d1.obj 是否可访问'
          loading.value = false
          ElMessage.error(loadError.value)
        }
      )
    },
    undefined,
    (error) => {
      console.error('MTL 加载失败:', error)
      loadError.value = '人体模型材质加载失败，请检查 /models/3d1.mtl 是否可访问'
      loading.value = false
      ElMessage.error(loadError.value)
    }
  )
}

function updateMouseFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function onCanvasClick(event) {
  if (!sceneReady.value || !raycaster || !camera) return
  updateMouseFromEvent(event)
  raycaster.setFromCamera(mouse, camera)

  const visibleMarkers = Array.from(acupointMeshMap.values()).filter((m) => m.visible)
  const intersections = raycaster.intersectObjects(visibleMarkers, true)

  if (intersections.length > 0) {
    const acupointId = getAcupointIdFromObject(intersections[0].object)
    if (acupointId) {
      showAcupointInfo(acupointId)
      return
    }
  }

  hideInfoCard()
}

function updateAcupointGlowPulse(time) {
  const pulse = 0.82 + 0.18 * Math.sin(time * 3)
  acupointMeshMap.forEach((marker) => {
    if (!marker.visible) return
    const { glow, outerGlow } = marker.userData.markerParts || {}
    if (glow?.material) glow.material.opacity = 0.45 * pulse
    if (outerGlow?.material) outerGlow.material.opacity = 0.2 * pulse
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  updateCameraTween(performance.now())
  controls?.update()
  if (sceneReady.value) {
    updateAcupointGlowPulse(performance.now() * 0.001)
  }
  renderer?.render(scene, camera)
}

let resizeObserver = null

function getContainerSize() {
  const container = containerRef.value
  if (!container) return { width: 1, height: 1 }
  const width = container.clientWidth || window.innerWidth
  const height = container.clientHeight || Math.max(window.innerHeight - 64, 480)
  return {
    width: Math.max(width, 1),
    height: Math.max(height, 1),
  }
}

function resizeRenderer() {
  if (!containerRef.value || !camera || !renderer) return
  const { width, height } = getContainerSize()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

async function loadAcupoints() {
  const maxAttempts = 5
  let lastError = null

  setLoadingProgress(2, '正在加载穴位数据…')

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      acupointList.value = await fetchAcupoints(props.apiBase || undefined)
      if (!Array.isArray(acupointList.value)) {
        throw new Error('穴位数据格式异常')
      }
      acupointsReady = true
      setLoadingProgress(15, `穴位数据已加载（${acupointList.value.length} 个）`)
      trySyncScene()
      return
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        setLoadingProgress(2 + attempt * 2, `正在重试加载穴位… (${attempt}/${maxAttempts})`)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
    }
  }

  try {
    const response = await fetch('/data/acupoints.json')
    if (!response.ok) throw new Error('静态穴位数据不可用')
    acupointList.value = await response.json()
    if (!Array.isArray(acupointList.value) || !acupointList.value.length) {
      throw new Error('静态穴位数据为空')
    }
    acupointsReady = true
    setLoadingProgress(15, `穴位数据已加载（${acupointList.value.length} 个，离线）`)
    trySyncScene()
    return
  } catch (fallbackError) {
    lastError = fallbackError
  }

  loadError.value = lastError?.message || '加载穴位失败，请确认 3D 服务已启动（cd 3d-zhenjiu && npm run start）'
  loading.value = false
  ElMessage.error(loadError.value)
}

function init() {
  const container = containerRef.value
  if (!container) return

  const { width, height } = getContainerSize()
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 1, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.75))
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
  keyLight.position.set(3, 5, 4)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
  fillLight.position.set(-2, 3, -5)
  scene.add(fillLight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  renderer.domElement.addEventListener('click', onCanvasClick)
  window.addEventListener('resize', resizeRenderer)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resizeRenderer())
    resizeObserver.observe(container)
  }

  loadModel()
  animate()
}

function cleanup() {
  window.removeEventListener('resize', resizeRenderer)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('click', onCanvasClick)
  }
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  clearAcupointMeshes()
  if (model) {
    scene?.remove(model)
    model.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
    model = null
  }
  controls?.dispose()
  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  scene = null
  camera = null
  renderer = null
  controls = null
}

watch(selectedBodyPart, (part) => {
  if (!sceneReady.value) return
  applyBodyPartFilter(part)
  focusCameraOnBodyPart(part)
  hideInfoCard()
})

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    init()
    resizeRenderer()
    void loadAcupoints()
  })
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="viewer-root">
    <div v-show="sceneReady" class="viewer-toolbar">
      <label class="toolbar-label" for="body-part-select">部位</label>
      <el-select
        id="body-part-select"
        v-model="selectedBodyPart"
        class="body-part-select"
        teleported
        placement="bottom-start"
        :popper-options="{ strategy: 'fixed' }"
      >
        <el-option
          v-for="part in BODY_PART_OPTIONS"
          :key="part"
          :label="part"
          :value="part"
        />
      </el-select>
      <span class="toolbar-hint">点击穴位查看名称与功效</span>
    </div>

    <div v-show="sceneReady" class="viewer-entries">
      <button type="button" class="entry-link" @click="goAcupunctureLearn">
        进入针灸知识学习
      </button>
      <button type="button" class="entry-link" @click="goThermosensitiveMoxibustionLearn">
        进入热敏灸知识学习
      </button>
    </div>

    <div ref="containerRef" class="viewer-canvas" :class="{ ready: sceneReady }" />

    <div v-if="loadError && !loading" class="viewer-error">
      <div class="error-panel">
        <p class="error-title">3D 场景加载失败</p>
        <p class="error-message">{{ loadError }}</p>
        <p class="error-hint">请先在项目根目录运行：<code>cd 3d-zhenjiu && npm run start</code>，或使用 <code>cd frontend && npm run dev:all</code></p>
      </div>
    </div>

    <div v-if="loading" class="viewer-loading">
      <div class="loading-panel">
        <p class="loading-title">{{ loadingMessage }}</p>
        <el-progress
          :percentage="loadingProgress"
          :stroke-width="10"
          :show-text="true"
          striped
          striped-flow
        />
      </div>
    </div>

    <transition name="info-card-fade">
      <el-card v-show="infoCardVisible" class="info-card" shadow="always">
        <template #header>
          <div class="info-card-header">
            <span class="info-card-title">{{ infoCard.title }}</span>
            <el-tag size="small" type="info">{{ infoCard.typeLabel }}</el-tag>
          </div>
        </template>
        <div class="info-card-body">{{ infoCard.description }}</div>
      </el-card>
    </transition>
  </div>
</template>

<style scoped>
.viewer-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f0f0f0;
}

.viewer-toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px);
  max-width: calc(100% - 32px);
}

.viewer-entries {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(320px, calc(100% - 32px));
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(6px);
}

.entry-link {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  background: #f5faff;
  color: #409eff;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.entry-link:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.toolbar-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.body-part-select {
  width: 120px;
}

.toolbar-hint {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.viewer-canvas.ready {
  opacity: 1;
}

.viewer-canvas :deep(canvas) {
  display: block;
}

.viewer-error {
  position: absolute;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #606266;
}

.error-panel {
  width: min(480px, calc(100% - 48px));
  padding: 28px 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.error-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.error-message {
  margin: 0 0 12px;
  line-height: 1.7;
}

.error-hint {
  margin: 0;
  font-size: 13px;
  color: #909399;
  line-height: 1.7;
}

.error-hint code {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f5f7fa;
  color: #303133;
}

.viewer-loading {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #606266;
}

.loading-panel {
  width: min(420px, calc(100% - 48px));
  padding: 28px 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.loading-title {
  margin: 0 0 16px;
  font-size: 15px;
  color: #303133;
  text-align: center;
}

.loading-panel :deep(.el-progress__text) {
  font-size: 13px !important;
}

.info-card {
  position: absolute;
  top: 72px;
  right: 24px;
  width: min(380px, calc(100% - 48px));
  max-height: calc(100% - 96px);
  z-index: 10;
  border: none;
}

.info-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.info-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-card-body {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 360px;
  overflow-y: auto;
}

.info-card-fade-enter-active,
.info-card-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.info-card-fade-enter-from,
.info-card-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .toolbar-hint {
    display: none;
  }

  .info-card {
    right: 12px;
    left: 12px;
    width: auto;
  }
}
</style>
