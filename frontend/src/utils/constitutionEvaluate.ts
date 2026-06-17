import {
  CONSTITUTION_META,
  CONSTITUTION_QUESTION_MAP,
  CONSTITUTION_QUESTIONS,
  LIKERT_OPTIONS,
  type ConstitutionKey,
} from '@/data/constitutionQuiz'

export interface ConstitutionScoreItem {
  key: ConstitutionKey
  name: string
  total: number
  max: number
  avg: number
  questionIds: number[]
}

export interface ConstitutionEvidence {
  questionId: number
  text: string
  score: number
  optionLabel: string
  constitution: ConstitutionKey
}

export interface ConstitutionCarePlan {
  diet: string[]
  rest: string[]
  exercise: string[]
  home: string[]
}

export interface ConstitutionResult {
  primary: ConstitutionKey
  secondary?: ConstitutionKey
  isBalanced: boolean
  /** 明显偏颇 / 轻微偏颇（平和质时为 undefined） */
  severity?: 'significant' | 'mild'
  scores: ConstitutionScoreItem[]
  evidence: ConstitutionEvidence[]
  care: ConstitutionCarePlan
  summary: string
  conclusionText: string
}

const BIAS_KEYS: ConstitutionKey[] = [
  'qixu',
  'yangxu',
  'yinxu',
  'tanshi',
  'shire',
  'xueyu',
  'qiyu',
  'tebing',
]

