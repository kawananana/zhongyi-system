#!/usr/bin/env python3
"""Fix 秋季养生 article and refresh new cntcm article bodies."""
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"

_spec = importlib.util.spec_from_file_location(
    "extract_cntcm_content",
    Path(__file__).resolve().parent / "extract-cntcm-content.py",
)
_mod = importlib.util.module_from_spec(_spec)
assert _spec and _spec.loader
_spec.loader.exec_module(_mod)

AUTUMN_CONTENT = (
    "【节气与病机】\n秋季属金，与肺相应。气候由热转凉、燥气渐盛，中医认为「燥邪」易伤肺津，"
    "常见口干咽燥、干咳少痰、皮肤干裂；同时「秋气主收」，人体阳气内收，脾胃运化亦需调养，"
    "故秋季养生总则为「滋阴润肺、健脾益气」。\n\n【饮食调养】\n宜选甘润平和之品：百合、银耳、"
    "沙参、麦冬、梨、蜂蜜等，可煮粥或煲汤，如百合莲子粥、沙参玉竹老鸭汤。少食辛辣煎炸，"
    "以免助燥伤阴。脾虚湿困者可加山药、薏米健脾祛湿。\n\n【起居与运动】\n起居宜早睡早起，"
    "与自然界阳气收敛相应。运动以和缓为度，推荐太极拳、八段锦、散步等，以微微汗出、"
    "不感疲劳为宜，避免大汗耗气伤津。\n\n【情志与防病】\n秋主悲，宜保持心情舒畅，"
    "多与家人交流、适度户外活动。慢性咳喘、过敏性鼻炎等「秋燥」相关病症，应及早调理，"
    "必要时遵医嘱辨证施治。\n\n以上内容参考中国中医药网四时养生科普栏目整理，仅供学习，不能替代诊疗。"
)

NEW_TITLES = {
    "【每周药食】补虚强身的「定风草」，健脑助眠",
    "【每周药食】疏肝理气：香橼养肝护胃",
    "【每周药食】夏天吃一豆，祛湿补心健脾胃",
    "应地药膳：芒种米豆粽",
    "应地药膳：小满七宝粥",
    "【每周药食】厨房里的脾胃守护神：草果",
    "【每周药食】春食马齿苋，清热解毒",
    "【每周药食】槐花护心：清肝泻火明目",
    "【每周药食】沙棘：天然维生素宝库",
    "谷雨时节祛湿：小河米粉",
}


def main() -> None:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    for item in data:
        if item["title"] == "秋季养生指南：润肺健脾，顺应天时":
            item["sourceUrl"] = "https://www.cntcm.com.cn/"
            item["gallery"] = []
            item.pop("coverImage", None)
            item["content"] = AUTUMN_CONTENT
        elif item["title"] in NEW_TITLES and item.get("sourceUrl", "").startswith("https://www.cntcm.com.cn/content/"):
            body = _mod.extract_body(_mod.fetch(item["sourceUrl"]))
            if body:
                item["content"] = _mod.format_wiki_content(body)
    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("fixed articles-batch.json")


if __name__ == "__main__":
    main()
