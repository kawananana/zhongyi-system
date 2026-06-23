<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import {
  createAcupoint as createAcupointApi,
  deleteAcupoint as deleteAcupointApi,
  fetchAcupoints,
  updateAcupoint as updateAcupointApi,
} from './api/acupoints.js'
import { snapAcupointQuick } from './utils/acupointSurface.js'

const containerRef = ref(null)

const acupointList = ref([])
const meridianList = ref([])
const interactionMode = ref('point')
const currentMeridianId = ref(null)

const dialogVisible = ref(false)
const meridianDialogVisible = ref(false)
const currentPointCoords = ref(null)
const editingAcupointId = ref(null)
const editingMeridianId = ref(null)
const wireframeClipMode = ref('off')
const rulerVisible = ref(false)
const rulerLengthCun = ref(3)
const rulerLengthOptions = [1, 3, 5, 10, 15]
const rulerPlacementActive = ref(false)
const rulerOrientation = ref('vertical')
const rulerRotationDeg = ref(0)
const rulerAnchor = ref({ x: 0, y: 0, z: 0 })
const rulerSurfaceNormal = ref({ x: 0, y: 1, z: 0 })
const cunUnitLength = ref(null)
const newPointForm = ref({ name: '', bodyPart: '', description: '', color: '#409eff' })
const newMeridianForm = ref({ name: '', color: '#e74c3c', description: '' })
const meridianEditForm = ref({ name: '', color: '#e74c3c', description: '' })

const infoCardVisible = ref(false)
const infoCard = ref({
  title: '',
  description: '',
  type: '',
  typeLabel: '',
})

const interactionModeOptions = [
  { label: '打点模式', value: 'point' },
  { label: '建脉模式', value: 'meridian' },
  { label: '科普浏览', value: 'browse' },
]

const bodyPartOptions = ['头部', '胸腹', '上肢', '下肢', '背部', '全身']

const wireframeClipOptions = [
  { label: '关闭线框', value: 'off' },
  { label: '仅头部线框', value: 'head' },
  { label: '仅躯干线框', value: 'torso' },
  { label: '仅四肢线框', value: 'limbs' },
]

// 裁剪平面常量（可按模型实际比例微调）
const CLIP = {
  HEAD_Y_MIN: 1.45,
  TORSO_Y_MIN: 0.8,
  ARM_X_MIN: 0.25,
}

// 穴位与经络几何尺寸
const GEOMETRY = {
  ACUPOINT_RADIUS: 0.004,
  ACUPOINT_SEGMENTS: 16,
  ACUPOINT_GLOW_SCALE: 1.8,
  ACUPOINT_HALO_SCALE: 2.4,
  MERIDIAN_TUBE_RADIUS: 0.002,
}

// 骨度分寸尺（成人竖向身长 ≈ 75 寸）
const RULER_CONFIG = {
  BODY_CUN_COUNT: 75,
  FIXED_OFFSET_X: 0.08,
  FIXED_OFFSET_Z: 0.06,
  SURFACE_OFFSET: 0.003,
  SURFACE_PROBE_DIST: 0.15,
  ANCHOR_RADIUS: 0.006,
}

let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null
let model = null
let wireframeModel = null
let rulerGroup = null
let modelSize = null
let rulerAnchorInitialized = false
let isDraggingRuler = false
let raycaster = null
let mouse = null

const acupointMeshMap = new Map()
const meridianTubeMap = new Map()

let previewMesh = null
let localAxesHelper = null
let editSnapshot = null
let meridianEditSnapshot = null
let highlightedMeridianId = null

function getMeridianById(id) {
  return meridianList.value.find((item) => item.id === id)
}

function hideInfoCard() {
  infoCardVisible.value = false
  resetMeridianHighlight()
}

function showAcupointInfo(acupointId) {
  const acupoint = getAcupointById(acupointId)
  if (!acupoint) return

  resetMeridianHighlight()
  infoCard.value = {
    title: acupoint.name,
    description: acupoint.description || '暂无介绍',
    type: 'acupoint',
    typeLabel: acupoint.bodyPart || '穴位',
  }
  infoCardVisible.value = true
}

function showMeridianInfo(meridianId) {
  const meridian = getMeridianById(meridianId)
  if (!meridian) return

  highlightMeridian(meridianId)
  infoCard.value = {
    title: meridian.name,
    description: meridian.description || '暂无介绍',
    type: 'meridian',
    typeLabel: '经络',
  }
  infoCardVisible.value = true
}

function highlightMeridian(meridianId) {
  resetMeridianHighlight()
  highlightedMeridianId = meridianId

  meridianTubeMap.forEach((tube, id) => {
    const meridian = getMeridianById(id)
    if (!meridian) return

    if (id === meridianId) {
      tube.material.color.set(meridian.color)
      tube.material.opacity = 1
    } else {
      tube.material.opacity = 0.25
    }
  })

  meridianList.value.forEach((meridian) => {
    meridian.pointIds.forEach((pointId) => {
      const mesh = acupointMeshMap.get(pointId)
      if (!mesh) return

      if (meridian.id === meridianId) {
        setAcupointMarkerColor(mesh, getAcupointDisplayColor(pointId))
        mesh.scale.set(1.35, 1.35, 1.35)
      }
    })
  })
}

function resetMeridianHighlight() {
  if (!highlightedMeridianId) return

  meridianTubeMap.forEach((tube, id) => {
    const meridian = getMeridianById(id)
    if (!meridian) return

    tube.material.color.set(meridian.color)
    tube.material.opacity = 0.85
  })

  acupointMeshMap.forEach((mesh) => {
    mesh.scale.set(1, 1, 1)
    const acupointId = mesh.userData.acupointId
    setAcupointMarkerColor(mesh, getAcupointDisplayColor(acupointId))
  })

  highlightedMeridianId = null
}

