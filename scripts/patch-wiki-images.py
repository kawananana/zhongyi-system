#!/usr/bin/env python3
"""Replace wiki SVG placeholders with local JPG photos."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"
COURSES_PY = ROOT / "scripts" / "seed-wiki-courses.py"
PHOTO = "/images/wiki/photos"

# SVG 路径 -> JPG（与 download-wiki-photos.py 输出一致）
SVG_TO_JPG: dict[str, str] = {
    # 栏目封面
    "/images/wiki/cover-recommend.svg": f"{PHOTO}/cover-recommend.jpg",
    "/images/wiki/cover-diet.svg": f"{PHOTO}/cover-diet.jpg",
    "/images/wiki/cover-lifestyle.svg": f"{PHOTO}/cover-lifestyle.jpg",
    "/images/wiki/cover-exercise.svg": f"{PHOTO}/cover-exercise.jpg",
    "/images/wiki/cover-cupping.svg": f"{PHOTO}/cover-cupping.jpg",
    "/images/wiki/cover-acupuncture.svg": f"{PHOTO}/cover-acupuncture.jpg",
    "/images/wiki/cover-moxibustion.svg": f"{PHOTO}/cover-moxibustion.jpg",
    "/images/wiki/cover-tuina.svg": f"{PHOTO}/cover-tuina.jpg",
    "/images/wiki/cover-course.svg": f"{PHOTO}/cover-course.jpg",
    # 文章配图
    "/images/wiki/articles/autumn-1.svg": f"{PHOTO}/autumn-pear.jpg",
    "/images/wiki/articles/autumn-2.svg": f"{PHOTO}/autumn-tea.jpg",
    "/images/wiki/articles/gouqi-1.svg": f"{PHOTO}/gouqi.jpg",
    "/images/wiki/articles/gouqi-2.svg": f"{PHOTO}/gouqi-dry.jpg",
    "/images/wiki/articles/sleep-1.svg": f"{PHOTO}/sleep-herb.jpg",
    "/images/wiki/articles/sleep-2.svg": f"{PHOTO}/jujube-tea.jpg",
    "/images/wiki/articles/yinyang-1.svg": f"{PHOTO}/yinyang-taiji.jpg",
    "/images/wiki/articles/yinyang-2.svg": f"{PHOTO}/five-elements.jpg",
    "/images/wiki/articles/acupoint-1.svg": f"{PHOTO}/acupoint-chart.jpg",
    "/images/wiki/articles/acupoint-2.svg": f"{PHOTO}/acupuncture.jpg",
    "/images/wiki/articles/moxa-1.svg": f"{PHOTO}/moxibustion.jpg",
    "/images/wiki/articles/moxa-2.svg": f"{PHOTO}/mugwort.jpg",
    "/images/wiki/articles/tuina-1.svg": f"{PHOTO}/tuina.jpg",
    "/images/wiki/articles/tuina-2.svg": f"{PHOTO}/tuina-back.jpg",
    "/images/wiki/articles/cupping-1.svg": f"{PHOTO}/cupping.jpg",
    "/images/wiki/articles/cupping-2.svg": f"{PHOTO}/cupping-glasses.jpg",
    "/images/wiki/articles/porridge-1.svg": f"{PHOTO}/yam-porridge.jpg",
    "/images/wiki/articles/porridge-2.svg": f"{PHOTO}/tcm-pharmacy.jpg",
    "/images/wiki/articles/baduanjin-1.svg": f"{PHOTO}/baduanjin.jpg",
    "/images/wiki/articles/baduanjin-2.svg": f"{PHOTO}/qigong.jpg",
    "/images/wiki/articles/lifestyle-1.svg": f"{PHOTO}/qigong.jpg",
    "/images/wiki/articles/lifestyle-2.svg": f"{PHOTO}/lifestyle-season.jpg",
    "/images/wiki/articles/course-basic-1.svg": f"{PHOTO}/herbal-materia.jpg",
    "/images/wiki/articles/course-jingluo-1.svg": f"{PHOTO}/meridian-chart.jpg",
    "/images/wiki/articles/course-moxa-1.svg": f"{PHOTO}/moxibustion.jpg",
    "/images/wiki/articles/course-tuina-1.svg": f"{PHOTO}/tuina.jpg",
}


def replace_in_obj(obj: object) -> int:
    n = 0
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("coverImage", "url", "poster") and isinstance(v, str) and v in SVG_TO_JPG:
                obj[k] = SVG_TO_JPG[v]
                n += 1
            else:
                n += replace_in_obj(v)
    elif isinstance(obj, list):
        for item in obj:
            n += replace_in_obj(item)
    return n


def patch_seed() -> int:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    count = replace_in_obj(data)
    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def patch_courses_py() -> int:
    text = COURSES_PY.read_text(encoding="utf-8")
    count = 0
    for old, new in SVG_TO_JPG.items():
        if old in text:
            text = text.replace(old, new)
            count += text.count(new)  # rough; recount below
    # accurate count
    count = sum(text.count(new) for new in SVG_TO_JPG.values())
    COURSES_PY.write_text(text, encoding="utf-8")
    return count


def main() -> None:
    n1 = patch_seed()
    n2 = patch_courses_py()
    print(f"Patched articles-batch.json: {n1} paths")
    print(f"Patched seed-wiki-courses.py: {n2} paths")


if __name__ == "__main__":
    main()
