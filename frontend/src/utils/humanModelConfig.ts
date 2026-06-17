import * as THREE from 'three'

export const BODY_COORD = {
  feetY: -0.72,
  headY: 1.65,
} as const

export const ASIAN_SKIN = {
  base: 0xedcdb8,
  roughness: 0.7,
  metalness: 0.08,
} as const

export const SCENE_BG = 0xf0ebe0

export const HUMAN_MODEL_URL = '/models/human-body.glb?v=4'
export const HUMAN_MODEL_FALLBACK_URL = '/models/human-male.glb?v=4'

const CLOTHING_NAME_RE =
  /pants|brief|underwear|cloth|skirt|shorts|trouser|内裤|裤|衣|鞋|sock|shoe|cube|box|plane|helper|empty/i

export function targetBodyHeight() {
  return BODY_COORD.headY - BODY_COORD.feetY
}

export function alignHumanModelToAcupointSpace(model: THREE.Object3D) {
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  if (size.y < 1e-6) return

  const scale = targetBodyHeight() / size.y
  model.scale.setScalar(scale)
  model.updateMatrixWorld(true)

  const scaled = new THREE.Box3().setFromObject(model)
  const center = scaled.getCenter(new THREE.Vector3())
  model.position.set(-center.x, BODY_COORD.feetY - scaled.min.y, -center.z)
}

/** 只保留面数最多的人体网格，删掉 GLB 里多余的方块/辅助体 */
export function keepMainBodyMeshOnly(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = []
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh) meshes.push(mesh)
  })
  if (meshes.length <= 1) return

  let main = meshes[0]
  let maxVerts = 0
  for (const m of meshes) {
    const n = m.geometry?.attributes?.position?.count ?? 0
    if (n > maxVerts) {
      maxVerts = n
      main = m
    }
  }

  for (const m of meshes) {
    if (m === main) continue
    const n = `${m.name} ${m.parent?.name ?? ''}`
    if (CLOTHING_NAME_RE.test(n) || (m.geometry?.attributes?.position?.count ?? 0) < maxVerts * 0.08) {
      m.parent?.remove(m)
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      mats.forEach((mat) => (mat as THREE.Material)?.dispose?.())
    }
  }
}

export function stripClothingMeshes(root: THREE.Object3D) {
  const toRemove: THREE.Object3D[] = []
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const n = `${mesh.name} ${mesh.parent?.name ?? ''}`
    if (CLOTHING_NAME_RE.test(n)) toRemove.push(mesh)
  })
  toRemove.forEach((mesh) => {
    mesh.parent?.remove(mesh)
    const m = mesh as THREE.Mesh
    m.geometry?.dispose()
    const mats = Array.isArray(m.material) ? m.material : [m.material]
    mats.forEach((mat) => (mat as THREE.Material)?.dispose?.())
  })
}

export function forceAsianSkinMaterials(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return

    const old = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    old.forEach((m) => {
      if (m && 'dispose' in m) (m as THREE.Material).dispose()
    })

    mesh.material = new THREE.MeshStandardMaterial({
      color: ASIAN_SKIN.base,
      roughness: ASIAN_SKIN.roughness,
      metalness: ASIAN_SKIN.metalness,
    })
    mesh.castShadow = true
    mesh.receiveShadow = true
  })
}

export function createAsianSkinMaterial() {
  return new THREE.MeshStandardMaterial({
    color: ASIAN_SKIN.base,
    roughness: ASIAN_SKIN.roughness,
    metalness: ASIAN_SKIN.metalness,
  })
}

export const enhanceSkinMaterials = forceAsianSkinMaterials
