import * as THREE from 'three'
import type { AcupointItem } from '@/api/acupoint'
import { MERIDIAN_ROUTES, MERIDIAN_SHORT } from '@/data/meridianRoutes'
import { meridiansData, type MeridianDef } from '@/data/meridiansData'
import { getBodyBox, normToWorld, remapLegacyCoord } from '@/utils/bodyCoord'
import { meridianColor, parseCoord3d } from '@/utils/acupointMeta'

function meridianDataKey(meridian: string) {
  return MERIDIAN_SHORT[meridian] ?? meridian
}

export function resolveMeridianPath(
  meridian: string,
  allPoints: AcupointItem[],
): THREE.Vector3[] | null {
  const order = MERIDIAN_ROUTES[meridian]
  if (!order?.length) return null

  const box = getBodyBox()
  const byName = new Map(allPoints.filter((p) => p.meridian === meridian).map((p) => [p.pointName, p]))
  const staticDef = meridiansData[meridianDataKey(meridian)]
  const staticByName = new Map(staticDef?.points.map((p) => [p.name, p.norm]) ?? [])

  const vectors: THREE.Vector3[] = []
  for (const name of order) {
    const item = byName.get(name)
    const raw = parseCoord3d(item?.coord3d)
    if (raw) {
      const c = remapLegacyCoord(raw, box)
      vectors.push(new THREE.Vector3(c.x, c.y, c.z))
      continue
    }
    const norm = staticByName.get(name)
    if (norm) vectors.push(normToWorld(norm[0], norm[1], norm[2], box))
  }

  return vectors.length >= 2 ? vectors : null
}

export function resolvePointWorld(item: AcupointItem): THREE.Vector3 | null {
  const raw = parseCoord3d(item.coord3d)
  if (!raw) return null
  const c = remapLegacyCoord(raw, getBodyBox())
  return new THREE.Vector3(c.x, c.y, c.z)
}

export function createMeridianTube(
  points: THREE.Vector3[],
  color: number,
  radius = 0.012,
  opacity = 0.65,
) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
  const segments = Math.max(40, points.length * 14)
  const geo = new THREE.TubeGeometry(curve, segments, radius, 8, false)
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = 5
  return { mesh, curve }
}

export function getMeridianDef(meridian: string): MeridianDef | undefined {
  return meridiansData[meridianDataKey(meridian)]
}

/** 参考图：胸腹体内发光循行 */
export function createInternalMeridianTube(meridian: string) {
  const def = getMeridianDef(meridian)
  const norms = def?.internalNorm
  if (!norms || norms.length < 2) return null
  const pts = norms.map((n) => normToWorld(n[0], n[1], n[2]))
  return createMeridianTube(pts, 0xfff3c4, 0.018, 0.45)
}

export function colorHexToCss(hex: number) {
  const r = (hex >> 16) & 255
  const g = (hex >> 8) & 255
  const b = hex & 255
  return `rgb(${r},${g},${b})`
}

export function meridianCssColor(meridian: string) {
  return colorHexToCss(meridianColor(meridian))
}
