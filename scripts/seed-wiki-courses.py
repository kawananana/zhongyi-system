#!/usr/bin/env python3
"""Rebuild wiki course entries: many courses, 1 video each (max 2)."""
import json
from pathlib import Path

SEED = Path(__file__).resolve().parents[1] / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"

# 每门课 1 个视频为主；BV/aid/cid 已校验
COURSES = [
    # —— 推荐 ——
    {
        "title": "《中医基础理论》入门课",
        "category": "recommend",
        "author": "刘教授",
        "viewCount": 920,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/herbal-materia.jpg",
        "gallery_caption": "中医学理论体系与整体观念",
        "content": "【课程简介】\n零基础了解中医学理论体系的形成、学科特点与思维方式，建立「整体观念」入门框架。\n\n【本节要点】\n中医学如何认识人体与自然；为什么说「天人合一」是中医思维的根基。\n\n【学习建议】\n配合笔记梳理关键词，为阴阳五行、脏腑经络学习打基础。",
        "video": {"title": "绪论（上）", "bvid": "BV1RR4y147uY", "aid": 337090181, "cid": 452170264, "p": 1},
    },
    {
        "title": "《阴阳学说》精讲",
        "category": "recommend",
        "author": "刘教授",
        "viewCount": 880,
        "coverImage": "/images/wiki/photos/cover-recommend.jpg",
        "poster": "/images/wiki/photos/yinyang-taiji.jpg",
        "gallery_caption": "阴阳对立互根，动态平衡",
        "content": "【课程简介】\n系统讲解阴阳学说的基本内容及其在健康判断中的应用。\n\n【本节要点】\n阴阳偏盛偏衰与寒热虚实；「阴平阳秘」的养生意义。\n\n【适合人群】\n希望读懂中医科普、养生文章的初学者。",
        "video": {"title": "阴阳学说（一）", "bvid": "BV1RR4y147uY", "aid": 337090181, "cid": 452171085, "p": 13},
    },
    {
        "title": "《五行与藏象》入门",
        "category": "recommend",
        "author": "刘教授",
        "viewCount": 840,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/five-elements.jpg",
        "gallery_caption": "五行与五脏相应关系",
        "content": "【课程简介】\n介绍五行学说及脾系统藏象入门，理解脏腑之间的生克联系。\n\n【本节要点】\n五行归类思路；脾主运化与日常饮食起居的关系。\n\n【延伸学习】\n可继续学习经络、气血津液等章节。",
        "video": {"title": "五行学说（一）", "bvid": "BV1RR4y147uY", "aid": 337090181, "cid": 452172167, "p": 27},
    },
    # —— 针灸 ——
    {
        "title": "《经络学说》入门课",
        "category": "acupuncture",
        "author": "李教授",
        "viewCount": 760,
        "coverImage": "/images/wiki/photos/cover-acupuncture.jpg",
        "poster": "/images/wiki/photos/meridian-chart.jpg",
        "gallery_caption": "经络概述与循行规律",
        "content": "【课程简介】\n了解经络学说的基本概念，认识十四经脉与奇经八脉的作用。\n\n【本节要点】\n经络联络脏腑、运行气血；为何针灸推拿都以经络为纲。\n\n【实操提示】\n可配合本平台 3D 经络模块同步学习。",
        "video": {"title": "经络概述", "bvid": "BV1yW4y147Mv", "aid": 944980485, "cid": 886986704, "p": 10},
    },
    {
        "title": "《穴位定位》实操课",
        "category": "acupuncture",
        "author": "李教授",
        "viewCount": 820,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/acupoint-chart.jpg",
        "gallery_caption": "骨度分寸与体表标志取穴",
        "content": "【课程简介】\n掌握穴位定位的常用方法，学会用体表标志与骨度分寸找穴。\n\n【本节要点】\n指寸法、简便取穴法；定位准确是按揉、艾灸、针刺安全的前提。",
        "video": {"title": "穴位定位方法（一）", "bvid": "BV12H64BWEzE", "aid": 115994735414449, "cid": 35750939353, "p": 2},
    },
    {
        "title": "《合谷穴》保健课",
        "category": "acupuncture",
        "author": "李教授",
        "viewCount": 690,
        "coverImage": "/images/wiki/photos/cover-acupuncture.jpg",
        "poster": "/images/wiki/photos/acupuncture.jpg",
        "gallery_caption": "合谷穴简便取穴与按揉",
        "content": "【课程简介】\n学习合谷穴定位、主治与家庭保健按揉方法。\n\n【注意】\n孕妇慎按合谷；以酸胀为度，不宜暴力按压。",
        "video": {"title": "合谷穴定位与主治", "bvid": "BV12H64BWEzE", "aid": 115994735414449, "cid": 35750939732, "p": 12},
    },
    {
        "title": "《足三里》保健课",
        "category": "acupuncture",
        "author": "李教授",
        "viewCount": 710,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/acupoint-chart.jpg",
        "gallery_caption": "足三里穴「保健要穴」",
        "content": "【课程简介】\n足三里为胃经合穴，有「常按足三里，胜吃老母鸡」之说。\n\n【适用】\n脾胃虚弱、疲劳乏力、日常保健；可配合艾灸。",
        "video": {"title": "足三里穴定位与保健", "bvid": "BV12H64BWEzE", "aid": 115994735414449, "cid": 35750940091, "p": 21},
    },
    # —— 艾灸 ——
    {
        "title": "《艾灸入门》概述课",
        "category": "moxibustion",
        "author": "王教授",
        "viewCount": 680,
        "coverImage": "/images/wiki/photos/cover-moxibustion.jpg",
        "poster": "/images/wiki/photos/moxibustion.jpg",
        "gallery_caption": "艾灸作用原理与适用场景",
        "content": "【课程简介】\n了解艾灸的起源、作用机理与常见问题，建立安全艾灸意识。\n\n【安全提示】\n室内通风、远离易燃物；孕妇腹部禁灸。",
        "video": {"title": "艾灸概述与常见问题", "bvid": "BV1RrwLz4Exd", "aid": 116237384289823, "cid": 36734108188, "p": 1},
    },
    {
        "title": "《艾灸基本手法》实操课",
        "category": "moxibustion",
        "author": "王教授",
        "viewCount": 650,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/moxibustion.jpg",
        "gallery_caption": "施灸顺序与基本手法",
        "content": "【课程简介】\n学习施灸顺序、补泻手法与灸后调护要点。\n\n【学习目标】\n能规范完成足三里、关元等保健灸的基本操作。",
        "video": {"title": "施灸顺序及基本手法", "bvid": "BV1RrwLz4Exd", "aid": 116237384289823, "cid": 36734176834, "p": 5},
    },
    # —— 推拿 ——
    {
        "title": "《推拿入门》基础课",
        "category": "tuina",
        "author": "张教练",
        "viewCount": 620,
        "coverImage": "/images/wiki/photos/cover-tuina.jpg",
        "poster": "/images/wiki/photos/tuina.jpg",
        "gallery_caption": "推拿概念与适应禁忌",
        "content": "【课程简介】\n了解推拿的定义、作用机理、适应证与禁忌证，建立家庭保健推拿的正确认知。\n\n【注意】\n推拿不能替代医疗诊治，急性损伤请就医。",
        "video": {"title": "推拿的概念与作用", "bvid": "BV1sL4y1K7X6", "aid": 854681486, "cid": 737540413, "p": 1},
    },
    {
        "title": "《颈肩推拿》跟练课",
        "category": "tuina",
        "author": "张教练",
        "viewCount": 740,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/tuina.jpg",
        "gallery_caption": "颈肩放松家庭手法",
        "content": "【课程简介】\n针对长期伏案、低头导致的颈肩紧张，学习可在家跟练的放松手法。\n\n【力度】\n以酸胀舒适为度，每次 15 分钟左右。",
        "video": {"title": "颈肩酸痛按摩放松", "bvid": "BV1LWWhewEJo", "aid": 112999465550778, "cid": 500001657113783},
    },
    {
        "title": "《腰背推拿》保健课",
        "category": "tuina",
        "author": "张教练",
        "viewCount": 600,
        "coverImage": "/images/wiki/photos/cover-tuina.jpg",
        "poster": "/images/wiki/photos/tuina-back.jpg",
        "gallery_caption": "腰背部疾病手法调治",
        "content": "【课程简介】\n学习腰背部常见劳损的保健推拿思路与基本手法。\n\n【禁忌】\n骨质疏松、急性扭伤、肿瘤部位禁止重手法。",
        "video": {"title": "腰部疾病手法调治", "bvid": "BV1sL4y1K7X6", "aid": 854681486, "cid": 737555844, "p": 57},
    },
    # —— 拔罐 ——
    {
        "title": "《拔罐疗法》绪论",
        "category": "cupping",
        "author": "赵医师",
        "viewCount": 580,
        "coverImage": "/images/wiki/photos/cover-cupping.jpg",
        "poster": "/images/wiki/photos/cupping.jpg",
        "gallery_caption": "拔罐作用原理与适应证",
        "content": "【课程简介】\n系统介绍拔罐疗法的历史、作用机理、适应证与禁忌证。\n\n【学习提示】\n家庭保健建议使用吸罐器，注意皮肤状况。",
        "video": {"title": "中医拔罐疗法绪论", "bvid": "BV1ZhRFBYE3Q", "aid": 116509795950059, "cid": 38059049107, "p": 1},
    },
    {
        "title": "《火罐法》操作课",
        "category": "cupping",
        "author": "赵医师",
        "viewCount": 560,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/cupping-glasses.jpg",
        "gallery_caption": "闪火法与留罐要点",
        "content": "【课程简介】\n学习火罐法的操作步骤、留罐时间与注意事项。\n\n【安全】\n防止烫伤；高热、出血倾向、孕妇腰腹部不宜拔罐。",
        "video": {"title": "火罐法操作及注意事项", "bvid": "BV1ZhRFBYE3Q", "aid": 116509795950059, "cid": 38059051041, "p": 2},
    },
    {
        "title": "《感冒拔罐》调理课",
        "category": "cupping",
        "author": "赵医师",
        "viewCount": 520,
        "coverImage": "/images/wiki/photos/cover-cupping.jpg",
        "poster": "/images/wiki/photos/cupping.jpg",
        "gallery_caption": "感冒相关拔罐配穴思路",
        "content": "【课程简介】\n了解感冒、偏头痛等常见病症的拔罐治疗思路与操作示范。\n\n【提醒】\n症状较重或持续发热应就医，不宜自行延误诊治。",
        "video": {"title": "感冒的拔罐治疗示范", "bvid": "BV1ZhRFBYE3Q", "aid": 116509795950059, "cid": 38059312079, "p": 9},
    },
    # —— 药膳食疗 ——
    {
        "title": "《药膳食疗》养生入门",
        "category": "diet",
        "author": "本草萌智编辑部",
        "viewCount": 640,
        "coverImage": "/images/wiki/photos/cover-diet.jpg",
        "poster": "/images/wiki/photos/yam-porridge.jpg",
        "gallery_caption": "药食同源与食疗原则",
        "content": "【课程简介】\n介绍药食同源理念与药膳食疗的基本原则：辨证施膳、因人制宜、适量适度。\n\n【要点】\n食疗是调养手段，不能替代药物治疗。",
        "video": {"title": "药膳食疗养生粥品示范", "bvid": "BV1X7411m7fE", "aid": 98728371, "cid": 168533063},
    },
    {
        "title": "《健脾祛湿》药膳课",
        "category": "diet",
        "author": "本草萌智编辑部",
        "viewCount": 610,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/tcm-pharmacy.jpg",
        "gallery_caption": "山药薏米等健脾祛湿食材",
        "content": "【课程简介】\n针对脾虚湿困体质，学习常用健脾祛湿药食配伍与煮粥要点。\n\n【适用】\n身体困重、大便黏滞、舌苔厚腻者日常调养。",
        "video": {"title": "健脾祛湿食疗思路", "bvid": "BV1X7411m7fE", "aid": 98728371, "cid": 168533063},
    },
    {
        "title": "《枸杞养生》食疗课",
        "category": "diet",
        "author": "本草萌智编辑部",
        "viewCount": 590,
        "coverImage": "/images/wiki/photos/cover-diet.jpg",
        "poster": "/images/wiki/photos/gouqi.jpg",
        "gallery_caption": "枸杞功效与正确食用",
        "content": "【课程简介】\n学习枸杞子的功效、正确泡发与搭配，避免盲目进补。\n\n【注意】\n外感发热、脾虚便溏者慎用。",
        "video": {"title": "枸杞的功效与食用方法", "bvid": "BV1324y1K7HE", "aid": 783584603, "cid": 1127460831},
    },
    # —— 功法锻炼 ——
    {
        "title": "《八段锦》跟练入门",
        "category": "exercise",
        "author": "陈教练",
        "viewCount": 880,
        "coverImage": "/images/wiki/photos/cover-exercise.jpg",
        "poster": "/images/wiki/photos/baduanjin.jpg",
        "gallery_caption": "国体版八段锦正背面示范",
        "content": "【课程简介】\n跟随国家体育总局推广版八段锦进行跟练，适合每日晨练。\n\n【要点】\n动作缓慢、呼吸自然，以微微汗出为度。",
        "video": {"title": "八段锦标准练习版", "bvid": "BV1wyvoBpEBG", "aid": 115824346007789, "cid": 35139948454},
    },
    {
        "title": "《八段锦》分解教学",
        "category": "exercise",
        "author": "陈教练",
        "viewCount": 820,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/qigong.jpg",
        "gallery_caption": "八个动作分解要领",
        "content": "【课程简介】\n逐式讲解八段锦动作要领，适合零基础学员分解学习。\n\n【建议】\n先学分解再跟练完整版，循序渐进。",
        "video": {"title": "八段锦动作分解（国体版）", "bvid": "BV18A4m1c7kU", "aid": 1102594302, "cid": 1489092128},
    },
    {
        "title": "《五禽戏》养生入门",
        "category": "exercise",
        "author": "陈教练",
        "viewCount": 540,
        "coverImage": "/images/wiki/photos/cover-exercise.jpg",
        "poster": "/images/wiki/photos/baduanjin.jpg",
        "gallery_caption": "虎鹿熊猿鸟五戏简介",
        "content": "【课程简介】\n介绍健身气功五禽戏的基本功法与养生原理，模仿五禽以调和五脏。\n\n【特点】\n动作生动、场地不限、简单易学。",
        "video": {"title": "五禽戏完整动作训练", "bvid": "BV12i421y7hb", "aid": 1453596191, "cid": 1518715066},
    },
    # —— 起居养生 ——
    {
        "title": "《规律作息》养生课",
        "category": "lifestyle",
        "author": "本草萌智编辑部",
        "viewCount": 570,
        "coverImage": "/images/wiki/photos/cover-lifestyle.jpg",
        "poster": "/images/wiki/photos/qigong.jpg",
        "gallery_caption": "配合功法练习的作息建议",
        "content": "【课程简介】\n讲解规律作息与柔和功法锻炼相结合的日常养生方式。\n\n【要点】\n固定入睡时间，避免长期熬夜耗伤阴血。",
        "video": {"title": "八段锦跟练配合日常作息", "bvid": "BV1mG3KeEEVe", "aid": 112679742081728, "cid": 500001596363687},
    },
    {
        "title": "《四季养生》起居课",
        "category": "lifestyle",
        "author": "本草萌智编辑部",
        "viewCount": 550,
        "coverImage": "/images/wiki/photos/cover-course.jpg",
        "poster": "/images/wiki/photos/lifestyle-season.jpg",
        "gallery_caption": "春养肝夏养心秋养肺冬养肾",
        "content": "【课程简介】\n依据《黄帝内经》四气调神，学习四季起居、衣着与运动调养要点。\n\n【原则】\n顺应天时，不妄作劳，饮食有节。",
        "video": {"title": "中医基础与养生绪论", "bvid": "BV1RR4y147uY", "aid": 337090181, "cid": 452170482, "p": 4},
    },
    {
        "title": "《睡眠调养》安神课",
        "category": "lifestyle",
        "author": "本草萌智编辑部",
        "viewCount": 530,
        "coverImage": "/images/wiki/photos/cover-lifestyle.jpg",
        "poster": "/images/wiki/photos/sleep-herb.jpg",
        "gallery_caption": "失眠的中医调理思路",
        "content": "【课程简介】\n从中医角度了解失眠的常见机理与艾灸调理思路。\n\n【提醒】\n长期严重失眠请就医辨证，勿自行延误。",
        "video": {"title": "失眠的艾灸调理思路", "bvid": "BV1RrwLz4Exd", "aid": 116237384289823, "cid": 36734238779, "p": 16},
    },
]


def build_course_entry(c: dict) -> dict:
    v = dict(c["video"])
    v["type"] = "bilibili"
    return {
        "title": c["title"],
        "articleType": "course",
        "category": c["category"],
        "contentKind": "course",
        "author": c["author"],
        "viewCount": c["viewCount"],
        "status": 1,
        "sourceName": "中国中医药网",
        "sourceUrl": "https://www.cntcm.com.cn/",
        "videos": [v],
        "content": c["content"],
    }


def main():
    data = json.loads(SEED.read_text(encoding="utf-8"))
    articles = [item for item in data if item.get("contentKind") != "course"]
    courses = [build_course_entry(c) for c in COURSES]
    merged = articles + courses
    SEED.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    by_cat: dict[str, int] = {}
    for c in COURSES:
        by_cat[c["category"]] = by_cat.get(c["category"], 0) + 1
    print(f"Courses: {len(courses)} total, 1 video each")
    for k, n in sorted(by_cat.items()):
        print(f"  {k}: {n}")


if __name__ == "__main__":
    main()
