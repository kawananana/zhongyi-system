<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import type { AcupointItem } from '@/api/acupoint'
import { MERIDIAN_LIST } from '@/data/meridianRoutes'
import { meridianColor, parseCoord3d } from '@/utils/acupointMeta'
import { logBodyBox, setBodyBox } from '@/utils/bodyCoord'
import { buildAllCunRulers } from '@/utils/acupointRulers'
import {
  createInternalMeridianTube,
  createMeridianTube,
  resolveMeridianPath,
  resolvePointWorld,
} from '@/utils/meridianPaths'
import {
  HUMAN_MODEL_FALLBACK_URL,
  HUMAN_MODEL_URL,
  SCENE_BG,
  alignHumanModelToAcupointSpace,
  createAsianSkinMaterial,
  forceAsianSkinMaterials,
  keepMainBodyMeshOnly,
  stripClothingMeshes,
} from '@/utils/humanModelConfig'

const props = defineProps<{
  points: AcupointItem[]
  allPoints: AcupointItem[]
  selectedId: number | null
  activeMeridian: string
  showLabels: boolean
  skinTranslucent: boolean
  flowPlaying: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  'load-progress': [percent: number]
  'model-ready': []
  'model-error': [message: string]
}>()

const containerRef = ref<HTMLElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let labelRenderer: CSS2DRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let bodyGroup: THREE.Group | null = null
let bodyMeshes: THREE.Mesh[] = []
let pointsGroup: THREE.Group | null = null
let meridiansGroup: THREE.Group | null = null
let rulersGroup: THREE.Group | null = null
let labelsGroup: THREE.Group | null = null
let raycaster: THREE.Raycaster | null = null
let pointer = new THREE.Vector2()
let animationId = 0
let disposed = false
const pointMeshes = new Map<number, THREE.Mesh>()
const labelObjects = new Map<number, CSS2DObject>()
const meridianCurves = new Map<string, THREE.CatmullRomCurve3>()
let flowMesh: THREE.Mesh | null = null
let flowCurve: THREE.CatmullRomCurve3 | null = null
let flowT = 0

function buildFallbackBody(group: THREE.Group) {
  const skin = createAsianSkinMaterial()
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), skin)
  head.position.set(0, 1.52, 0.05)
  group.add(head)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 8, 16), skin)
  torso.position.set(0, 1.02, 0)
  group.add(torso)
  const armGeo = new THREE.CapsuleGeometry(0.07, 0.42, 6, 12)
  const armL = new THREE.Mesh(armGeo, skin)
  armL.position.set(-0.48, 1.05, 0.05)
  armL.rotation.z = 0.35
  group.add(armL)
  const armR = armL.clone()
  armR.position.x = 0.48
  armR.rotation.z = -0.35
  group.add(armR)
  bodyMeshes = [head, torso, armL, armR]
  const box = new THREE.Box3().setFromObject(group)
  setBodyBox(box)
  logBodyBox(box, '简化人体')
}

function loadGlb(url: string, onProgress: (p: number) => void): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => {
        const root = new THREE.Group()
        root.add(gltf.scene)
        resolve(root)
      },
      (xhr) => {
        if (xhr.total > 0) onProgress(Math.round((xhr.loaded / xhr.total) * 100))
      },
      reject,
    )
  })
}

function collectBodyMeshes(root: THREE.Object3D) {
  bodyMeshes = []
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) bodyMeshes.push(mesh)
  })
}

function disposeRulers() {
  if (!rulersGroup) return
  rulersGroup.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) {
      mesh.geometry?.dispose()
      ;(mesh.material as THREE.Material)?.dispose()
    }
    if ((obj as THREE.Line).isLine) {
      ;(obj as THREE.Line).geometry?.dispose()
      ;((obj as THREE.Line).material as THREE.Material)?.dispose()
    }
  })
  rulersGroup.clear()
}

function rebuildRulers() {
  if (!rulersGroup) return
  disposeRulers()
  const rulers = buildAllCunRulers()
  rulersGroup.add(rulers)
}

function syncBodyBoxAndOverlay(modelRoot: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(modelRoot)
  setBodyBox(box)
  logBodyBox(box)
  rebuildRulers()
  rebuildMeridians()
  rebuildPoints()
  rebuildLabels()
}

