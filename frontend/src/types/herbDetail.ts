/** 药材详情页结构化内容（与库表 detail_content JSON 对应） */
export interface HerbDetailContent {
  intro?: string
  aliasOrigin?: string
  property?: string
  efficacy?: string
  clinical?: string
  suitableCrowd?: string
  contraindication?: string
  applications?: string[]
  formulas?: string[]
  precautions?: string
  nutrition?: string
  references?: string[]
  commentary?: string
  appendix?: string
  modernResearch?: string
}

export function parseHerbDetailContent(raw?: string | null): HerbDetailContent | null {
  if (!raw?.trim()) return null
  try {
    return JSON.parse(raw) as HerbDetailContent
  } catch {
    return null
  }
}