const CARE_PLANS: Record<ConstitutionKey, ConstitutionCarePlan> = {
  pinghe: {
    diet: ['饮食有节、不偏嗜，五谷蔬果均衡搭配', '少油少盐，避免过食辛辣烧烤', '顺应四时，春养肝、夏养心、秋润肺、冬补肾'],
    rest: ['作息规律，尽量 23 点前入睡', '保持情绪平稳，避免长期熬夜', '换季适度增减衣物，避免过劳'],
    exercise: ['每周 3–5 次中等强度运动，如快走、八段锦', '运动后微汗即可，避免大汗伤津', '结合拉伸与呼吸练习，舒展筋骨'],
    home: ['居室通风采光良好，保持环境整洁', '可常用温水泡脚助眠', '定期户外踏青，接触自然'],
  },
  qixu: {
    diet: ['宜食山药、黄芪、党参、小米、红枣等益气健脾之品', '少食生冷、油腻及难消化食物', '可适量食用鸡肉、牛肉、鲫鱼等平补食材'],
    rest: ['避免过度劳累，午间可小憩 20 分钟', '说话、行动宜缓，减少耗气', '保持充足睡眠，避免久思伤脾'],
    exercise: ['以和缓运动为主，如散步、太极拳', '避免剧烈运动与大强度训练', '循序渐进，以不感疲乏为度'],
    home: ['注意保暖，尤其腹部与背部', '可按摩足三里、气海穴辅助调气', '保持心情舒畅，减少焦虑内耗'],
  },
  yangxu: {
    diet: ['宜温热饮食，如生姜、桂圆、羊肉、核桃', '忌生冷冰饮、寒凉瓜果过量', '可适量食用当归生姜羊肉汤等温补膳食'],
    rest: ['早卧晚起，避免贪凉受风', '注意腰腹部与足部保暖', '夏季亦不宜长时间吹空调直吹'],
    exercise: ['选择阳光充足时段轻度运动', '可练八段锦、五禽戏等温阳功法', '避免大汗、冬泳等过度耗阳活动'],
    home: ['居室避免潮湿阴冷', '可用热水泡脚、艾灸关元/气海（需知禁忌）', '穿戴足够，尤其护膝护腰'],
  },
  yinxu: {
    diet: ['宜滋阴润燥，如百合、银耳、沙参、麦冬、鸭肉', '少食辛辣煎炸与温燥补品', '多喝水，可适量食梨、芝麻、蜂蜜'],
    rest: ['避免熬夜，保证夜间养阴时间', '减少长时间处于高温干燥环境', '保持心态平和，少动肝火'],
    exercise: ['以柔和舒展为主，如瑜伽、太极', '避免高温下剧烈运动', '运动后及时补水，不宜大汗'],
    home: ['室内湿度适宜，避免过度干燥', '睡前可温水浴或听轻音乐助眠', '减少长时间屏幕刺激，保护阴血'],
  },
  tanshi: {
    diet: ['宜健脾祛湿，如薏米、赤小豆、冬瓜、陈皮', '少甜少油，控制精制碳水与夜宵', '避免过食肥甘厚味与冰饮'],
    rest: ['避免久坐久卧，规律作息', '晚餐不宜过饱，睡前 3 小时不进食', '保持环境干燥通风'],
    exercise: ['坚持有氧运动，如快走、游泳、骑行', '可配合核心训练，减少腹部赘肉', '每周至少 150 分钟中等强度活动'],
    home: ['减少潮湿环境，梅雨季节注意除湿', '可常按丰隆、阴陵泉等穴位', '衣着宽松透气，避免紧勒'],
  },
  shire: {
    diet: ['宜清热利湿，如绿豆、苦瓜、黄瓜、芹菜', '忌辛辣、烧烤、酒类及过甜', '饮食清淡，适量食薏米、赤小豆'],
    rest: ['避免熬夜与长期情绪烦躁', '保持大便通畅，少憋尿', '夏季尤忌贪凉与过食冰品'],
    exercise: ['适度出汗有助于泄热，但不宜大汗伤阴', '可游泳、慢跑等，运动后及时清洁皮肤', '避免在闷热环境中高强度训练'],
    home: ['保持皮肤清洁，避免堵塞毛孔', '居室通风，减少湿热郁积', '可用菊花、金银花代茶饮（需辨体质）'],
  },
  xueyu: {
    diet: ['宜活血行气，如山楂、玫瑰花、少量红酒（无禁忌者）', '增食深色蔬菜与优质蛋白', '少肥甘厚味，控制高盐高油'],
    rest: ['保持规律作息，避免长期熬夜', '疏解压力，避免情志久郁', '冬季注意保暖，防止寒凝血脉'],
    exercise: ['坚持有氧运动促进血液循环', '可配合拉伸、太极等舒筋活络', '避免长期保持同一姿势不动'],
    home: ['可按摩血海、三阴交等穴位', '热敷肩颈腰背，缓解僵硬', '保持适度社交，避免情绪封闭'],
  },
  qiyu: {
    diet: ['宜疏肝理气，如玫瑰花、佛手、陈皮、柑橘', '少咖啡、浓茶等刺激物过量', '规律进餐，避免情绪化进食'],
    rest: ['保证睡眠，睡前减少信息过载', '培养放松习惯，如冥想、深呼吸', '多接触自然与阳光，调节情志'],
    exercise: ['推荐户外步行、慢跑、舞蹈等', '可练八段锦、五禽戏舒肝解郁', '避免长期独自闷坐不动'],
    home: ['营造明亮温馨的生活空间', '与亲友倾诉，避免情绪积压', '可用芳香疗法辅助放松（无过敏者）'],
  },
  tebing: {
    diet: ['记录并避开已知过敏食物', '饮食清淡，新食物少量试吃', '增食益气固表之品如黄芪、山药（需个体化）'],
    rest: ['避免接触已知过敏原与刺激环境', '换季与花粉期减少外出或做好防护', '保证睡眠，提升整体适应力'],
    exercise: ['选择室内或低花粉环境运动', '避免剧烈运动诱发不适', '运动前做好热身，随身备常用药（遵医嘱）'],
    home: ['保持室内清洁，勤洗床品', '减少尘螨、宠物皮屑等接触', '外出佩戴口罩，注意防晒与防风'],
  },
}

function optionLabel(score: number) {
  return LIKERT_OPTIONS.find((o) => o.value === score)?.label ?? ''
}

/** 明显偏颇阈值：3 题体质 ≥12 分，2 题 ≥8 分，1 题 ≥4 分 */
function significantThreshold(max: number): number {
  if (max >= 15) return 12
  if (max >= 10) return 8
  return 4
}

/** 八大偏颇体质「普遍偏低」上限（约均分 ≤2） */
function lowBiasCeiling(max: number): number {
  return Math.round(max * 0.4)
}

function calcScores(answers: Record<number, number>): ConstitutionScoreItem[] {
  return (Object.keys(CONSTITUTION_QUESTION_MAP) as ConstitutionKey[]).map((key) => {
    const questionIds = CONSTITUTION_QUESTION_MAP[key]
    const values = questionIds.map((id) => answers[id] ?? 0).filter((v) => v > 0)
    const total = values.reduce((s, v) => s + v, 0)
    const max = questionIds.length * 5
    const avg = values.length ? total / values.length : 0
    return {
      key,
      name: CONSTITUTION_META[key].name,
      total,
      max,
      avg,
      questionIds,
    }
  })
}

