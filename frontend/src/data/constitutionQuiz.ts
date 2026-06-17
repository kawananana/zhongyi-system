export type ConstitutionKey =
  | 'pinghe'
  | 'qixu'
  | 'yangxu'
  | 'yinxu'
  | 'tanshi'
  | 'shire'
  | 'xueyu'
  | 'qiyu'
  | 'tebing'

export interface ConstitutionMeta {
  key: ConstitutionKey
  name: string
  shortDesc: string
}

export interface QuizOption {
  value: 1 | 2 | 3 | 4 | 5
  label: string
}

export interface ConstitutionQuestion {
  id: number
  constitution: ConstitutionKey
  groupLabel: string
  text: string
}

/** 测评说明（网站顶部展示） */
export const QUIZ_INSTRUCTION =
  '请根据近半年日常真实身体、情绪、生活状态如实作答，摒弃当下临时状态，按长期习惯性表现选择。本测评依据中华中医药学会中医体质标准编制，仅为体质养生科普参考，不构成任何医疗诊断、治疗及处方建议。'

export const QUIZ_OPTION_LEGEND =
  '统一答题选项及对应分值：【没有（1分）/ 很少（2分）/ 有时（3分）/ 经常（4分）/ 总是（5分）】，所有题目分值一致，系统自动计分。'

export const LIKERT_OPTIONS: QuizOption[] = [
  { value: 1, label: '没有' },
  { value: 2, label: '很少' },
  { value: 3, label: '有时' },
  { value: 4, label: '经常' },
  { value: 5, label: '总是' },
]

export const CONSTITUTION_META: Record<ConstitutionKey, ConstitutionMeta> = {
  pinghe: { key: 'pinghe', name: '平和质', shortDesc: '阴阳气血调和，体态适中，精力充沛' },
  qixu: { key: 'qixu', name: '气虚质', shortDesc: '元气不足，易疲乏、气短、自汗' },
  yangxu: { key: 'yangxu', name: '阳虚质', shortDesc: '阳气不足，畏寒怕冷、手足不温' },
  yinxu: { key: 'yinxu', name: '阴虚质', shortDesc: '阴液亏少，口燥咽干、手足心热' },
  tanshi: { key: 'tanshi', name: '痰湿质', shortDesc: '痰湿凝聚，形体肥胖、身重困倦' },
  shire: { key: 'shire', name: '湿热质', shortDesc: '湿热内蕴，面垢油光、易生痤疮' },
  xueyu: { key: 'xueyu', name: '血瘀质', shortDesc: '血行不畅，肤色晦暗、易有瘀斑' },
  qiyu: { key: 'qiyu', name: '气郁质', shortDesc: '气机郁滞，情志不畅、易忧郁' },
  tebing: { key: 'tebing', name: '特禀质', shortDesc: '先天禀赋异常，易过敏、适应能力差' },
}

