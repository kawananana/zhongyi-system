export interface FormulaEntry {
  name: string
  efficacy: string
  jun: string
  herbs: string[]
}

export const FORMULA_ENTRIES: FormulaEntry[] = [
  {
    name: '四君子汤',
    efficacy: '益气健脾',
    jun: '人参',
    herbs: ['人参', '白术', '茯苓', '甘草'],
  },
  {
    name: '四物汤',
    efficacy: '补血调血',
    jun: '当归',
    herbs: ['当归', '川芎', '白芍', '熟地黄'],
  },
  {
    name: '逍遥散',
    efficacy: '疏肝解郁、健脾养血',
    jun: '柴胡',
    herbs: ['柴胡', '当归', '白芍', '白术', '茯苓', '甘草', '薄荷', '生姜'],
  },
  {
    name: '补中益气汤',
    efficacy: '补中益气、升阳举陷',
    jun: '黄芪',
    herbs: ['黄芪', '人参', '白术', '当归', '陈皮', '升麻', '柴胡', '甘草'],
  },
  {
    name: '六味地黄丸',
    efficacy: '滋阴补肾',
    jun: '熟地黄',
    herbs: ['熟地黄', '山茱萸', '山药', '泽泻', '茯苓', '牡丹皮'],
  },
  {
    name: '银翘散',
    efficacy: '辛凉解表、清热解毒',
    jun: '金银花',
    herbs: ['金银花', '连翘', '桔梗', '薄荷', '竹叶', '甘草', '荆芥', '淡豆豉', '牛蒡子'],
  },
  {
    name: '桂枝汤',
    efficacy: '解肌发表、调和营卫',
    jun: '桂枝',
    herbs: ['桂枝', '芍药', '甘草', '生姜', '大枣'],
  },
  {
    name: '二陈汤',
    efficacy: '燥湿化痰、理气和中',
    jun: '半夏',
    herbs: ['半夏', '陈皮', '茯苓', '甘草'],
  },
  {
    name: '小柴胡汤',
    efficacy: '和解少阳',
    jun: '柴胡',
    herbs: ['柴胡', '黄芩', '人参', '半夏', '甘草', '生姜', '大枣'],
  },
  {
    name: '天王补心丹',
    efficacy: '滋阴养血、补心安神',
    jun: '生地黄',
    herbs: ['生地黄', '人参', '丹参', '玄参', '茯苓', '五味子', '远志', '桔梗', '当归', '天冬', '麦冬', '柏子仁', '酸枣仁'],
  },
]
