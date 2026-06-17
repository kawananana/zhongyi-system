#!/usr/bin/env python3
"""Assign unique coverImage to every wiki article/course and generate missing SVG covers."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"
PUBLIC = ROOT / "frontend" / "public"
COVERS_DIR = ROOT / "frontend" / "public" / "images" / "wiki" / "articles" / "covers"
COVERS_DIR.mkdir(parents=True, exist_ok=True)


def public_file_exists(url: str) -> bool:
    if not url or not url.startswith("/"):
        return False
    return (PUBLIC / url.lstrip("/")).is_file()

PALETTES = [
    ("#1a5f3f", "#e8f5ee", "#2d8a5e"),
    ("#4a7c59", "#f0f7f2", "#6b9b7a"),
    ("#8b6914", "#fff8e8", "#c9a227"),
    ("#2c5282", "#ebf4ff", "#4299e1"),
    ("#744210", "#fef5e7", "#d69e2e"),
    ("#553c9a", "#f3e8ff", "#805ad5"),
    ("#9b2c2c", "#fff5f5", "#e53e3e"),
    ("#285e61", "#e6fffa", "#319795"),
    ("#702459", "#fff5f7", "#d53f8c"),
    ("#1a365d", "#ebf8ff", "#3182ce"),
]

TITLE_RULES: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"秋季|润肺|秋养"), "/images/wiki/articles/autumn-1.svg"),
    (re.compile(r"枸杞"), "/images/wiki/articles/gouqi-1.svg"),
    (re.compile(r"熬夜|睡眠|安神|失眠"), "/images/wiki/articles/sleep-1.svg"),
    (re.compile(r"阴阳|五行|藏象"), "/images/wiki/articles/yinyang-1.svg"),
    (re.compile(r"穴位|合谷|足三里|经络"), "/images/wiki/articles/acupoint-1.svg"),
    (re.compile(r"艾灸|三伏"), "/images/wiki/articles/moxa-1.svg"),
    (re.compile(r"推拿|颈肩|腰背"), "/images/wiki/articles/tuina-1.svg"),
    (re.compile(r"拔罐"), "/images/wiki/articles/cupping-1.svg"),
    (re.compile(r"山药|薏米|粥|药膳|食疗|药食|赤小豆|芒种|小满|草果|马齿苋|槐花|沙棘|米粉|谷雨|定风草|香橼"), "/images/wiki/articles/porridge-1.svg"),
    (re.compile(r"八段锦|五禽戏|跟练|功法"), "/images/wiki/articles/baduanjin-1.svg"),
    (re.compile(r"子午|四季|起居|规律"), "/images/wiki/articles/lifestyle-1.svg"),
    (re.compile(r"基础理论|绪论"), "/images/wiki/articles/course-basic-1.svg"),
    (re.compile(r"经络学说|穴位定位"), "/images/wiki/articles/course-jingluo-1.svg"),
]

VARIANTS = [
    "/images/wiki/articles/autumn-2.svg",
    "/images/wiki/articles/gouqi-2.svg",
    "/images/wiki/articles/sleep-2.svg",
    "/images/wiki/articles/yinyang-2.svg",
    "/images/wiki/articles/acupoint-2.svg",
    "/images/wiki/articles/moxa-2.svg",
    "/images/wiki/articles/tuina-2.svg",
    "/images/wiki/articles/cupping-2.svg",
    "/images/wiki/articles/porridge-2.svg",
    "/images/wiki/articles/baduanjin-2.svg",
    "/images/wiki/articles/lifestyle-2.svg",
    "/images/wiki/articles/course-moxa-1.svg",
    "/images/wiki/articles/course-tuina-1.svg",
    "/images/wiki/cover-diet.svg",
    "/images/wiki/cover-lifestyle.svg",
    "/images/wiki/cover-exercise.svg",
    "/images/wiki/cover-cupping.svg",
    "/images/wiki/cover-acupuncture.svg",
    "/images/wiki/cover-moxibustion.svg",
    "/images/wiki/cover-tuina.svg",
    "/images/wiki/cover-course.svg",
]

CATEGORY_COVERS = {
    "diet": "/images/wiki/cover-diet.svg",
    "lifestyle": "/images/wiki/cover-lifestyle.svg",
    "exercise": "/images/wiki/cover-exercise.svg",
    "cupping": "/images/wiki/cover-cupping.svg",
    "acupuncture": "/images/wiki/cover-acupuncture.svg",
    "moxibustion": "/images/wiki/cover-moxibustion.svg",
    "tuina": "/images/wiki/cover-tuina.svg",
}


def display_char(title: str) -> str:
    t = re.sub(r"[《》【】\[\]()（）]", "", title).strip()
    return t[0] if t else "本"


def write_generated_svg(dest: Path, title: str, index: int) -> None:
    c1, c2, accent = PALETTES[index % len(PALETTES)]
    char = display_char(title)
    subtitle = title[:14] + ("…" if len(title) > 14 else "")
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
  <defs>
    <linearGradient id="g{index}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="55%" stop-color="{accent}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#g{index})"/>
  <circle cx="320" cy="155" r="72" fill="#fff" opacity="0.22"/>
  <text x="320" y="175" text-anchor="middle" fill="#fff" font-size="56" font-family="sans-serif" font-weight="700">{char}</text>
  <text x="320" y="300" text-anchor="middle" fill="#fff" font-size="22" font-family="sans-serif" font-weight="600" opacity="0.95">{subtitle}</text>
</svg>
'''
    dest.write_text(svg, encoding="utf-8")


def pick_semantic(title: str, category: str) -> str | None:
    for pattern, cover in TITLE_RULES:
        if pattern.search(title):
            return cover
    return CATEGORY_COVERS.get(category)


def main() -> None:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    used: set[str] = set()
    variant_i = 0
    gen_i = 0

    for item in data:
        title = item.get("title", "")
        category = item.get("category", "")

        candidates: list[str] = []
        if item.get("coverImage"):
            candidates.append(item["coverImage"])
        for g in item.get("gallery") or []:
            if g.get("url"):
                candidates.append(g["url"])

        semantic = pick_semantic(title, category)
        if semantic:
            candidates.append(semantic)
        for v in VARIANTS:
            candidates.append(v)

        chosen = None
        for c in candidates:
            if c and c not in used:
                chosen = c
                break

        if not chosen:
            gen_i += 1
            fname = f"cover-{gen_i:03d}.svg"
            dest = COVERS_DIR / fname
            write_generated_svg(dest, title, gen_i)
            chosen = f"/images/wiki/articles/covers/{fname}"

        item["coverImage"] = chosen
        used.add(chosen)
        print(f"OK {title[:30]:30} -> {chosen}")

    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nAssigned {len(data)} unique covers ({gen_i} generated).")


if __name__ == "__main__":
    main()
