import * as THREE from 'three'
import type { Coord3d } from '@/utils/acupointMeta'

/** 与 seed_acupoints / 旧版对齐后的人体范围一致 */
export const LEGACY_BODY_BOX = {
  min: new THREE.Vector3(-0.2, -0.72, -0.391),
  max: new THREE.Vector3(0.2, 1.65, 0.391),
}

let currentBodyBox: THREE.Box3 | null = null

export function setBodyBox(box: THREE.Box3) {
  currentBodyBox = box.clone()
}

export function getBodyBox(): THREE.Box3 | null {
  return currentBodyBox
}

/** 归一化坐标 [0,1]：x 左右、y 脚→头、z 后→前 */
export function normToWorld(nx: number, ny: number, nz: number, box?: THREE.Box3 | null): THREE.Vector3 {
  const b = box ?? currentBodyBox
  if (!b) return new THREE.Vector3(nx, ny, nz)
  const size = b.getSize(new THREE.Vector3())
  return new THREE.Vector3(
    b.min.x + nx * size.x,
    b.min.y + ny * size.y,
    b.min.z + nz * size.z,
  )
}

/** 数据库里的绝对坐标 → 按当前模型包围盒缩放 */
export function remapLegacyCoord(c: Coord3d, box?: THREE.Box3 | null): Coord3d {
  const b = box ?? currentBodyBox
  if (!b) return c
  const leg = LEGACY_BODY_BOX
  const legSize = leg.max.clone().sub(leg.min)
  const nx = legSize.x > 0 ? (c.x - leg.min.x) / legSize.x : 0.5
  const ny = legSize.y > 0 ? (c.y - leg.min.y) / legSize.y : 0.5
  const nz = legSize.z > 0 ? (c.z - leg.min.z) / legSize.z : 0.5
  const size = b.getSize(new THREE.Vector3())
  return {
    x: b.min.x + nx * size.x,
    y: b.min.y + ny * size.y,
    z: b.min.z + nz * size.z,
  }
}

export function logBodyBox(box: THREE.Box3, label = '人体包围盒') {
  const min = box.min
  const max = box.max
  console.info(
    `[3D针灸] ${label} min:`,
    { x: min.x.toFixed(3), y: min.y.toFixed(3), z: min.z.toFixed(3) },
    'max:',
    { x: max.x.toFixed(3), y: max.y.toFixed(3), z: max.z.toFixed(3) },
  )
}