async function loadHumanModel() {
  if (!bodyGroup) return
  emit('load-progress', 5)
  const urls = [HUMAN_MODEL_URL, HUMAN_MODEL_FALLBACK_URL]
  let lastErr: unknown
  for (const url of urls) {
    try {
      const base = url === HUMAN_MODEL_URL ? 10 : 55
      const span = url === HUMAN_MODEL_URL ? 75 : 35
      const modelRoot = await loadGlb(url, (p) =>
        emit('load-progress', Math.min(95, base + Math.round((p / 100) * span))),
      )
      keepMainBodyMeshOnly(modelRoot)
      stripClothingMeshes(modelRoot)
      alignHumanModelToAcupointSpace(modelRoot)
      forceAsianSkinMaterials(modelRoot)
      bodyGroup.clear()
      bodyGroup.add(modelRoot)
      collectBodyMeshes(modelRoot)
      applySkinOpacity(props.skinTranslucent)
      syncBodyBoxAndOverlay(modelRoot)
      emit('load-progress', 100)
      emit('model-ready')
      return
    } catch (e) {
      lastErr = e
    }
  }
  buildFallbackBody(bodyGroup)
  syncBodyBoxAndOverlay(bodyGroup)
  emit('model-error', lastErr instanceof Error ? lastErr.message : '模型加载失败')
  emit('model-ready')
}

function applySkinOpacity(translucent: boolean) {
  const opacity = translucent ? 0.35 : 1
  bodyMeshes.forEach((mesh) => {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => {
      if (m instanceof THREE.MeshStandardMaterial) {
        m.transparent = translucent
        m.opacity = opacity
        m.depthWrite = !translucent
      }
    })
  })
}

function clearMeridians() {
  if (!meridiansGroup) return
  meridianCurves.clear()
  meridiansGroup.children.slice().forEach((child) => {
    const mesh = child as THREE.Mesh
    mesh.geometry?.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m) => (m as THREE.Material)?.dispose?.())
    meridiansGroup!.remove(child)
  })
  if (flowMesh) {
    meridiansGroup.remove(flowMesh)
    flowMesh.geometry.dispose()
    ;(flowMesh.material as THREE.Material).dispose()
    flowMesh = null
  }
  flowCurve = null
}

function rebuildMeridians() {
  if (!meridiansGroup) return
  clearMeridians()
  const targets =
    props.activeMeridian !== 'all' ? [props.activeMeridian] : MERIDIAN_LIST

  targets.forEach((name) => {
    const pts = resolveMeridianPath(name, props.allPoints)
    if (!pts) return
    const active = props.activeMeridian === name || props.activeMeridian === 'all'
    const color = meridianColor(name)
    const opacity = props.activeMeridian === 'all' ? 0.4 : active ? 0.85 : 0.12
    const radius = props.activeMeridian === name ? 0.016 : 0.01
    const lineOpacity = props.activeMeridian === name ? 0.88 : opacity
    const { mesh, curve } = createMeridianTube(pts, color, radius, lineOpacity)
    mesh.visible = active || props.activeMeridian === 'all'
    meridiansGroup!.add(mesh)
    meridianCurves.set(name, curve)
    if (props.activeMeridian === name) {
      flowCurve = curve
      const internal = createInternalMeridianTube(name)
      if (internal) meridiansGroup!.add(internal.mesh)
    }
  })

  if (props.flowPlaying && flowCurve) ensureFlowParticle()
}

function ensureFlowParticle() {
  if (!meridiansGroup || !flowCurve) return
  if (flowMesh) return
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfff4a8,
    emissive: 0xffaa00,
    emissiveIntensity: 1.2,
  })
  flowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), mat)
  flowMesh.renderOrder = 20
  meridiansGroup.add(flowMesh)
  flowT = 0
}

function rebuildPoints() {
  if (!pointsGroup) return
  pointMeshes.forEach((m) => {
    pointsGroup!.remove(m)
    m.geometry.dispose()
    ;(m.material as THREE.Material).dispose()
  })
  pointMeshes.clear()

  props.points.forEach((p) => {
    const pos = resolvePointWorld(p)
    if (!pos) return
    const color = meridianColor(p.meridian)
    const isSelected = props.selectedId === p.id
    const isActiveMer =
      props.activeMeridian === 'all' || p.meridian === props.activeMeridian
    const size = isSelected ? 0.045 : isActiveMer ? 0.032 : 0.022
    const mat = new THREE.MeshStandardMaterial({
      color: isActiveMer ? 0xfff9e6 : color,
      emissive: isActiveMer ? color : 0x222222,
      emissiveIntensity: isSelected ? 1 : isActiveMer ? 0.65 : 0.1,
      roughness: 0.35,
    })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), mat)
    mesh.position.copy(pos)
    mesh.userData = { id: p.id }
    mesh.renderOrder = 10
    pointsGroup!.add(mesh)
    pointMeshes.set(p.id, mesh)
  })
}

function rebuildLabels() {
  if (!labelsGroup) return
  labelObjects.forEach((label) => labelsGroup!.remove(label))
  labelObjects.clear()
  props.points.forEach((p) => {
    const pos = resolvePointWorld(p)
    if (!pos) return
    const el = document.createElement('span')
    el.className = 'acu-label'
    el.textContent = p.pointName
    const label = new CSS2DObject(el)
    label.position.set(pos.x, pos.y + 0.06, pos.z)
    labelsGroup!.add(label)
    labelObjects.set(p.id, label)
  })
}