function isBalancedConstitution(scores: ConstitutionScoreItem[]): boolean {
  const pinghe = scores.find((s) => s.key === 'pinghe')
  if (!pinghe || pinghe.total < 9) return false
  return BIAS_KEYS.every((key) => {
    const item = scores.find((s) => s.key === key)
    return !item || item.total <= lowBiasCeiling(item.max)
  })
}

function pickPrimarySecondary(scores: ConstitutionScoreItem[], balanced: boolean) {
  if (balanced) {
    return { primary: 'pinghe' as ConstitutionKey, secondary: undefined }
  }

  const biasScores = scores
    .filter((s) => s.key !== 'pinghe')
    .sort((a, b) => b.total - a.total || b.avg - a.avg)

  const primary = biasScores[0]?.key ?? 'pinghe'
  const secondary =
    biasScores[1] && biasScores[0].total - biasScores[1].total <= 2
      ? biasScores[1].key
      : undefined

  return { primary, secondary }
}

function resolveSeverity(
  primary: ConstitutionKey,
  scores: ConstitutionScoreItem[],
  balanced: boolean,
): 'significant' | 'mild' | undefined {
  if (balanced) return undefined
  const item = scores.find((s) => s.key === primary)
  if (!item) return undefined
  return item.total >= significantThreshold(item.max) ? 'significant' : 'mild'
}

function buildEvidence(
  answers: Record<number, number>,
  primary: ConstitutionKey,
  secondary?: ConstitutionKey,
): ConstitutionEvidence[] {
  const focus = new Set([primary, secondary].filter(Boolean) as ConstitutionKey[])
  const items: ConstitutionEvidence[] = []

  for (const q of CONSTITUTION_QUESTIONS) {
    const score = answers[q.id]
    if (!score || score < 3) continue
    if (!focus.has(q.constitution)) continue
    items.push({
      questionId: q.id,
      text: q.text,
      score,
      optionLabel: optionLabel(score),
      constitution: q.constitution,
    })
  }

  return items.sort((a, b) => b.score - a.score || a.questionId - b.questionId)
}

function mergeCare(primary: ConstitutionKey, secondary?: ConstitutionKey): ConstitutionCarePlan {
  const main = CARE_PLANS[primary]
  if (!secondary) return main
  const sub = CARE_PLANS[secondary]
  return {
    diet: [`【${CONSTITUTION_META[primary].name}】${main.diet[0]}`, `【兼${CONSTITUTION_META[secondary].name}】${sub.diet[0]}`, ...main.diet.slice(1, 2)],
    rest: [main.rest[0], sub.rest[0], main.rest[1]],
    exercise: [main.exercise[0], sub.exercise[0], main.exercise[1]],
    home: [main.home[0], sub.home[0], main.home[1]],
  }
}

function buildConclusionText(
  primary: ConstitutionKey,
  secondary: ConstitutionKey | undefined,
  balanced: boolean,
  severity?: 'significant' | 'mild',
) {
  if (balanced) {
    return '综合判定：平和质总分偏高，其余八大体质总分普遍偏低，符合**标准健康平和体质**特征，无需特殊调理，请继续保持良好作息与饮食。'
  }
  const primaryName = CONSTITUTION_META[primary].name
  const severityHint =
    severity === 'significant'
      ? '属明显偏颇体质，建议针对性养生调理。'
      : '属轻微偏颇，日常微调养护即可。'
  if (secondary) {
    const secondaryName = CONSTITUTION_META[secondary].name
    return `综合判定：核心主导体质为**${primaryName}**，兼夹**${secondaryName}**（两项分值接近），${severityHint}`
  }
  return `综合判定：核心主导体质为**${primaryName}**，${CONSTITUTION_META[primary].shortDesc}，${severityHint}`
}

export function evaluateConstitution(answers: Record<number, number>): ConstitutionResult {
  const scores = calcScores(answers)
  const balanced = isBalancedConstitution(scores)
  const { primary, secondary } = pickPrimarySecondary(scores, balanced)
  const severity = resolveSeverity(primary, scores, balanced)
  const evidence = buildEvidence(answers, primary, secondary)
  const care = mergeCare(primary, secondary)
  const conclusionText = buildConclusionText(primary, secondary, balanced, severity)

  const summary = balanced
    ? '标准健康平和体质'
    : secondary
      ? `${CONSTITUTION_META[primary].name}（兼${CONSTITUTION_META[secondary].name}）`
      : severity === 'significant'
        ? `${CONSTITUTION_META[primary].name}（明显偏颇）`
        : severity === 'mild'
          ? `${CONSTITUTION_META[primary].name}（轻微偏颇）`
          : CONSTITUTION_META[primary].name

  return {
    primary,
    secondary,
    isBalanced: balanced,
    severity,
    scores,
    evidence,
    care,
    summary,
    conclusionText,
  }
}

