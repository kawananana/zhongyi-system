import * as THREE from 'three'

const SURFACE_OFFSET = 0.004
const MIN_FRONT_NORMAL_Z = 0.15
const MIN_BACK_NORMAL_Z = -0.15
const MIN_MEDIAL_NORMAL_X = 0.15
const RAY_ORIGIN_Z = 0.5
const RAY_ORIGIN_X = 0.5
const MIDLINE_X_THRESHOLD = 0.015

function getWorldNormal(hit) {
  if (!hit?.face?.normal) return new THREE.Vector3(0, 0, 1)
  return hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
}

function roundCoord(value) {
  return Math.round(value * 1e6) / 1e6
}

function raycastAlong(model, raycaster, origin, direction) {
  raycaster.set(origin, direction.clone().normalize())
  return raycaster.intersectObject(model, true)
}

function pickBestHit(hits, targetX, targetY, filterFn) {
  let best = null
  let bestScore = Infinity

  for (const hit of hits) {
    if (!filterFn(hit)) continue

    const dx = hit.point.x - targetX
    const dy = hit.point.y - targetY
    const score = dx * dx + dy * dy
    if (score < bestScore) {
      bestScore = score
      best = hit
    }
  }

  return best
}

function isFrontHit(hit) {
  return getWorldNormal(hit).z >= MIN_FRONT_NORMAL_Z
}

function isBackHit(hit) {
  return getWorldNormal(hit).z <= MIN_BACK_NORMAL_Z
}

function isMedialHit(hit, side) {
  const nx = getWorldNormal(hit).x
  return side === 'left' ? nx >= MIN_MEDIAL_NORMAL_X : nx <= -MIN_MEDIAL_NORMAL_X
}

function isLateralHit(hit, side) {
  const nx = getWorldNormal(hit).x
  return side === 'left' ? nx <= -MIN_MEDIAL_NORMAL_X : nx >= MIN_MEDIAL_NORMAL_X
}

function findHitOnSurface(model, raycaster, x, y, surface, side = 'left') {
  const probeX = Math.max(Math.abs(x), 0.08)
  const setups = {
    front: [
      [new THREE.Vector3(x, y, RAY_ORIGIN_Z), new THREE.Vector3(0, 0, -1), isFrontHit],
    ],
    back: [
      [new THREE.Vector3(x, y, -RAY_ORIGIN_Z), new THREE.Vector3(0, 0, 1), isBackHit],
    ],
    medial: [
      [new THREE.Vector3(x + probeX + 0.15, y, 0), new THREE.Vector3(-1, 0, 0), (hit) => isMedialHit(hit, side)],
      [new THREE.Vector3(x - probeX - 0.15, y, 0), new THREE.Vector3(1, 0, 0), (hit) => isMedialHit(hit, side === 'left' ? 'right' : 'left')],
    ],
    lateral: [
      [new THREE.Vector3(x - probeX - 0.15, y, 0), new THREE.Vector3(1, 0, 0), (hit) => isLateralHit(hit, side)],
      [new THREE.Vector3(x + probeX + 0.15, y, 0), new THREE.Vector3(-1, 0, 0), (hit) => isLateralHit(hit, side === 'left' ? 'right' : 'left')],
    ],
  }

  const rays = setups[surface] || setups.front
  for (const [origin, direction, filterFn] of rays) {
    const hit = pickBestHit(raycastAlong(model, raycaster, origin, direction), x, y, filterFn)
    if (hit) return hit
  }
  return null
}

function positionFromHit(hit, x, y, useHitX = false, useHitY = false) {
  const normal = getWorldNormal(hit)
  const point = hit.point.clone().add(normal.multiplyScalar(SURFACE_OFFSET))

  return {
    x: roundCoord(useHitX ? hit.point.x : x),
    y: roundCoord(useHitY ? hit.point.y : y),
    z: roundCoord(point.z),
  }
}

/** 内外侧贴合落到轮廓线 (|z|≈0) 时，回退到加宽 x 的前侧表面 */
function refineWeakSurfaceSnap(model, raycaster, targetX, targetY, surface, snapped) {
  if (!snapped || surface === 'back' || Math.abs(snapped.z) >= 0.03) return snapped

  const side = targetX >= 0 ? 'right' : 'left'
  const fallbackX = Math.abs(targetX) >= 0.13 ? 0.14 : 0.11
  const x = side === 'left' ? -fallbackX : fallbackX
  const hit = findHitOnSurface(model, raycaster, x, targetY, 'front', side)
  if (!hit) return snapped

  const refined = positionFromHit(hit, x, targetY, false)
  return Math.abs(refined.z) > Math.abs(snapped.z) ? refined : snapped
}

function searchBestHit(model, raycaster, targetX, targetY, surface, side) {
  const xAbs = Math.abs(targetX)
  const sign = targetX >= 0 ? 1 : -1
  const yOffsets = [0, -0.004, 0.004, -0.008, 0.008, -0.012, 0.012]
  const maxXDelta = surface === 'front' || surface === 'back' ? 0.06 : 0.12
  let bestHit = null
  let bestScore = Infinity

  for (const yOff of yOffsets) {
    const y = targetY + yOff
    const xValues = new Set()

    xValues.add(xAbs)
    for (let scale = 0.95; scale >= 0.7; scale -= 0.05) {
      xValues.add(xAbs * scale)
    }
    for (let dx = 0.004; dx <= maxXDelta; dx += 0.004) {
      xValues.add(xAbs + dx)
      if (xAbs > dx) xValues.add(xAbs - dx)
    }

    for (const xMag of xValues) {
      const hit = findHitOnSurface(model, raycaster, sign * xMag, y, surface, side)
      if (!hit) continue

      const dx = hit.point.x - targetX
      const dy = hit.point.y - targetY
      const score = dx * dx + dy * dy
      if (score < bestScore) {
        bestScore = score
        bestHit = hit
      }
    }
  }

  return bestHit
}

