export interface HerbMapTile {
  id: number
  label: string
  icon: string
  /** grid column 1-based */
  col: number
  /** grid row 1-based */
  row: number
}

/** 外圈环形寻药路径，共 16 格 */
export const HERB_MAP_TILES: HerbMapTile[] = [
  { id: 0, label: '药王庙', icon: '🏡', col: 1, row: 4 },
  { id: 1, label: '燕山采药径', icon: '🌲', col: 2, row: 4 },
  { id: 2, label: '太行茯苓谷', icon: '⛰️', col: 3, row: 4 },
  { id: 3, label: '黄河枸杞滩', icon: '🌊', col: 4, row: 4 },
  { id: 4, label: '秦岭当归岭', icon: '🏔️', col: 5, row: 4 },
  { id: 5, label: '巴蜀川芎坞', icon: '🎋', col: 6, row: 4 },
  { id: 6, label: '云贵三七坪', icon: '🌿', col: 6, row: 3 },
  { id: 7, label: '岭南陈皮村', icon: '🍊', col: 6, row: 2 },
  { id: 8, label: '终南药圃', icon: '🌱', col: 6, row: 1 },
  { id: 9, label: '吴越灵芝洞', icon: '🍄', col: 5, row: 1 },
  { id: 10, label: '齐鲁阿胶坊', icon: '🏺', col: 4, row: 1 },
  { id: 11, label: '关中黄芪原', icon: '☀️', col: 3, row: 1 },
  { id: 12, label: '河西枸杞田', icon: '🌾', col: 2, row: 1 },
  { id: 13, label: '长白山参场', icon: '🦌', col: 1, row: 1 },
  { id: 14, label: '漠北甘草坡', icon: '🐪', col: 1, row: 2 },
  { id: 15, label: '江南薄荷溪', icon: '💧', col: 1, row: 3 },
]

export const HERB_MAP_LAST_INDEX = HERB_MAP_TILES.length - 1

export const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'] as const
