/**
 * 经络穴位归一化坐标 norm [0,1]：x 左→右, y 脚→头, z 后→前
 */
export interface MeridianPointDef {
  name: string
  norm: [number, number, number]
}

export interface MeridianDef {
  key: string
  name: string
  color: number
  /** 胸腹体内循行（半透明） */
  internalNorm?: [number, number, number][]
  points: MeridianPointDef[]
}

export const meridiansData: Record<string, MeridianDef> = {
  肺经: {
    key: '手太阴肺经',
    name: '手太阴肺经',
    color: 0xe85d4a,
    internalNorm: [
      [0.5, 0.55, 0.52],
      [0.5, 0.62, 0.54],
      [0.5, 0.7, 0.56],
      [0.48, 0.76, 0.55],
      [0.46, 0.82, 0.52],
    ],
    points: [
      { name: '中府', norm: [0.32, 0.72, 0.72] },
      { name: '云门', norm: [0.34, 0.74, 0.73] },
      { name: '天府', norm: [0.28, 0.68, 0.7] },
      { name: '侠白', norm: [0.24, 0.66, 0.68] },
      { name: '尺泽', norm: [0.22, 0.7, 0.68] },
      { name: '孔最', norm: [0.2, 0.64, 0.66] },
      { name: '列缺', norm: [0.18, 0.66, 0.7] },
      { name: '经渠', norm: [0.16, 0.6, 0.68] },
      { name: '太渊', norm: [0.14, 0.56, 0.66] },
      { name: '鱼际', norm: [0.12, 0.5, 0.62] },
      { name: '少商', norm: [0.1, 0.46, 0.58] },
    ],
  },
  三焦: {
    key: '手少阳三焦经',
    name: '手少阳三焦经',
    color: 0xffaa00,
    points: [
      { name: '关冲', norm: [0.78, 0.43, 0.58] },
      { name: '液门', norm: [0.77, 0.45, 0.59] },
      { name: '中渚', norm: [0.76, 0.47, 0.6] },
      { name: '阳池', norm: [0.74, 0.5, 0.61] },
      { name: '外关', norm: [0.68, 0.58, 0.52] },
      { name: '支沟', norm: [0.66, 0.62, 0.54] },
      { name: '天井', norm: [0.62, 0.68, 0.55] },
      { name: '肩髎', norm: [0.55, 0.76, 0.48] },
      { name: '翳风', norm: [0.48, 0.92, 0.42] },
      { name: '角孙', norm: [0.44, 0.96, 0.45] },
      { name: '耳门', norm: [0.46, 0.94, 0.5] },
      { name: '丝竹空', norm: [0.43, 0.95, 0.48] },
    ],
  },
  小肠: {
    key: '手太阳小肠经',
    name: '手太阳小肠经',
    color: 0xffd166,
    points: [
      { name: '后溪', norm: [0.82, 0.52, 0.38] },
      { name: '小海', norm: [0.72, 0.66, 0.52] },
      { name: '肩贞', norm: [0.58, 0.74, 0.4] },
      { name: '听宫', norm: [0.48, 0.91, 0.48] },
    ],
  },
}
