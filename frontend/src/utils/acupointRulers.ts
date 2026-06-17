import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { getBodyBox, normToWorld } from '@/utils/bodyCoord'

const RULER_GREEN = 0x5cb85c

function tickMesh(a: THREE.Vector3, b: THREE.Vector3, color: number) {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const len = a.distanceTo(b)
  const dir = b.clone().sub(a).normalize()
  const geo = new THREE.BoxGeometry(len, 0.004, 0.004)
  const mat = new THREE.MeshBasicMaterial({ color })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(mid)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir)
  return mesh
}

function rulerLabel(text: string, pos: THREE.Vector3) {
  const el = document.createElement('span')
  el.className = 'cun-label'
  el.textContent = text
  const label = new CSS2DObject(el)
  label.position.copy(pos)
  return label
}

/** 任脉正中竖尺（参考图绿色 1–21 寸） */
export function createRenVerticalRuler(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'ruler-ren'

  const start = normToWorld(0.5, 0.38, 0.62)
  const end = normToWorld(0.5, 0.96, 0.58)
  const divisions = 21

  const mainGeo = new THREE.BufferGeometry().setFromPoints([start, end])
  group.add(new THREE.Line(mainGeo, new THREE.LineBasicMaterial({ color: RULER_GREEN })))

  const axis = end.clone().sub(start)
  const tickDir = new THREE.Vector3(0.08, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0)

  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions
    const p = start.clone().add(axis.clone().multiplyScalar(t))
    const a = p.clone().add(tickDir)
    const b = p.clone().sub(tickDir)
    group.add(tickMesh(a, b, RULER_GREEN))
    if (i > 0 && i % 2 === 0) {
      group.add(rulerLabel(String(i), p.clone().add(new THREE.Vector3(0.1, 0, 0))))
    }
  }

  return group
}

/** 上肢/下肢旁寸径尺 */
export function createLimbCunRuler(
  name: string,
  startNorm: [number, number, number],
  endNorm: [number, number, number],
  divisions: number,
  tickSide: [number, number, number],
): THREE.Group {
  const group = new THREE.Group()
  group.name = name

  const start = normToWorld(...startNorm)
  const end = normToWorld(...endNorm)
  const mainGeo = new THREE.BufferGeometry().setFromPoints([start, end])
  group.add(new THREE.Line(mainGeo, new THREE.LineBasicMaterial({ color: RULER_GREEN })))

  const axis = end.clone().sub(start)
  const tick = new THREE.Vector3(...tickSide).multiplyScalar(0.06)

  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions
    const p = start.clone().add(axis.clone().multiplyScalar(t))
    group.add(tickMesh(p.clone().add(tick), p.clone().sub(tick), RULER_GREEN))
    if (i > 0 && (divisions <= 12 || i % 2 === 0)) {
      group.add(rulerLabel(String(i), p.clone().add(tick.clone().multiplyScalar(1.8))))
    }
  }

  return group
}

export function buildAllCunRulers(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'cun-rulers'
  if (!getBodyBox()) return root

  root.add(createRenVerticalRuler())
  root.add(
    createLimbCunRuler('ruler-arm-l', [0.22, 0.68, 0.55], [0.78, 0.48, 0.58], 12, [0, 0, 1]),
  )
  root.add(
    createLimbCunRuler('ruler-leg-l', [0.42, 0.36, 0.52], [0.38, 0.02, 0.48], 16, [1, 0, 0]),
  )

  return root
}