export const CONSTITUTION_QUESTIONS: ConstitutionQuestion[] = [
  {
    id: 1,
    constitution: 'pinghe',
    groupLabel: '平和质（健康均衡体质）',
    text: '日常精力充沛，不易疲惫、嗜睡，日常活动无乏力感？',
  },
  {
    id: 2,
    constitution: 'pinghe',
    groupLabel: '平和质（健康均衡体质）',
    text: '面色气色均匀红润，无长期暗沉、萎黄、苍白等问题？',
  },
  {
    id: 3,
    constitution: 'pinghe',
    groupLabel: '平和质（健康均衡体质）',
    text: '身体耐受度好，寒热适应能力强，换季极少出现身体不适？',
  },
  {
    id: 4,
    constitution: 'qixu',
    groupLabel: '气虚质（元气不足、体虚乏力）',
    text: '稍微活动、劳作后就浑身乏力、气短懒言、不愿活动？',
  },
  {
    id: 5,
    constitution: 'qixu',
    groupLabel: '气虚质（元气不足、体虚乏力）',
    text: '日常容易出虚汗，静坐、轻微活动后出汗量明显多于常人？',
  },
  {
    id: 6,
    constitution: 'qixu',
    groupLabel: '气虚质（元气不足、体虚乏力）',
    text: '免疫力偏弱，换季、温差变化时容易感冒、身体不适？',
  },
  {
    id: 7,
    constitution: 'yangxu',
    groupLabel: '阳虚质（阳气不足、畏寒怕冷）',
    text: '常年手脚冰凉、畏寒喜暖，同等环境下比他人更怕冷、穿衣更多？',
  },
  {
    id: 8,
    constitution: 'yangxu',
    groupLabel: '阳虚质（阳气不足、畏寒怕冷）',
    text: '腰腹、后背容易发凉，惧怕吹风、吹空调，受凉后身体不适？',
  },
  {
    id: 9,
    constitution: 'yangxu',
    groupLabel: '阳虚质（阳气不足、畏寒怕冷）',
    text: '食用生冷食物、喝冰水凉茶后，易出现腹胀、腹痛、大便稀溏等肠胃问题？',
  },
  {
    id: 10,
    constitution: 'yinxu',
    groupLabel: '阴虚质（阴液亏虚、燥热上火）',
    text: '经常手脚心发热、体内燥热，伴随口干、咽喉干涩、总想喝水？',
  },
  {
    id: 11,
    constitution: 'yinxu',
    groupLabel: '阴虚质（阴液亏虚、燥热上火）',
    text: '睡眠质量差，易多梦、失眠，夜间熟睡后容易莫名盗汗？',
  },
  {
    id: 12,
    constitution: 'yinxu',
    groupLabel: '阴虚质（阴液亏虚、燥热上火）',
    text: '长期大便偏干、皮肤嘴唇干燥脱皮，容易莫名烦躁、上火长痘？',
  },
  {
    id: 13,
    constitution: 'tanshi',
    groupLabel: '痰湿质（水湿内停、身体困重）',
    text: '身体沉重困倦、四肢发沉，腹部松软赘肉多，日常慵懒不爱运动？',
  },
  {
    id: 14,
    constitution: 'tanshi',
    groupLabel: '痰湿质（水湿内停、身体困重）',
    text: '口腔常年黏腻不清爽，喉咙总有白痰、舌苔厚腻发白？',
  },
  {
    id: 15,
    constitution: 'tanshi',
    groupLabel: '痰湿质（水湿内停、身体困重）',
    text: '大便黏腻、容易粘马桶、冲不干净，身体湿气重、代谢偏缓？',
  },
  {
    id: 16,
    constitution: 'shire',
    groupLabel: '湿热质（湿热蕴结、体内燥热）',
    text: '皮肤易出油、反复长痘、长闭口，日常伴随口苦、口臭、口腔异味？',
  },
  {
    id: 17,
    constitution: 'shire',
    groupLabel: '湿热质（湿热蕴结、体内燥热）',
    text: '身体闷热难耐、易心烦易怒，小便颜色偏黄、体味偏重？',
  },
  {
    id: 18,
    constitution: 'xueyu',
    groupLabel: '血瘀质（气血瘀滞、循环不畅）',
    text: '面色、嘴唇暗沉无光泽，身体轻微磕碰就容易出现淤青、消散缓慢？',
  },
  {
    id: 19,
    constitution: 'qiyu',
    groupLabel: '气郁质（肝气郁结、情绪不畅）',
    text: '容易莫名胸闷、频繁叹气，情绪敏感低落、思虑过多，压力大易失眠？',
  },
  {
    id: 20,
    constitution: 'tebing',
    groupLabel: '特禀质（先天敏感、易过敏）',
    text: '属于易过敏体质，换季、接触花粉粉尘、食用特殊食物后易出现鼻炎、皮肤瘙痒、红疹等问题？',
  },
]

/** 各体质对应题号（供 AI Prompt 与统计使用） */
export const CONSTITUTION_QUESTION_MAP: Record<ConstitutionKey, number[]> = {
  pinghe: [1, 2, 3],
  qixu: [4, 5, 6],
  yangxu: [7, 8, 9],
  yinxu: [10, 11, 12],
  tanshi: [13, 14, 15],
  shire: [16, 17],
  xueyu: [18],
  qiyu: [19],
  tebing: [20],
}