function generateAcupointColor() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`
}

function findAcupointWithSameName(name, excludeId = null) {
  const normalized = name.trim()
  if (!normalized) return null

  return (
    acupointList.value.find(
      (item) => item.name.trim() === normalized && item.id !== excludeId
    ) || null
  )
}

function resolveAcupointColor(name, excludeId = null, fallbackColor = null) {
  const existing = findAcupointWithSameName(name, excludeId)
  if (existing?.color) return existing.color
  return fallbackColor || generateAcupointColor()
}

function syncAcupointColorByName() {
  if (!dialogVisible.value) return

  const existing = findAcupointWithSameName(
    newPointForm.value.name,
    editingAcupointId.value
  )
  if (existing?.color) {
    newPointForm.value.color = existing.color
    syncAcupointVisual()
  }
}

function getAcupointDisplayColor(acupointId) {
  return getAcupointById(acupointId)?.color || '#ffffff'
}

function handleViewerClick() {
  const markerMeshes = Array.from(acupointMeshMap.values())
  const tubeMeshes = Array.from(meridianTubeMap.values())
  const intersections = raycaster.intersectObjects([...markerMeshes, ...tubeMeshes], true)

  if (intersections.length > 0) {
    const acupointId = getAcupointIdFromObject(intersections[0].object)
    if (acupointId) {
      showAcupointInfo(acupointId)
      return
    }

    const target = intersections[0].object
    if (target.userData.meridianId) {
      showMeridianInfo(target.userData.meridianId)
    }
    return
  }

  hideInfoCard()
}

function getCunToWorld() {
  if (!modelSize) return 0.02
  return modelSize.y / RULER_CONFIG.BODY_CUN_COUNT
}

function setRulerAnchorFromHit(hit) {
  const worldNormal = getSurfaceNormalFromHit(hit)
  rulerAnchor.value = { x: hit.point.x, y: hit.point.y, z: hit.point.z }
  rulerSurfaceNormal.value = { x: worldNormal.x, y: worldNormal.y, z: worldNormal.z }
}

function initRulerAnchorIfNeeded() {
  if (rulerAnchorInitialized || !modelSize) return

  if (model && camera && raycaster) {
    const target = new THREE.Vector3(0, modelSize.y * 0.15, 0)
    const rayOrigin = camera.position.clone()
    const direction = new THREE.Vector3().subVectors(target, rayOrigin).normalize()
    raycaster.set(rayOrigin, direction)
    const hits = raycaster.intersectObject(model, true)
    if (hits.length > 0) {
      setRulerAnchorFromHit(hits[0])
      rulerAnchorInitialized = true
      return
    }

    const fallbackOrigin = new THREE.Vector3(0, modelSize.y * 0.15, modelSize.z * 0.6 + 0.2)
    const fallbackDirection = new THREE.Vector3().subVectors(target, fallbackOrigin).normalize()
    raycaster.set(fallbackOrigin, fallbackDirection)
    const fallbackHits = raycaster.intersectObject(model, true)
    if (fallbackHits.length > 0) {
      setRulerAnchorFromHit(fallbackHits[0])
      rulerAnchorInitialized = true
      return
    }
  }

  rulerAnchor.value = { x: 0, y: modelSize.y * 0.1, z: modelSize.z * 0.35 }
  rulerSurfaceNormal.value = { x: 0, y: 0, z: 1 }
  rulerAnchorInitialized = true
}

function computeRulerQuaternion(normal, orientation) {
  const surfaceNormal = new THREE.Vector3(normal.x, normal.y, normal.z).normalize()
  let lengthAxis = new THREE.Vector3()

  if (orientation === 'horizontal') {
    const worldUp = new THREE.Vector3(0, 1, 0)
    lengthAxis.crossVectors(worldUp, surfaceNormal)
    if (lengthAxis.lengthSq() < 1e-6) {
      lengthAxis.crossVectors(new THREE.Vector3(1, 0, 0), surfaceNormal)
    }
    lengthAxis.normalize()
  } else {
    const worldUp = new THREE.Vector3(0, 1, 0)
    const projected = worldUp.clone().sub(
      surfaceNormal.clone().multiplyScalar(worldUp.dot(surfaceNormal))
    )
    if (projected.lengthSq() < 1e-6) {
      lengthAxis.set(0, 0, 1)
    } else {
      lengthAxis.copy(projected.normalize())
    }
  }

  const yAxis = lengthAxis
  const zAxis = surfaceNormal.clone()
  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
  yAxis.crossVectors(zAxis, xAxis).normalize()

  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
  )
}

function getRulerFrame() {
  const anchor = new THREE.Vector3(
    rulerAnchor.value.x,
    rulerAnchor.value.y,
    rulerAnchor.value.z
  )
  const normal = new THREE.Vector3(
    rulerSurfaceNormal.value.x,
    rulerSurfaceNormal.value.y,
    rulerSurfaceNormal.value.z
  ).normalize()

  let quaternion = computeRulerQuaternion(
    { x: normal.x, y: normal.y, z: normal.z },
    rulerOrientation.value
  )

  if (rulerRotationDeg.value !== 0) {
    const swing = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      THREE.MathUtils.degToRad(rulerRotationDeg.value)
    )
    quaternion.multiply(swing)
  }

  return {
    anchor,
    normal,
    lengthAxis: new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion).normalize(),
    sideAxis: new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).normalize(),
    outwardAxis: new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion).normalize(),
  }
}

function projectOntoTangentPlane(vector, normal) {
  return vector.clone().sub(normal.clone().multiplyScalar(vector.dot(normal)))
}

function raycastSurfaceNear(point, normalHint) {
  if (!model) return null

  const probeDist = RULER_CONFIG.SURFACE_PROBE_DIST
  const tryHit = (origin, direction) => {
    raycaster.set(origin, direction)
    const hits = raycaster.intersectObject(model, true)
    return hits.length > 0 ? hits[0] : null
  }

  let hit = tryHit(
    point.clone().add(normalHint.clone().multiplyScalar(probeDist)),
    normalHint.clone().negate()
  )
  if (hit) return hit

  hit = tryHit(
    point.clone().add(normalHint.clone().multiplyScalar(-probeDist)),
    normalHint.clone()
  )
  if (hit) return hit

  if (camera) {
    const viewDir = new THREE.Vector3().subVectors(camera.position, point).normalize()
    hit = tryHit(
      point.clone().add(viewDir.clone().multiplyScalar(probeDist)),
      viewDir.clone().negate()
    )
    if (hit) return hit
  }

  return null
}

function collectRulerSurfaceSamples() {
  const totalCun = rulerLengthCun.value
  const cunToWorld = getCunToWorld()
  const frame = getRulerFrame()
  const samples = []

  let point = frame.anchor.clone()
  let normal = frame.outwardAxis.clone()

  const anchorHit = raycastSurfaceNear(point, normal)
  if (anchorHit) {
    point.copy(anchorHit.point)
    normal.copy(getSurfaceNormalFromHit(anchorHit))
  }

  samples.push({ point: point.clone(), normal: normal.clone(), cun: 0 })

  let lengthAxis = projectOntoTangentPlane(frame.lengthAxis, normal)
  if (lengthAxis.lengthSq() < 1e-8) {
    lengthAxis.copy(frame.lengthAxis)
  }
  lengthAxis.normalize()

  for (let i = 1; i <= totalCun; i += 1) {
    const estimate = point.clone().add(lengthAxis.clone().multiplyScalar(cunToWorld))
    const hit = raycastSurfaceNear(estimate, normal)

    if (hit) {
      point.copy(hit.point)
      normal.copy(getSurfaceNormalFromHit(hit))
    } else {
      point.copy(estimate)
    }

    lengthAxis = projectOntoTangentPlane(frame.lengthAxis, normal)
    if (lengthAxis.lengthSq() < 1e-8) {
      const prevPoint = samples[samples.length - 1].point
      lengthAxis.copy(point.clone().sub(prevPoint))
      lengthAxis = projectOntoTangentPlane(lengthAxis, normal)
    }
    if (lengthAxis.lengthSq() < 1e-8) {
      lengthAxis.copy(frame.lengthAxis)
    }
    lengthAxis.normalize()

    samples.push({ point: point.clone(), normal: normal.clone(), cun: i })
  }

  return samples
}

function computeSurfaceFrame(normal, lengthDir) {
  const zAxis = normal.clone().normalize()
  if (zAxis.lengthSq() < 1e-8) {
    zAxis.set(0, 0, 1)
  }

  let yAxis = lengthDir.clone().normalize()
  yAxis.sub(zAxis.clone().multiplyScalar(yAxis.dot(zAxis)))

  if (yAxis.lengthSq() < 1e-8) {
    yAxis.set(0, 1, 0).sub(zAxis.clone().multiplyScalar(zAxis.y))
    if (yAxis.lengthSq() < 1e-8) {
      yAxis.set(1, 0, 0)
    }
  }
  yAxis.normalize()

  const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
  yAxis.crossVectors(zAxis, xAxis).normalize()

  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
  )
}

function createRulerMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0xff6600,
    depthTest: true,
    depthWrite: false,
  })
}

function refreshRulerGeometry() {
  if (!rulerVisible.value || !scene || !modelSize || !model) return

  if (!rulerGroup) {
    buildRuler()
    return
  }

  populateRulerGeometry(rulerGroup)
}

function applyRulerTransform() {
  refreshRulerGeometry()
}

function handleRulerLengthChange() {
  refreshRulerGeometry()
}

function pickModelHit() {
  if (!model) return null

  const hits = raycaster.intersectObject(model, true)
  return hits.length > 0 ? hits[0] : null
}

function getSurfaceNormalFromHit(hit) {
  if (!hit?.face?.normal) {
    return new THREE.Vector3(0, 0, 1)
  }

  const worldNormal = hit.face.normal
    .clone()
    .transformDirection(hit.object.matrixWorld)
    .normalize()

  if (camera) {
    const viewDir = new THREE.Vector3()
      .subVectors(camera.position, hit.point)
      .normalize()
    if (worldNormal.dot(viewDir) < 0) {
      worldNormal.negate()
    }
  }

  return worldNormal
}

function updateRulerFromHit(hit) {
  setRulerAnchorFromHit(hit)
  refreshRulerGeometry()
}

function stopRulerDragListeners() {
  window.removeEventListener('pointermove', onRulerWindowPointerMove)
  window.removeEventListener('pointerup', onRulerWindowPointerUp)
  window.removeEventListener('pointercancel', onRulerWindowPointerUp)
}

function endRulerDrag() {
  if (!isDraggingRuler) return

  isDraggingRuler = false
  stopRulerDragListeners()

  if (controls) {
    controls.enabled = true
    updateControlsForMode()
  }
}

function onRulerWindowPointerMove(event) {
  if (!isDraggingRuler || !renderer || !raycaster || !camera) return

  updateMouseFromEvent(event)
  raycaster.setFromCamera(mouse, camera)
  const hit = pickModelHit()
  if (hit) {
    updateRulerFromHit(hit)
  }
}

function onRulerWindowPointerUp() {
  endRulerDrag()
}

function toggleRulerPlacement() {
  if (!rulerVisible.value) {
    ElMessage.warning('请先开启显示尺子')
    return
  }

  rulerPlacementActive.value = !rulerPlacementActive.value
  if (!rulerPlacementActive.value) {
    endRulerDrag()
  }
  updateControlsForMode()

  if (rulerPlacementActive.value) {
    ElMessage.info('尺子定位模式：左键拖拽模型表面或尺子即可移动，完成后点击「完成定位」')
  }
}

function onRulerPointerDown(event) {
  if (!rulerVisible.value || !rulerPlacementActive.value) return
  if (dialogVisible.value || meridianDialogVisible.value) return
  if (event.button !== 0) return

  updateMouseFromEvent(event)
  raycaster.setFromCamera(mouse, camera)

  let shouldDrag = false

  if (rulerGroup) {
    const rulerHits = raycaster.intersectObjects(rulerGroup.children, true)
    if (rulerHits.length > 0) {
      shouldDrag = true
    }
  }

  if (!shouldDrag) {
    const hit = pickModelHit()
    if (hit) {
      updateRulerFromHit(hit)
      shouldDrag = true
    }
  }

  if (!shouldDrag) return

  isDraggingRuler = true
  controls.enabled = false
  stopRulerDragListeners()
  window.addEventListener('pointermove', onRulerWindowPointerMove)
  window.addEventListener('pointerup', onRulerWindowPointerUp)
  window.addEventListener('pointercancel', onRulerWindowPointerUp)
  event.preventDefault()
  event.stopPropagation()
}

function handleRulerVisibleChange(visible) {
  if (!visible) {
    rulerPlacementActive.value = false
    endRulerDrag()
    disposeRuler()
    updateControlsForMode()
    return
  }

  if (!scene || !modelSize || !model || !raycaster) {
    rulerVisible.value = false
    ElMessage.warning('模型尚未加载完成，请稍后再试')
    return
  }

  nextTick(() => {
    try {
      buildRuler()
    } catch (error) {
      console.error('buildRuler failed', error)
      rulerVisible.value = false
      ElMessage.error('尺子显示失败，请稍后重试')
    }
    updateControlsForMode()
  })
}

function createRulerTextSprite(text) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 128
  canvas.height = 64
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ff6600'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.055, 0.028, 1)
  return sprite
}

function disposeRuler() {
  if (!rulerGroup) return

  rulerGroup.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (child.material.map) child.material.map.dispose()
      child.material.dispose()
    }
  })
  scene?.remove(rulerGroup)
  rulerGroup = null
}

function clearRulerChildren() {
  if (!rulerGroup) return

  const children = [...rulerGroup.children]
  children.forEach((child) => {
    rulerGroup.remove(child)
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (child.material.map) child.material.map.dispose()
      child.material.dispose()
    }
  })
}

function populateRulerGeometry(group) {
  if (!model) return

  clearRulerChildren()

  const samples = collectRulerSurfaceSamples()
  if (samples.length === 0) return

  const cunToWorld = getCunToWorld()
  const totalCun = rulerLengthCun.value
  const barWidth = 0.003
  const tickDepth = barWidth * 0.8
  const anchorRadius = RULER_CONFIG.ANCHOR_RADIUS
  const surfaceLift = RULER_CONFIG.SURFACE_OFFSET + tickDepth / 2
  const rulerMaterial = createRulerMaterial()

  const anchorSample = samples[0]
  const anchorHandle = new THREE.Mesh(
    new THREE.SphereGeometry(anchorRadius, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xff9900,
      depthTest: true,
      depthWrite: false,
    })
  )
  anchorHandle.position.copy(anchorSample.point).add(
    anchorSample.normal.clone().multiplyScalar(RULER_CONFIG.SURFACE_OFFSET + anchorRadius)
  )
  anchorHandle.userData.isRuler = true
  group.add(anchorHandle)

  for (let i = 0; i < samples.length - 1; i += 1) {
    const current = samples[i]
    const next = samples[i + 1]
    const segDir = next.point.clone().sub(current.point)
    const segLen = segDir.length()
    if (segLen < 1e-6) continue

    segDir.normalize()
    const avgNormal = current.normal.clone().add(next.normal).normalize()
    const mid = current.point.clone().add(next.point).multiplyScalar(0.5)

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(barWidth, segLen, tickDepth),
      rulerMaterial
    )
    bar.position.copy(mid).add(avgNormal.clone().multiplyScalar(surfaceLift))
    bar.quaternion.copy(computeSurfaceFrame(avgNormal, segDir))
    bar.userData.isRuler = true
    group.add(bar)
  }

  samples.forEach((sample, index) => {
    const isMajor = sample.cun % 1 === 0
    const tickLength = isMajor ? 0.018 : 0.01
    const prev = samples[index - 1]
    const next = samples[index + 1]
    let lengthDir

    if (next) {
      lengthDir = next.point.clone().sub(sample.point).normalize()
    } else if (prev) {
      lengthDir = sample.point.clone().sub(prev.point).normalize()
    } else {
      lengthDir = getRulerFrame().lengthAxis.clone()
    }

    const frameQuat = computeSurfaceFrame(sample.normal, lengthDir)
    const sideAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(frameQuat)
    const tickCenter = sample.point.clone().add(
      sample.normal.clone().multiplyScalar(surfaceLift)
    )

    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(tickLength, barWidth * 0.9, tickDepth),
      rulerMaterial
    )
    tick.position.copy(tickCenter).add(
      sideAxis.clone().multiplyScalar(barWidth / 2 + tickLength / 2)
    )
    tick.quaternion.copy(frameQuat)
    tick.userData.isRuler = true
    group.add(tick)

    if (sample.cun > 0 && isMajor) {
      const label = createRulerTextSprite(`${sample.cun}寸`)
      label.position.copy(tickCenter).add(
        sideAxis.clone().multiplyScalar(barWidth / 2 + tickLength + 0.035)
      )
      label.userData.isRuler = true
      group.add(label)
    }
  })

  const title = createRulerTextSprite(`${totalCun}寸`)
  const endSample = samples[samples.length - 1]
  const endPrev = samples[samples.length - 2]
  const endLengthDir = endPrev
    ? endSample.point.clone().sub(endPrev.point).normalize()
    : getRulerFrame().lengthAxis.clone()
  const endFrame = computeSurfaceFrame(endSample.normal, endLengthDir)
  const endCenter = endSample.point.clone().add(
    endSample.normal.clone().multiplyScalar(surfaceLift)
  )
  title.position.copy(endCenter).add(
    new THREE.Vector3(0, 1, 0).applyQuaternion(endFrame).multiplyScalar(cunToWorld * 0.8 + 0.04)
  )
  title.userData.isRuler = true
  group.add(title)
}

function buildRuler() {
  disposeRuler()
  if (!rulerVisible.value || !scene || !modelSize || !model) return

  initRulerAnchorIfNeeded()

  rulerGroup = new THREE.Group()
  populateRulerGeometry(rulerGroup)
  scene.add(rulerGroup)
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

function createWireframeMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0x444444,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
    clippingPlanes: [],
    clipIntersection: false,
  })
}

function setupWireframeModel(source) {
  wireframeModel = source.clone()
  wireframeModel.traverse((child) => {
    if (!child.isMesh) return
    child.material = createWireframeMaterial()
  })
  wireframeModel.visible = false
  scene.add(wireframeModel)
}

function getHeadClippingPlanes() {
  return [
    new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP.HEAD_Y_MIN),
  ]
}

function getTorsoClippingPlanes() {
  return [
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -CLIP.TORSO_Y_MIN),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP.HEAD_Y_MIN),
    new THREE.Plane(new THREE.Vector3(1, 0, 0), CLIP.ARM_X_MIN),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), CLIP.ARM_X_MIN),
  ]
}

function getLimbsClippingPlanes() {
  return [
    new THREE.Plane(new THREE.Vector3(0, -1, 0), CLIP.TORSO_Y_MIN),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), CLIP.ARM_X_MIN),
    new THREE.Plane(new THREE.Vector3(1, 0, 0), CLIP.ARM_X_MIN),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), -CLIP.HEAD_Y_MIN),
  ]
}

function applyWireframeClipMode(mode) {
  if (!wireframeModel) return

  if (mode === 'off') {
    wireframeModel.visible = false
    return
  }

  let planes = []
  let clipIntersection = false

  if (mode === 'head') {
    planes = getHeadClippingPlanes()
  } else if (mode === 'torso') {
    planes = getTorsoClippingPlanes()
  } else if (mode === 'limbs') {
    planes = getLimbsClippingPlanes()
    clipIntersection = true
  }

  wireframeModel.visible = true
  wireframeModel.traverse((child) => {
    if (!child.isMesh || !child.material) return
    child.material.clippingPlanes = planes
    child.material.clipIntersection = clipIntersection
    child.material.needsUpdate = true
  })
}

function showLocalAxesHelper(x, y, z) {
  removeLocalAxesHelper()
  localAxesHelper = new THREE.AxesHelper(0.1)
  localAxesHelper.position.set(x, y, z)
  scene.add(localAxesHelper)
}

function updateLocalAxesHelperPosition(x, y, z) {
  if (localAxesHelper) {
    localAxesHelper.position.set(x, y, z)
  }
}

function removeLocalAxesHelper() {
  if (!localAxesHelper) return

  scene.remove(localAxesHelper)
  localAxesHelper.dispose()
  localAxesHelper = null
}

function createPreviewMesh(x, y, z, color) {
  removePreviewMesh()
  previewMesh = createAcupointMesh({ id: 'preview', x, y, z }, color)
}

function syncAcupointVisual() {
  if (!dialogVisible.value) return

  const mesh = getEditingMesh()
  if (mesh && newPointForm.value.color) {
    setAcupointMarkerColor(mesh, newPointForm.value.color)
  }
}

function removePreviewMesh() {
  if (!previewMesh) return

  scene.remove(previewMesh)
  disposeAcupointMarker(previewMesh)
  previewMesh = null
}

function getEditingMesh() {
  if (editingAcupointId.value) {
    return acupointMeshMap.get(editingAcupointId.value)
  }
  return previewMesh
}

function syncCoordsToScene() {
  const coords = currentPointCoords.value
  if (!coords || !dialogVisible.value) return

  const { x, y, z } = coords
  const mesh = getEditingMesh()
  if (mesh) {
    mesh.position.set(x, y, z)
  }

  updateLocalAxesHelperPosition(x, y, z)

  if (editingAcupointId.value) {
    const acupoint = getAcupointById(editingAcupointId.value)
    if (acupoint) {
      acupoint.x = x
      acupoint.y = y
      acupoint.z = z
      meridianList.value.forEach((meridian) => {
        if (meridian.pointIds.includes(editingAcupointId.value)) {
          updateMeridianTube(meridian.id)
        }
      })
    }
  }
}

function openAcupointDialog(coords, acupoint = null) {
  if (acupoint) {
    editingAcupointId.value = acupoint.id
    editSnapshot = { ...acupoint }
    currentPointCoords.value = { x: acupoint.x, y: acupoint.y, z: acupoint.z }
    newPointForm.value = {
      name: acupoint.name,
      bodyPart: acupoint.bodyPart,
      description: acupoint.description || '',
      color: acupoint.color || '#409eff',
    }
    showLocalAxesHelper(acupoint.x, acupoint.y, acupoint.z)
  } else {
    editingAcupointId.value = null
    editSnapshot = null
    currentPointCoords.value = { x: coords.x, y: coords.y, z: coords.z }
    const color = generateAcupointColor()
    newPointForm.value = { name: '', bodyPart: '', description: '', color }
    createPreviewMesh(coords.x, coords.y, coords.z, color)
    showLocalAxesHelper(coords.x, coords.y, coords.z)
  }

  dialogVisible.value = true
}

function closeAcupointDialog(restoreEdit = false) {
  if (restoreEdit && editingAcupointId.value && editSnapshot) {
    const acupoint = getAcupointById(editingAcupointId.value)
    if (acupoint) {
      acupoint.x = editSnapshot.x
      acupoint.y = editSnapshot.y
      acupoint.z = editSnapshot.z
      acupoint.name = editSnapshot.name
      acupoint.bodyPart = editSnapshot.bodyPart
      acupoint.description = editSnapshot.description
      acupoint.color = editSnapshot.color

      const mesh = acupointMeshMap.get(editingAcupointId.value)
      if (mesh) {
        mesh.position.set(editSnapshot.x, editSnapshot.y, editSnapshot.z)
        setAcupointMarkerColor(mesh, editSnapshot.color || '#409eff')
      }

      meridianList.value.forEach((meridian) => {
        if (meridian.pointIds.includes(editingAcupointId.value)) {
          updateMeridianTube(meridian.id)
        }
      })
    }
  } else {
    removePreviewMesh()
  }

  removeLocalAxesHelper()
  dialogVisible.value = false
  currentPointCoords.value = null
  editingAcupointId.value = null
  editSnapshot = null
  newPointForm.value = { name: '', bodyPart: '', description: '', color: '#409eff' }
}

function editAcupoint(acupoint) {
  if (interactionMode.value !== 'point') return
  openAcupointDialog(null, acupoint)
}

function fitModelToView(object) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  object.position.sub(center)
  object.updateMatrixWorld(true)
  modelSize = size.clone()
  cunUnitLength.value = getCunToWorld()

  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = camera.fov * (Math.PI / 180)
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
  cameraZ *= 1.3

  camera.position.set(0, size.y * 0.15, cameraZ)
  camera.lookAt(0, 0, 0)
  controls.target.set(0, 0, 0)
  controls.update()
  rulerAnchorInitialized = false
  buildRuler()
}

function onWindowResize() {
  if (!containerRef.value || !camera || !renderer) return

  const { clientWidth, clientHeight } = containerRef.value
  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(clientWidth, clientHeight)
}

function loadModel() {
  const mtlLoader = new MTLLoader()
  mtlLoader.setPath('/models/')
  mtlLoader.setResourcePath('/models/')

  mtlLoader.load(
    '3d1.mtl',
    (materials) => {
      materials.preload()

      const objLoader = new OBJLoader()
      objLoader.setMaterials(materials)
      objLoader.setPath('/models/')

      objLoader.load(
        '3d1.obj',
        (object) => {
          model = object
          applyStandardMaterials(model)
          scene.add(model)
          fitModelToView(model)
          setupWireframeModel(model)
          applyWireframeClipMode(wireframeClipMode.value)
          requestAnimationFrame(() => {
            syncAcupointMeshesFromList()
            applySurfaceSnapToMeshes()
          })
        },
        undefined,
        (error) => {
          console.error('OBJ 加载失败:', error)
        }
      )
    },
    undefined,
    (error) => {
      console.error('MTL 加载失败:', error)
    }
  )
}

function getAcupointById(id) {
  return acupointList.value.find((item) => item.id === id)
}

function updateMouseFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function createAcupointMarkerParts(color) {
  const threeColor = new THREE.Color(color)
  const segments = GEOMETRY.ACUPOINT_SEGMENTS

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(GEOMETRY.ACUPOINT_RADIUS, segments, segments),
    new THREE.MeshBasicMaterial({
      color: threeColor,
      depthTest: true,
      depthWrite: true,
    })
  )

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(
      GEOMETRY.ACUPOINT_RADIUS * GEOMETRY.ACUPOINT_GLOW_SCALE,
      16,
      16
    ),
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
    new THREE.SphereGeometry(
      GEOMETRY.ACUPOINT_RADIUS * GEOMETRY.ACUPOINT_HALO_SCALE,
      12,
      12
    ),
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

function setAcupointMarkerColor(marker, color) {
  const threeColor = new THREE.Color(color)
  const { core, glow, outerGlow } = marker.userData.markerParts || {}
  core?.material?.color?.set(threeColor)
  glow?.material?.color?.set(threeColor)
  outerGlow?.material?.color?.set(threeColor)
}

function disposeAcupointMarker(marker) {
  marker.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) child.material.dispose()
  })
}

function getAcupointIdFromObject(object) {
  let current = object
  while (current) {
    if (current.userData.acupointId) return current.userData.acupointId
    current = current.parent
  }
  return null
}

function resolveAcupointPosition(acupoint) {
  return { x: acupoint.x, y: acupoint.y, z: acupoint.z }
}

function snapAcupointPosition(acupoint) {
  if (!model || !raycaster) {
    return resolveAcupointPosition(acupoint)
  }

  // 下肢、背部、上肢（背侧）坐标已烘焙，直接使用
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
  const snapped = snapAcupointQuick(
    model,
    raycaster,
    acupoint.x,
    acupoint.y,
    surface
  )
  return snapped || resolveAcupointPosition(acupoint)
}

let surfaceSnapQueue = []
let surfaceSnapRunning = false

function applySurfaceSnapToMeshes() {
  if (!model || !raycaster) return

  model.updateMatrixWorld(true)
  surfaceSnapQueue = acupointList.value.filter((item) => item.bodyPart === '胸腹')
  if (!surfaceSnapQueue.length) return

  if (!surfaceSnapRunning) {
    surfaceSnapRunning = true
    processSurfaceSnapBatch()
  }
}

function processSurfaceSnapBatch() {
  if (!surfaceSnapQueue.length) {
    surfaceSnapRunning = false
    return
  }

  const batch = surfaceSnapQueue.splice(0, 15)
  batch.forEach((acupoint) => {
    const mesh = acupointMeshMap.get(acupoint.id)
    if (!mesh) return

    const pos = snapAcupointPosition(acupoint)
    mesh.position.set(pos.x, pos.y, pos.z)
  })

  requestAnimationFrame(processSurfaceSnapBatch)
}

function createAcupointMesh(acupoint, color) {
  const pos = resolveAcupointPosition(acupoint)
  const group = new THREE.Group()
  const parts = createAcupointMarkerParts(color)
  group.add(parts.outerGlow, parts.glow, parts.core)
  group.userData.acupointId = acupoint.id
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

function addAcupointMesh(acupoint) {
  const mesh = createAcupointMesh(acupoint, acupoint.color || '#409eff')
  acupointMeshMap.set(acupoint.id, mesh)
}

function removeAcupointFromScene(acupointId) {
  const mesh = acupointMeshMap.get(acupointId)
  if (!mesh) return

  mesh.parent?.remove(mesh)
  disposeAcupointMarker(mesh)
  acupointMeshMap.delete(acupointId)
}

function syncAcupointMeshesFromList() {
  if (!scene) return

  clearAcupointMeshes()
  acupointList.value.forEach((acupoint) => {
    addAcupointMesh(acupoint)
  })
}

function removeAcupointFromMeridians(acupointId) {
  meridianList.value.forEach((meridian) => {
    const nextPointIds = meridian.pointIds.filter((id) => id !== acupointId)
    if (nextPointIds.length !== meridian.pointIds.length) {
      meridian.pointIds = nextPointIds
      updateMeridianTube(meridian.id)
    }
  })
}

async function loadAcupointsFromDb() {
  const maxAttempts = 5
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      acupointList.value = await fetchAcupoints()
      syncAcupointMeshesFromList()
      applySurfaceSnapToMeshes()
      return
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
    }
  }

  ElMessage.error(lastError?.message || '加载穴位失败，请先运行 npm run server')
}

async function deleteAcupointItem(acupoint) {
  try {
    await ElMessageBox.confirm(
      `确定删除穴位「${acupoint.name}」吗？删除后无法恢复。`,
      '删除穴位',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      }
    )
  } catch {
    return
  }

  try {
    await deleteAcupointApi(acupoint.id)
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
    return
  }

  removeAcupointFromScene(acupoint.id)
  removeAcupointFromMeridians(acupoint.id)
  acupointList.value = acupointList.value.filter((item) => item.id !== acupoint.id)

  if (infoCardVisible.value && infoCard.value.type === 'acupoint' && infoCard.value.title === acupoint.name) {
    hideInfoCard()
  }

  ElMessage.success('穴位已删除')
}

function removeMeridianTube(meridianId) {
  const tube = meridianTubeMap.get(meridianId)
  if (!tube) return

  scene.remove(tube)
  tube.geometry.dispose()
  tube.material.dispose()
  meridianTubeMap.delete(meridianId)
}

function updateMeridianTube(meridianId) {
  removeMeridianTube(meridianId)

  const meridian = meridianList.value.find((item) => item.id === meridianId)
  if (!meridian || meridian.pointIds.length < 2) return

  const curvePoints = meridian.pointIds
    .map((id) => getAcupointById(id))
    .filter(Boolean)
    .map((point) => {
      const pos = resolveAcupointPosition(point)
      return new THREE.Vector3(pos.x, pos.y, pos.z)
    })

  if (curvePoints.length < 2) return

  const curve = new THREE.CatmullRomCurve3(curvePoints)
  const geometry = new THREE.TubeGeometry(curve, 64, GEOMETRY.MERIDIAN_TUBE_RADIUS, 8, false)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(meridian.color),
    transparent: true,
    opacity: 0.85,
  })
  const tube = new THREE.Mesh(geometry, material)
  tube.userData.meridianId = meridianId
  scene.add(tube)
  meridianTubeMap.set(meridianId, tube)
}

function updateControlsForMode() {
  if (!controls) return

  if (isDraggingRuler) return

  if (interactionMode.value === 'meridian') {
    controls.enabled = true
    controls.enableRotate = false
    controls.enablePan = true
    controls.enableZoom = true
    controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    }
  } else if (rulerVisible.value && rulerPlacementActive.value) {
    controls.enabled = true
    controls.enableRotate = false
    controls.enablePan = false
    controls.enableZoom = true
    controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    }
  } else {
    controls.enabled = true
    controls.enableRotate = true
    controls.enablePan = true
    controls.enableZoom = true
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }
  }
}

function addMeridian() {
  const name = newMeridianForm.value.name.trim()
  if (!name) {
    ElMessage.warning('请输入经络名称')
    return
  }

  const id = crypto.randomUUID()
  meridianList.value.push({
    id,
    name,
    color: newMeridianForm.value.color,
    description: newMeridianForm.value.description.trim(),
    pointIds: [],
  })

  currentMeridianId.value = id
  newMeridianForm.value = {
    name: '',
    color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
    description: '',
  }
  ElMessage.success(`经络「${name}」已创建，请点击穴位小球连线`)
}

function openMeridianDialog(meridian) {
  editingMeridianId.value = meridian.id
  meridianEditSnapshot = { ...meridian }
  meridianEditForm.value = {
    name: meridian.name,
    color: meridian.color,
    description: meridian.description || '',
  }
  meridianDialogVisible.value = true
}

function saveMeridianEdit() {
  const name = meridianEditForm.value.name.trim()
  if (!name) {
    ElMessage.warning('请输入经络名称')
    return
  }

  const meridian = getMeridianById(editingMeridianId.value)
  if (!meridian) {
    ElMessage.warning('经络不存在，请重新选择')
    return
  }

  meridian.name = name
  meridian.color = meridianEditForm.value.color
  meridian.description = meridianEditForm.value.description.trim()

  updateMeridianTube(meridian.id)

  if (infoCardVisible.value && infoCard.value.type === 'meridian' && highlightedMeridianId === meridian.id) {
    infoCard.value.title = meridian.name
    infoCard.value.description = meridian.description || '暂无介绍'
    highlightMeridian(meridian.id)
  }

  meridianEditSnapshot = null
  editingMeridianId.value = null
  meridianDialogVisible.value = false
  ElMessage.success('经络更新成功')
}

function cancelMeridianEdit() {
  meridianDialogVisible.value = false
  editingMeridianId.value = null
  meridianEditSnapshot = null
  meridianEditForm.value = { name: '', color: '#e74c3c', description: '' }
}

function onCanvasDblClick(event) {
  if (interactionMode.value !== 'point') return
  if (!model || !camera || !renderer || !raycaster) return

  updateMouseFromEvent(event)
  raycaster.setFromCamera(mouse, camera)
  const intersections = raycaster.intersectObject(model, true)

  if (intersections.length > 0) {
    const { x, y, z } = intersections[0].point
    openAcupointDialog({ x, y, z })
  }
}

function onCanvasClick(event) {
  if (!camera || !renderer || !raycaster || dialogVisible.value || meridianDialogVisible.value) return
  if (isDraggingRuler) return
  if (rulerVisible.value && rulerPlacementActive.value) return

  updateMouseFromEvent(event)
  raycaster.setFromCamera(mouse, camera)

  if (interactionMode.value === 'meridian') {
    if (!currentMeridianId.value) {
      ElMessage.warning('请先新建或选择一条经络')
      return
    }

    const markerMeshes = Array.from(acupointMeshMap.values())
    const intersections = raycaster.intersectObjects(markerMeshes, true)

    if (intersections.length === 0) return

    const acupointId = getAcupointIdFromObject(intersections[0].object)
    if (!acupointId) return
    selectAcupointForMeridian(acupointId)
    return
  }

  if (interactionMode.value === 'browse' || interactionMode.value === 'point') {
    handleViewerClick()
  }
}

function selectAcupointForMeridian(acupointId) {
  const meridian = meridianList.value.find((item) => item.id === currentMeridianId.value)
  if (!meridian) {
    ElMessage.warning('当前经络不存在，请重新选择')
    return
  }

  if (meridian.pointIds.includes(acupointId)) {
    ElMessage.info('该穴位已在当前经络中')
    return
  }

  meridian.pointIds.push(acupointId)
  updateMeridianTube(meridian.id)

  const acupoint = getAcupointById(acupointId)
  console.log('经络连线更新:', {
    meridian: meridian.name,
    pointIds: [...meridian.pointIds],
    added: acupoint?.name,
  })
  ElMessage.success(`已加入经络：${acupoint?.name || acupointId}`)
}

async function saveAcupoint() {
  const name = newPointForm.value.name.trim()
  const bodyPart = newPointForm.value.bodyPart

  if (!name) {
    ElMessage.warning('请输入穴位名称')
    return
  }

  if (!bodyPart) {
    ElMessage.warning('请选择所属部位')
    return
  }

  if (!currentPointCoords.value) {
    ElMessage.warning('未获取到坐标，请重新双击模型选点')
    return
  }

  const { x, y, z } = currentPointCoords.value
  const color = resolveAcupointColor(
    name,
    editingAcupointId.value,
    newPointForm.value.color
  )
  newPointForm.value.color = color
  syncAcupointVisual()

  const payload = {
    name,
    bodyPart,
    description: newPointForm.value.description.trim(),
    color,
    x,
    y,
    z,
  }

  try {
    if (editingAcupointId.value) {
      const updated = await updateAcupointApi(editingAcupointId.value, payload)
      const index = acupointList.value.findIndex((item) => item.id === updated.id)
      if (index !== -1) {
        acupointList.value[index] = updated
      }

      const mesh = acupointMeshMap.get(updated.id)
      if (mesh) {
        setAcupointMarkerColor(mesh, updated.color)
        mesh.position.set(updated.x, updated.y, updated.z)
      }

      meridianList.value.forEach((meridian) => {
        if (meridian.pointIds.includes(updated.id)) {
          updateMeridianTube(meridian.id)
        }
      })

      ElMessage.success('穴位更新成功')
    } else {
      const created = await createAcupointApi(payload)

      if (previewMesh) {
        previewMesh.userData.acupointId = created.id
        setAcupointMarkerColor(previewMesh, created.color)
        acupointMeshMap.set(created.id, previewMesh)
        previewMesh = null
      } else {
        addAcupointMesh(created)
      }

      acupointList.value.push(created)
      ElMessage.success('穴位已保存，下次打开仍会自动加载')
    }
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
    return
  }

  editSnapshot = null
  removeLocalAxesHelper()
  dialogVisible.value = false
  currentPointCoords.value = null
  editingAcupointId.value = null
  newPointForm.value = { name: '', bodyPart: '', description: '', color: '#409eff' }
}

function cancelSaveAcupoint() {
  closeAcupointDialog(true)
}

function getMeridianPointNames(meridian) {
  return meridian.pointIds
    .map((id) => getAcupointById(id)?.name)
    .filter(Boolean)
}

function updateAcupointGlowPulse(time) {
  const pulse = 0.82 + 0.18 * Math.sin(time * 3)

  const updateMarker = (marker, glowBase, haloBase) => {
    const { glow, outerGlow } = marker.userData.markerParts || {}
    if (glow?.material) glow.material.opacity = glowBase * pulse
    if (outerGlow?.material) outerGlow.material.opacity = haloBase * pulse
  }

  acupointMeshMap.forEach((marker) => updateMarker(marker, 0.45, 0.2))
  if (previewMesh) updateMarker(previewMesh, 0.5, 0.24)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  controls.update()
  updateAcupointGlowPulse(performance.now() * 0.001)
  renderer.render(scene, camera)
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose()
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material.map) material.map.dispose()
        material.dispose()
      })
    }
  })
}

function clearAcupointMeshes() {
  acupointMeshMap.forEach((mesh) => {
    mesh.parent?.remove(mesh)
    disposeAcupointMarker(mesh)
  })
  acupointMeshMap.clear()
}

function clearMeridianTubes() {
  meridianTubeMap.forEach((tube, meridianId) => {
    scene?.remove(tube)
    tube.geometry.dispose()
    tube.material.dispose()
    meridianTubeMap.delete(meridianId)
  })
}

function init() {
  const container = containerRef.value
  if (!container) return

  const { clientWidth, clientHeight } = container

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  camera = new THREE.PerspectiveCamera(
    45,
    clientWidth / clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 1, 5)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.localClippingEnabled = true
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(clientWidth, clientHeight)
  container.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
  directionalLight.position.set(3, 5, 4)
  scene.add(directionalLight)

  const backLight = new THREE.DirectionalLight(0xffffff, 0.6)
  backLight.position.set(-2, 3, -5)
  scene.add(backLight)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  renderer.domElement.addEventListener('dblclick', onCanvasDblClick)
  renderer.domElement.addEventListener('click', onCanvasClick)
  renderer.domElement.addEventListener('pointerdown', onRulerPointerDown, true)

  updateControlsForMode()
  loadModel()
  window.addEventListener('resize', onWindowResize)
  animate()
}

function cleanup() {
  window.removeEventListener('resize', onWindowResize)

  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('dblclick', onCanvasDblClick)
    renderer.domElement.removeEventListener('click', onCanvasClick)
    renderer.domElement.removeEventListener('pointerdown', onRulerPointerDown, true)
  }

  endRulerDrag()

  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  clearMeridianTubes()
  clearAcupointMeshes()
  removePreviewMesh()
  removeLocalAxesHelper()
  disposeRuler()

  if (model) {
    scene.remove(model)
    disposeObject(model)
    model = null
  }

  if (wireframeModel) {
    scene.remove(wireframeModel)
    disposeObject(wireframeModel)
    wireframeModel = null
  }

  if (controls) {
    controls.dispose()
    controls = null
  }

  if (renderer) {
    renderer.dispose()
    if (renderer.domElement?.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer = null
  }

  scene = null
  camera = null
  raycaster = null
  mouse = null
}

watch(interactionMode, () => {
  updateControlsForMode()
  if (interactionMode.value === 'meridian') {
    hideInfoCard()
  }
})

watch([rulerVisible, rulerPlacementActive], () => {
  updateControlsForMode()
})

watch(wireframeClipMode, (mode) => {
  applyWireframeClipMode(mode)
})

watch(rulerLengthCun, () => {
  refreshRulerGeometry()
})

watch(rulerOrientation, () => {
  applyRulerTransform()
})

watch(
  () => newPointForm.value.name,
  () => {
    syncAcupointColorByName()
  }
)

watch(
  () => newPointForm.value.color,
  () => {
    syncAcupointVisual()
  }
)

watch(
  currentPointCoords,
  () => {
    syncCoordsToScene()
  },
  { deep: true }
)

onMounted(async () => {
  init()
  await loadAcupointsFromDb()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="acupuncture-layout">
    <aside class="control-panel">
      <h2 class="panel-title">后台管理</h2>

      <div class="mode-switch">
        <span class="mode-label">交互模式</span>
        <el-radio-group v-model="interactionMode" class="mode-radio">
          <el-radio
            v-for="option in interactionModeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </div>

      <p class="mode-hint">
        <template v-if="interactionMode === 'point'">
          打点模式：双击模型录入穴位；单击穴位/经络可预览科普卡片。
        </template>
        <template v-else-if="interactionMode === 'meridian'">
          建脉模式：先新建经络，再单击已有穴位小球按顺序连线。
        </template>
        <template v-else>
          科普浏览：单击穴位或经络查看图文介绍，单击空白处关闭卡片。
        </template>
      </p>

      <section class="panel-section ruler-section">
        <h3 class="section-title">骨度分寸尺</h3>
        <div class="ruler-controls">
          <div class="color-row">
            <span>显示尺子</span>
            <el-switch v-model="rulerVisible" @change="handleRulerVisibleChange" />
          </div>
          <div class="color-row">
            <span>尺子长度</span>
            <el-select
              v-model="rulerLengthCun"
              style="width: 110px"
              teleported
              popper-class="ruler-length-popper"
              @change="handleRulerLengthChange"
            >
              <el-option
                v-for="length in rulerLengthOptions"
                :key="length"
                :value="length"
                :label="`${length} 寸`"
              />
            </el-select>
          </div>
          <el-button
            :type="rulerPlacementActive ? 'warning' : 'primary'"
            :disabled="!rulerVisible"
            style="width: 100%"
            @click="toggleRulerPlacement"
          >
            {{ rulerPlacementActive ? '完成尺子定位' : '选择尺子位置' }}
          </el-button>
          <div class="ruler-orientation">
            <span class="mode-label">尺子方向</span>
            <el-radio-group v-model="rulerOrientation" :disabled="!rulerVisible">
              <el-radio value="vertical">竖向（沿体表向上）</el-radio>
              <el-radio value="horizontal">横向（沿体表横放）</el-radio>
            </el-radio-group>
          </div>
          <div class="ruler-rotation">
            <span class="mode-label">平面内旋转 {{ rulerRotationDeg }}°</span>
            <el-slider
              v-model="rulerRotationDeg"
              :min="0"
              :max="360"
              :disabled="!rulerVisible"
              @change="applyRulerTransform"
            />
          </div>
          <p class="coords-tip">
            按骨度分寸法：模型竖向身高 = 75 寸，1 寸 ≈ {{ cunUnitLength ? cunUnitLength.toFixed(4) : '—' }} 单位。
            尺子贴附在体表法线方向；可选竖向/横向；点击「选择尺子位置」后拖拽到身体任意位置。
          </p>
        </div>
      </section>

      <section v-if="interactionMode === 'point'" class="panel-section">
        <div class="wireframe-clip">
          <span class="mode-label">局部线框</span>
          <el-radio-group v-model="wireframeClipMode" class="wireframe-radio">
            <el-radio
              v-for="option in wireframeClipOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>
        </div>

        <h3 class="section-title">穴位列表 ({{ acupointList.length }})</h3>
        <div v-if="acupointList.length === 0" class="empty-tip">暂无穴位，请双击模型添加。</div>
        <ul v-else class="data-list">
          <li v-for="item in acupointList" :key="item.id">
            <div class="point-info">
              <span class="acupoint-color" :style="{ backgroundColor: item.color || '#409eff' }"></span>
              <div>
                <strong>{{ item.name }}</strong>
                <span>{{ item.bodyPart }}</span>
              </div>
            </div>
            <div class="point-actions">
              <el-button size="small" link type="primary" @click="editAcupoint(item)">编辑</el-button>
              <el-button size="small" link type="danger" @click="deleteAcupointItem(item)">删除</el-button>
            </div>
          </li>
        </ul>
      </section>

      <section v-else class="panel-section">
        <h3 class="section-title">新建经络</h3>
        <div class="form-block">
          <el-input v-model="newMeridianForm.name" placeholder="经络名称" clearable />
          <el-input
            v-model="newMeridianForm.description"
            type="textarea"
            :rows="3"
            placeholder="经络详细介绍（循行路线、主治病症等）"
          />
          <div class="color-row">
            <span>颜色</span>
            <el-color-picker v-model="newMeridianForm.color" />
          </div>
          <el-button type="primary" @click="addMeridian">新建经络</el-button>
        </div>

        <h3 class="section-title">经络列表 ({{ meridianList.length }})</h3>
        <div v-if="meridianList.length === 0" class="empty-tip">请先新建一条经络。</div>
        <el-radio-group v-else v-model="currentMeridianId" class="meridian-list">
          <div
            v-for="meridian in meridianList"
            :key="meridian.id"
            class="meridian-item"
            :class="{ active: currentMeridianId === meridian.id }"
          >
            <el-radio :value="meridian.id">
              <span class="meridian-color" :style="{ backgroundColor: meridian.color }"></span>
              <span class="meridian-name">{{ meridian.name }}</span>
              <span class="meridian-count">({{ meridian.pointIds.length }} 穴)</span>
            </el-radio>
            <ol v-if="meridian.pointIds.length" class="point-order-list">
              <li v-for="(name, index) in getMeridianPointNames(meridian)" :key="index">
                {{ index + 1 }}. {{ name }}
              </li>
            </ol>
            <el-button size="small" link type="primary" @click.stop="openMeridianDialog(meridian)">
              编辑介绍
            </el-button>
          </div>
        </el-radio-group>
      </section>
    </aside>

    <div class="viewer-area" :class="{ 'ruler-placement-mode': rulerPlacementActive }">
      <div ref="containerRef" class="acupuncture-model"></div>

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

    <el-dialog
      v-model="dialogVisible"
      :title="editingAcupointId ? '编辑穴位' : '添加穴位'"
      width="460px"
      :close-on-click-modal="false"
      @close="cancelSaveAcupoint"
    >
      <el-form label-width="80px">
        <el-form-item label="穴位名称">
          <el-input v-model="newPointForm.name" placeholder="请输入穴位名称" />
        </el-form-item>
        <el-form-item label="所属部位">
          <el-select v-model="newPointForm.bodyPart" placeholder="请选择部位" style="width: 100%">
            <el-option
              v-for="part in bodyPartOptions"
              :key="part"
              :label="part"
              :value="part"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="穴位颜色">
          <el-color-picker v-model="newPointForm.color" />
        </el-form-item>
        <el-form-item label="穴位介绍">
          <el-input
            v-model="newPointForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入穴位主治功效、定位说明等"
          />
        </el-form-item>
        <el-form-item v-if="currentPointCoords" label="坐标微调">
          <div class="coords-adjust">
            <div class="coord-row">
              <span class="axis-label axis-x">X</span>
              <el-input-number
                v-model="currentPointCoords.x"
                :step="0.001"
                :precision="4"
                controls-position="right"
              />
            </div>
            <div class="coord-row">
              <span class="axis-label axis-y">Y</span>
              <el-input-number
                v-model="currentPointCoords.y"
                :step="0.001"
                :precision="4"
                controls-position="right"
              />
            </div>
            <div class="coord-row">
              <span class="axis-label axis-z">Z</span>
              <el-input-number
                v-model="currentPointCoords.z"
                :step="0.001"
                :precision="4"
                controls-position="right"
              />
            </div>
          </div>
          <p class="coords-tip">红=X(左右) · 绿=Y(上下) · 蓝=Z(前后)</p>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="cancelSaveAcupoint">取消</el-button>
        <el-button type="primary" @click="saveAcupoint">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="meridianDialogVisible"
      title="编辑经络"
      width="460px"
      :close-on-click-modal="false"
      @close="cancelMeridianEdit"
    >
      <el-form label-width="80px">
        <el-form-item label="经络名称">
          <el-input v-model="meridianEditForm.name" placeholder="请输入经络名称" />
        </el-form-item>
        <el-form-item label="经络介绍">
          <el-input
            v-model="meridianEditForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入经络循行路线、主治病症等"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="meridianEditForm.color" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="cancelMeridianEdit">取消</el-button>
        <el-button type="primary" @click="saveMeridianEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.acupuncture-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.control-panel {
  position: relative;
  z-index: 20;
  width: 300px;
  flex-shrink: 0;
  padding: 16px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.panel-title {
  margin: 0 0 16px;
  font-size: 18px;
  color: #303133;
}

.mode-switch {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.mode-radio {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.mode-label {
  font-size: 14px;
  color: #606266;
}

.mode-hint {
  margin: 0 0 16px;
  padding: 10px;
  background: #f4f4f5;
  border-radius: 6px;
  color: #606266;
  font-size: 12px;
  line-height: 1.6;
}

.panel-section {
  margin-top: 8px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  color: #303133;
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.ruler-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

:global(.ruler-length-popper) {
  z-index: 4000;
}

.ruler-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ruler-orientation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ruler-orientation :deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.ruler-rotation {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #606266;
  font-size: 14px;
}

.empty-tip {
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
}

.data-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.wireframe-clip {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.wireframe-radio {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.data-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  margin-bottom: 6px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
}

.point-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.point-info > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.acupoint-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.point-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.meridian-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.meridian-item {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: border-color 0.2s, background 0.2s;
}

.meridian-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.meridian-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.meridian-name {
  font-weight: 500;
}

.meridian-count {
  color: #909399;
  font-size: 12px;
}

.point-order-list {
  margin: 8px 0 0 24px;
  padding-left: 16px;
  color: #606266;
  font-size: 13px;
}

.acupuncture-model {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.viewer-area {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.acupuncture-model :deep(canvas) {
  display: block;
}

.viewer-area.ruler-placement-mode {
  cursor: crosshair;
}

.viewer-area.ruler-placement-mode :deep(canvas) {
  cursor: crosshair;
}

.info-card {
  position: absolute;
  top: 24px;
  right: 24px;
  width: min(360px, calc(100% - 48px));
  max-height: calc(100% - 48px);
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
  max-height: 320px;
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

.coords-adjust {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.coord-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.axis-label {
  width: 18px;
  font-weight: 600;
  font-family: monospace;
}

.axis-x {
  color: #ff4d4f;
}

.axis-y {
  color: #52c41a;
}

.axis-z {
  color: #1677ff;
}

.coord-row :deep(.el-input-number) {
  flex: 1;
}

.coords-tip {
  margin: 8px 0 0;
  color: #909399;
  font-size: 12px;
}
</style>