function snapMidline(model, raycaster, targetY, surface = 'front') {
  let bestZ = null

  for (let xProbe = 0.02; xProbe <= 0.25; xProbe += 0.005) {
    const left = findHitOnSurface(model, raycaster, -xProbe, targetY, surface, 'left')
    const right = findHitOnSurface(model, raycaster, xProbe, targetY, surface, 'right')

    for (const hit of [left, right]) {
      if (!hit) continue
      const z = hit.point.z
      const isBetter =
        surface === 'back'
          ? bestZ === null || z < bestZ
          : bestZ === null || z > bestZ
      if (isBetter) {
        bestZ = z
      }
    }
  }

  if (bestZ === null) return null

  return {
    x: 0,
    y: roundCoord(targetY),
    z: roundCoord(bestZ + (surface === 'back' ? -SURFACE_OFFSET : SURFACE_OFFSET)),
  }
}

function snapLateral(model, raycaster, targetX, targetY, surface, side) {
  const useHitX = surface !== 'front'
  const direct = findHitOnSurface(model, raycaster, targetX, targetY, surface, side)
  if (direct) {
    return positionFromHit(direct, targetX, targetY, useHitX)
  }

  const bestHit = searchBestHit(model, raycaster, targetX, targetY, surface, side)
  if (!bestHit) {
    if (surface !== 'front') {
      return snapLateral(model, raycaster, targetX, targetY, 'front', side)
    }
    return null
  }

  const surfaceX = bestHit.point.x
  const refined = findHitOnSurface(model, raycaster, surfaceX, targetY, surface, side)
  if (refined) {
    return positionFromHit(refined, refined.point.x, targetY, useHitX)
  }

  return positionFromHit(bestHit, bestHit.point.x, bestHit.point.y, useHitX)
}

/**
 * 将 (targetX, targetY) 投射到模型表面。
 * @param {'front'|'back'|'medial'|'lateral'} surface
 */
export function snapAcupointToModelSurface(model, raycaster, targetX, targetY, surface = 'front') {
  if (!model || !raycaster) return null

  const side = targetX >= 0 ? 'right' : 'left'
  const isMidline = Math.abs(targetX) < MIDLINE_X_THRESHOLD

  if (isMidline) {
    return snapMidline(model, raycaster, targetY, surface)
  }

  const snapped = snapLateral(model, raycaster, targetX, targetY, surface, side)
  return refineWeakSurfaceSnap(model, raycaster, targetX, targetY, surface, snapped)
}

/** 精确贴合：使用射线命中点的 x/y/z（用于下肢等需落在真实表面的穴位） */
export function snapAcupointExact(model, raycaster, targetX, targetY, surface = 'front') {
  if (!model || !raycaster) return null

  const side = targetX >= 0 ? 'right' : 'left'
  const isMidline = Math.abs(targetX) < MIDLINE_X_THRESHOLD

  if (isMidline) {
    return snapMidline(model, raycaster, targetY, surface)
  }

  const direct = findHitOnSurface(model, raycaster, targetX, targetY, surface, side)
  if (direct) {
    return positionFromHit(direct, targetX, targetY, true, true)
  }

  const bestHit = searchBestHit(model, raycaster, targetX, targetY, surface, side)
  if (!bestHit) {
    if (surface !== 'front') {
      return snapAcupointExact(model, raycaster, targetX, targetY, 'front')
    }
    return null
  }

  const surfaceX = bestHit.point.x
  const refined = findHitOnSurface(model, raycaster, surfaceX, targetY, surface, side)
  if (refined) {
    return positionFromHit(refined, refined.point.x, targetY, true, true)
  }

  return positionFromHit(bestHit, bestHit.point.x, bestHit.point.y, true, true)
}

/** 快速投射：优先直接命中，用于运行时批量贴合已烘焙坐标 */
export function snapAcupointQuick(model, raycaster, targetX, targetY, surface = 'front') {
  if (!model || !raycaster) return null

  const side = targetX >= 0 ? 'right' : 'left'
  const isMidline = Math.abs(targetX) < MIDLINE_X_THRESHOLD

  if (isMidline) {
    return snapMidline(model, raycaster, targetY, surface)
  }

  const direct = findHitOnSurface(model, raycaster, targetX, targetY, surface, side)
  if (direct) {
    const pos = positionFromHit(direct, targetX, targetY, surface !== 'front')
    return refineWeakSurfaceSnap(model, raycaster, targetX, targetY, surface, pos)
  }

  const lateral = snapLateral(model, raycaster, targetX, targetY, surface, side)
  return refineWeakSurfaceSnap(model, raycaster, targetX, targetY, surface, lateral)
}

export function getAcupointDisplayPosition(acupoint, model, raycaster) {
  if (!acupoint || !model || !raycaster) {
    return acupoint ? { x: acupoint.x, y: acupoint.y, z: acupoint.z } : null
  }

  if (acupoint.bodyPart === '胸腹' || acupoint.bodyPart === '下肢') {
    const surface = acupoint.surface || 'front'
    const snapped = snapAcupointToModelSurface(model, raycaster, acupoint.x, acupoint.y, surface)
    return snapped || { x: acupoint.x, y: acupoint.y, z: acupoint.z }
  }

  return { x: acupoint.x, y: acupoint.y, z: acupoint.z }
}
