export interface SolarTermEntry {
  name: string
  season: '春' | '夏' | '秋' | '冬'
  tip: string
  diet: string
  avoid?: string
}

export const SOLAR_TERMS: SolarTermEntry[] = [
  { name: '立春', season: '春', tip: '阳气生发，宜早睡早起、舒展筋骨', diet: '少酸多甘，可食韭菜、葱蒜以助生发', avoid: '不宜过早减衣' },
  { name: '雨水', season: '春', tip: '湿气渐增，注意健脾祛湿', diet: '山药、薏米、赤小豆等健脾利湿', avoid: '少食生冷油腻' },
  { name: '惊蛰', season: '春', tip: '春雷始鸣，肝气当令，宜调畅情志', diet: '梨、蜂蜜润肺，适量绿叶蔬菜', avoid: '避免大怒伤肝' },
  { name: '春分', season: '春', tip: '昼夜平分，阴阳平衡，起居有常', diet: '均衡饮食，增食当季鲜蔬', avoid: '不宜过食大热或大寒' },
  { name: '清明', season: '春', tip: '气清景明，适合户外踏青舒肝', diet: '荠菜、香椿等时令野菜', avoid: '过敏体质慎食发物' },
  { name: '谷雨', season: '春', tip: '雨生百谷，健脾化湿为要', diet: '谷雨茶、茯苓、扁豆', avoid: '少饮酒助湿' },
  { name: '立夏', season: '夏', tip: '心气渐旺，宜静养心神', diet: '莲子、百合、小麦养心安神', avoid: '避免正午暴晒' },
  { name: '小满', season: '夏', tip: '湿热渐盛，清热利湿', diet: '冬瓜、丝瓜、绿豆', avoid: '不宜过食辛辣烧烤' },
  { name: '芒种', season: '夏', tip: '忙种时节，防暑补水', diet: '酸梅汤、西瓜、黄瓜生津', avoid: '大汗后勿立即饮冰' },
  { name: '夏至', season: '夏', tip: '阳极阴生，午间宜小憩', diet: '清淡易消化，可食苦瓜清心', avoid: '避免贪凉伤阳' },
  { name: '小暑', season: '夏', tip: '暑热初盛，养心防暑', diet: '荷叶、绿豆、莲藕', avoid: '空调温度不宜过低' },
  { name: '大暑', season: '夏', tip: '一年最热，防暑降温、益气生津', diet: '西瓜、银耳、百合', avoid: '忌过食冰冷' },
  { name: '立秋', season: '秋', tip: '暑去凉来，润燥养肺', diet: '梨、百合、银耳润肺', avoid: '不宜过早大补' },
  { name: '处暑', season: '秋', tip: '出暑防燥，早睡早起', diet: '蜂蜜、芝麻、核桃', avoid: '少辛增酸以养肺' },
  { name: '白露', season: '秋', tip: '露凝而白，防秋燥、护咽喉', diet: '梨汤、沙参、麦冬', avoid: '夜间注意腹部保暖' },
  { name: '秋分', season: '秋', tip: '昼夜均长，平补润燥', diet: '莲藕、山药、芡实', avoid: '避免悲秋伤肺' },
  { name: '寒露', season: '秋', tip: '露气寒冷，防寒护足', diet: '板栗、柿子、石榴应季而食', avoid: '不宜再赤膊贪凉' },
  { name: '霜降', season: '秋', tip: '天气渐冷，补冬先补霜降', diet: '牛肉、萝卜、柿子', avoid: '不宜过食寒凉' },
  { name: '立冬', season: '冬', tip: '冬藏之始，早卧晚起、必待日光', diet: '羊肉、核桃、黑芝麻温补', avoid: '不宜过汗耗阳' },
  { name: '小雪', season: '冬', tip: '寒气未甚，温补肾阳', diet: '枸杞、桂圆、红枣', avoid: '避免久坐不动' },
  { name: '大雪', season: '冬', tip: '严寒将至，注意保暖护关节', diet: '当归生姜羊肉汤等温补', avoid: '不宜过食燥热' },
  { name: '冬至', season: '冬', tip: '阴极阳生，宜温养、节房事', diet: '饺子、汤圆、温补粥品', avoid: '忌大汗当风' },
  { name: '小寒', season: '冬', tip: '三九前后，防寒防冻', diet: '糯米、红枣、桂圆暖中', avoid: '不宜晨起过早锻炼' },
  { name: '大寒', season: '冬', tip: '岁寒之极，蓄精养阳迎新春', diet: '鸡肉、牛肉、萝卜进补', avoid: '进补需辨体质，勿盲目' },
]