export function formatConstitutionReport(result: ConstitutionResult): string {
  const lines: string[] = []
  lines.push('## 体质测评结论')
  lines.push(result.conclusionText.replace(/\*\*/g, ''))
  lines.push('')
  lines.push('### 各体质分项得分')
  for (const s of result.scores) {
    lines.push(`- ${s.name}：${s.total}/${s.max} 分（均分 ${s.avg.toFixed(1)}）`)
  }
  lines.push('')
  lines.push('### 判定依据（对应您的作答）')
  if (result.evidence.length) {
    for (const e of result.evidence) {
      lines.push(`- 第 ${e.questionId} 题「${e.text}」→ ${e.optionLabel}（${e.score} 分）`)
    }
  } else {
    lines.push('- 各题得分较为分散，建议结合日常状态持续观察。')
  }
  lines.push('')
  lines.push('### 饮食宜忌')
  result.care.diet.forEach((t) => lines.push(`- ${t}`))
  lines.push('')
  lines.push('### 作息养护')
  result.care.rest.forEach((t) => lines.push(`- ${t}`))
  lines.push('')
  lines.push('### 运动建议')
  result.care.exercise.forEach((t) => lines.push(`- ${t}`))
  lines.push('')
  lines.push('### 居家温和养生')
  result.care.home.forEach((t) => lines.push(`- ${t}`))
  return lines.join('\n')
}

/** 供后端 AI / 本地伴学调用的标准 Prompt */
export function buildConstitutionAiPrompt(
  answers: Record<number, number>,
  result: ConstitutionResult,
): string {
  const answerLines = CONSTITUTION_QUESTIONS.map((q) => {
    const score = answers[q.id] ?? 0
    return `Q${q.id} [${CONSTITUTION_META[q.constitution].name}] ${q.text} → ${optionLabel(score) || '未答'}（${score || '-'}分）`
  })

  return `你是一名中医体质养生科普助手。请根据以下九体质 20 题自测结果，按固定结构输出中文解读。

【AI 智能判定规则】
1. 计分规则：单题 1–5 分，系统按对应体质分类汇总总分，精准统计九大体质分值；
2. 体质判定：单项体质得分最高为核心主导体质；若两项体质总分差值 ≤2 分，判定为兼夹体质（如阳虚兼痰湿、气郁兼阴虚）；
3. 平和质判定：平和质总分偏高，其余八大体质总分普遍偏低 → 标准健康平和体质，无需特殊调理；
4. 报告输出固定结构：体质综合结论 → 对应答题症状逐条判定依据 → 饮食宜忌、作息养护、运动建议、居家温和养生四大维度个性化推荐；
5. 阈值优化：单一体质总分 ≥12 分（3 题类）即为明显偏颇体质，需针对性养生调理；总分偏低为轻微偏颇，日常微调养护即可。

【系统预判定】
${result.conclusionText.replace(/\*\*/g, '')}
${result.secondary ? `兼夹：${CONSTITUTION_META[result.secondary].name}` : ''}
${result.severity ? `偏颇程度：${result.severity === 'significant' ? '明显偏颇' : '轻微偏颇'}` : ''}

【各体质分项】
${result.scores.map((s) => `${s.name}：${s.total}/${s.max}，均分 ${s.avg.toFixed(1)}`).join('\n')}

【用户 20 题作答明细】
${answerLines.join('\n')}

请用 Markdown 输出，语气亲切、科普向，避免开具处方或替代医疗诊断。`
}

export function buildConstitutionAiReply(
  answers: Record<number, number>,
  result: ConstitutionResult,
): string {
  const evidenceBlock = result.evidence.length
    ? result.evidence
        .slice(0, 6)
        .map((e) => `- 第 ${e.questionId} 题：${e.text} → **${e.optionLabel}**（${e.score} 分）`)
        .join('\n')
    : '- 各题得分较为分散，可结合日常状态持续观察。'

  return `${result.conclusionText}

**判定依据（对应您的答题）**
${evidenceBlock}

**饮食宜忌**
${result.care.diet.map((t) => `- ${t}`).join('\n')}

**作息养护**
${result.care.rest.map((t) => `- ${t}`).join('\n')}

**运动建议**
${result.care.exercise.map((t) => `- ${t}`).join('\n')}

**居家温和养生**
${result.care.home.map((t) => `- ${t}`).join('\n')}`
}
