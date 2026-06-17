export interface Coord3d {
  x: number
  y: number
  z: number
}

export function parseCoord3d(raw?: string): Coord3d | null {
  if (!raw?.trim()) return null
  try {
    const o = JSON.parse(raw) as Coord3d
    if (typeof o.x === 'number' && typeof o.y === 'number' && typeof o.z === 'number') {
      return o
    }
  } catch {
    /* ignore */
  }
  return null
}

export const MERIDIAN_OPTIONS = [
  { value: 'all', label: '全部经络' },
  { value: '任脉', label: '任脉' },
  { value: '督脉', label: '督脉' },
  { value: '手太阴肺经', label: '手太阴肺经' },
  { value: '手阳明大肠经', label: '手阳明大肠经' },
  { value: '足阳明胃经', label: '足阳明胃经' },
  { value: '足太阴脾经', label: '足太阴脾经' },
  { value: '手少阴心经', label: '手少阴心经' },
  { value: '手太阳小肠经', label: '手太阳小肠经' },
  { value: '足太阳膀胱经', label: '足太阳膀胱经' },
  { value: '足少阴肾经', label: '足少阴肾经' },
  { value: '手厥阴心包经', label: '手厥阴心包经' },
  { value: '手少阳三焦经', label: '手少阳三焦经' },
  { value: '足少阳胆经', label: '足少阳胆经' },
  { value: '足厥阴肝经', label: '足厥阴肝经' },
] as const

export const REGION_OPTIONS = [
  { value: 'all', label: '全部部位' },
  { value: 'head', label: '头面' },
  { value: 'chest', label: '胸膺' },
  { value: 'abdomen', label: '腹部' },
  { value: 'back', label: '背腰' },
  { value: 'arm', label: '上肢' },
  { value: 'leg', label: '下肢' },
  { value: 'limb', label: '四肢' },
] as const

export function matchRegion(coord: Coord3d | null, region: string) {
  if (!region || region === 'all' || !coord) return true
  const { x, y } = coord
  const ax = Math.abs(x)
  switch (region) {
    case 'head':
      return y > 1.15
    case 'chest':
      return y > 0.75 && y <= 1.15
    case 'abdomen':
      return y > 0.35 && y <= 0.85
    case 'back':
      return y > 0.35 && y <= 1.2
    case 'arm':
      return ax > 0.45 && y > 0.5
    case 'leg':
      return y <= 0.35
    case 'limb':
      return y <= 0.85 && (ax > 0.4 || y <= 0.4)
    default:
      return true
  }
}

const MERIDIAN_COLORS: Record<string, number> = {
  任脉: 0xe8b4b8,
  督脉: 0xf0d78c,
  手太阴肺经: 0xe85d4a,
  手阳明大肠经: 0xa8d8a8,
  足阳明胃经: 0xf5a962,
  足太阴脾经: 0xc9b8e8,
  手少阴心经: 0xff6b6b,
  手太阳小肠经: 0xffd166,
  足太阳膀胱经: 0x6bc9a8,
  足少阴肾经: 0x4a6fa5,
  手厥阴心包经: 0xff8fab,
  手少阳三焦经: 0xffaa00,
  足少阳胆经: 0x9ad0f5,
  足厥阴肝经: 0x8bc34a,
}

export function meridianColor(meridian: string) {
  return MERIDIAN_COLORS[meridian] ?? 0xffcc66
}
