import type { ConstitutionKey } from '@/data/constitutionQuiz'
import { CONSTITUTION_META } from '@/data/constitutionQuiz'

export interface ConstitutionDietTherapy {
  key: ConstitutionKey
  name: string
  /** 体质特点简述 */
  traits: string
  /** 药膳食疗方案 */
  dietPlan: string
  /** 关联本站食谱名称（若有） */
  recipeName?: string
}

/** 九体质药膳食疗方案（依据体质辨识结果个性化推荐） */
export const CONSTITUTION_DIET_THERAPY: Record<ConstitutionKey, ConstitutionDietTherapy> = {
  yangxu: {
    key: 'yangxu',
    name: CONSTITUTION_META.yangxu.name,
    traits: '手脚发凉、怕冷，性格安静、内向。',
    dietPlan:
      '宜食温热补品，如葱、生姜、大蒜、花椒、韭菜、辣椒、胡椒等。少食生冷寒凉之品，如黄瓜、莲藕、梨、西瓜等。',
    recipeName: '山药大枣粥',
  },
  yinxu: {
    key: 'yinxu',
    name: CONSTITUTION_META.yinxu.name,
    traits: '手足心热、口燥咽干、失眠、大便偏干。',
    dietPlan:
      '宜食甘凉滋润之品，如绿豆、冬瓜、芝麻、百合等，少食辛温之品。可配合中午小憩，避免熬夜与剧烈运动，出汗后及时补水。',
    recipeName: '松子仁粥',
  },
  tanshi: {
    key: 'tanshi',
    name: CONSTITUTION_META.tanshi.name,
    traits: '体形偏胖、腹部松软、皮肤多油、易疲倦。',
    dietPlan:
      '饮食宜清淡，多食葱、蒜、海藻、海带、冬瓜、萝卜、金橘、芥菜等。少食肥肉及甜、黏、腻的食物。',
    recipeName: '赤豆红枣汤',
  },
  shire: {
    key: 'shire',
    name: CONSTITUTION_META.shire.name,
    traits: '面垢油光、易生痤疮、口有异味、小便偏黄。',
    dietPlan:
      '饮食宜清淡，多吃甘寒、甘平食物，如绿豆、空心菜、苋菜、芹菜、黄瓜、冬瓜、西瓜等。忌食辛温助热之品，戒烟限酒，避免熬夜过劳。',
    recipeName: '赤豆红枣汤',
  },
  qiyu: {
    key: 'qiyu',
    name: CONSTITUTION_META.qiyu.name,
    traits: '情绪忧郁、易叹气、心悸失眠、体形偏瘦。',
    dietPlan:
      '宜多食行气解郁之品，如小麦、葱、蒜、海带、海藻、萝卜、金橘、山楂等。睡前避免饮茶、咖啡等刺激性饮品。',
    recipeName: '山药大枣粥',
  },
  qixu: {
    key: 'qixu',
    name: CONSTITUTION_META.qixu.name,
    traits: '声音低弱、易自汗、气短乏力、易感冒。',
    dietPlan:
      '宜食益气健脾之品，如黄豆、白扁豆、香菇、大枣、桂圆、蜂蜜等。配合和缓运动，如散步、太极拳，可常按足三里穴。',
    recipeName: '人参莲肉汤',
  },
  xueyu: {
    key: 'xueyu',
    name: CONSTITUTION_META.xueyu.name,
    traits: '皮肤偏暗、易有瘀斑、健忘、性情急躁。',
    dietPlan:
      '宜多食活血祛瘀之品，如黑豆、海带、紫菜、萝卜、山楂、醋、绿茶等。少食肥猪肉，保证充足睡眠。',
    recipeName: '赤豆红枣汤',
  },
  tebing: {
    key: 'tebing',
    name: CONSTITUTION_META.tebing.name,
    traits: '易对花粉、食物等产生过敏反应。',
    dietPlan:
      '饮食宜清淡、均衡，合理搭配荤素与粗细粮。少食荞麦、蚕豆、牛肉、鹅肉、茄子及浓茶、辛辣刺激食物。可在医师指导下参考玉屏风散、消风散、过敏煎等调理思路。',
    recipeName: '山药大枣粥',
  },
  pinghe: {
    key: 'pinghe',
    name: CONSTITUTION_META.pinghe.name,
    traits: '睡眠良好、性格开朗、适应力强，为较健康状态。',
    dietPlan:
      '饮食应有节制、均衡，食物宜多样化。勿过饥过饱，避免过冷过热，少食油腻。年轻人可跑步、打球，老年人宜散步、练太极。',
    recipeName: '山药大枣粥',
  },
}

export function getDietTherapyForConstitution(key: ConstitutionKey): ConstitutionDietTherapy {
  return CONSTITUTION_DIET_THERAPY[key]
}