function onPointerDown(event: PointerEvent) {
  if (!containerRef.value || !camera || !raycaster) return
  const rect = containerRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(Array.from(pointMeshes.values()), false)
  if (hits.length > 0) emit('select', hits[0].object.userData.id as number)
}

function updateFlow(delta: number) {
  if (!props.flowPlaying || !flowCurve || !flowMesh) {
    if (flowMesh) flowMesh.visible = false
    return
  }
  flowMesh.visible = true
  flowT = (flowT + delta * 0.25) % 1
  const pos = flowCurve.getPointAt(flowT)
  flowMesh.position.copy(pos)
}

function animate() {
  if (!renderer || !scene || !camera || disposed) return
  controls?.update()
  updateFlow(0.016)
  animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
  if (labelRenderer && containerRef.value) {
    labelRenderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
    labelRenderer.render(scene, camera)
  }
}

function onResize() {
  if (!containerRef.value || !camera || !renderer) return
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  labelRenderer?.setSize(w, h)
}

async function initScene() {
  const el = containerRef.value
  if (!el) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(SCENE_BG)
  scene.fog = new THREE.Fog(SCENE_BG, 10, 16)

  const w = el.clientWidth
  const h = el.clientHeight
  camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50)
  camera.position.set(0, 0.95, 3.4)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(w, h)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  el.appendChild(labelRenderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.target.set(0, 0.55, 0)
  controls.minDistance = 1.6
  controls.maxDistance = 5.5

  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const key = new THREE.DirectionalLight(0xffffff, 0.8)
  key.position.set(3, 5, 3)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xffffff, 0.3)
  fill.position.set(-3, 2, -3)
  scene.add(fill)

  bodyGroup = new THREE.Group()
  meridiansGroup = new THREE.Group()
  rulersGroup = new THREE.Group()
  pointsGroup = new THREE.Group()
  labelsGroup = new THREE.Group()
  scene.add(bodyGroup, meridiansGroup, rulersGroup, pointsGroup, labelsGroup)

  raycaster = new THREE.Raycaster()
  rebuildMeridians()
  rebuildPoints()
  rebuildLabels()
  await loadHumanModel()

  if (!disposed) {
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onResize)
    animate()
  }
}

function disposeScene() {
  disposed = true
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  if (renderer) {
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.dispose()
    renderer.domElement.remove()
  }
  labelRenderer?.domElement.remove()
  pointMeshes.forEach((m) => {
    m.geometry.dispose()
    ;(m.material as THREE.Material).dispose()
  })
  clearMeridians()
  bodyGroup?.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) {
      mesh.geometry?.dispose()
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => (m as THREE.Material)?.dispose?.())
    }
  })
  controls?.dispose()
  renderer = null
  labelRenderer = null
  scene = null
  camera = null
  controls = null
  bodyGroup = null
  pointsGroup = null
  meridiansGroup = null
  rulersGroup = null
  labelsGroup = null
}

onMounted(() => {
  disposed = false
  initScene()
})
onUnmounted(() => disposeScene())

watch(
  () => [props.points, props.selectedId, props.activeMeridian, props.showLabels],
  () => {
    rebuildPoints()
    rebuildLabels()
  },
  { deep: true },
)

watch(
  () => [props.allPoints, props.activeMeridian],
  () => rebuildMeridians(),
  { deep: true },
)

watch(
  () => props.skinTranslucent,
  () => applySkinOpacity(props.skinTranslucent),
)

watch(
  () => props.flowPlaying,
  (playing) => {
    if (playing) {
      rebuildMeridians()
      ensureFlowParticle()
    } else if (flowMesh) {
      flowMesh.visible = false
    }
  },
)

defineExpose({
  resetCamera() {
    if (!camera || !controls) return
    camera.position.set(0, 0.95, 3.4)
    controls.target.set(0, 0.55, 0)
    controls.update()
  },
  focusPoint(id: number) {
    const mesh = pointMeshes.get(id)
    if (!mesh || !camera || !controls) return
    const target = mesh.position.clone()
    controls.target.copy(target)
    const offset = new THREE.Vector3(0.35, 0.15, 0.85).normalize().multiplyScalar(1.4)
    camera.position.copy(target).add(offset)
    controls.update()
  },
})
</script>

<template>
  <div ref="containerRef" class="scene-root" />
</template>

<style scoped>
.scene-root {
  width: 100%;
  height: 100%;
  min-height: 480px;
  touch-action: none;
  position: relative;
}

.scene-root :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.scene-root :deep(.acu-label) {
  padding: 2px 6px;
  font-size: 11px;
  color: #3d3830;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 4px;
  border: 1px solid rgba(201, 166, 107, 0.6);
  white-space: nowrap;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.scene-root :deep(.cun-label) {
  font-size: 10px;
  color: #3d7a3d;
  font-weight: 600;
  text-shadow: 0 0 2px #fff;
  pointer-events: none;
}
</style>
