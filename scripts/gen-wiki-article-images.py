#!/usr/bin/env python3
"""Generate themed SVG illustrations for wiki articles."""
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "frontend" / "public" / "images" / "wiki" / "articles"
OUT.mkdir(parents=True, exist_ok=True)

ITEMS = [
    ("autumn", "秋季润肺", "#4a7c59", "#e8f5ee", "梨"),
    ("autumn", "健脾食疗", "#6b8e23", "#f1f8e9", "粥"),
    ("gouqi", "宁夏枸杞", "#c62828", "#ffebee", "果"),
    ("gouqi", "温水冲泡", "#ef6c00", "#fff3e0", "杯"),
    ("sleep", "养肝作息", "#5e35b1", "#ede7f6", "月"),
    ("sleep", "安神穴位", "#00838f", "#e0f7fa", "穴"),
    ("yinyang", "阴阳平衡", "#303f9f", "#e8eaf6", "阴阳"),
    ("yinyang", "五行脏腑", "#f57c00", "#fff8e1", "五行"),
    ("acupoint", "合谷穴", "#1565c0", "#e3f2fd", "手"),
    ("acupoint", "太冲穴", "#2e7d32", "#e8f5e9", "足"),
    ("moxa", "艾条施灸", "#e65100", "#fff3e0", "灸"),
    ("moxa", "三伏保健", "#d84315", "#fbe9e7", "伏"),
    ("tuina", "颈肩揉拿", "#7b1fa2", "#f3e5f5", "肩"),
    ("tuina", "放松手法", "#512da8", "#ede7f6", "按"),
    ("cupping", "闪火拔罐", "#c2185b", "#fce4ec", "罐"),
    ("cupping", "留罐示意", "#ad1457", "#f8bbd0", "印"),
    ("porridge", "山药薏米", "#558b2f", "#f1f8e9", "材"),
    ("porridge", "健脾粥品", "#689f38", "#dcedc8", "粥"),
    ("baduanjin", "两手托天", "#00695c", "#e0f2f1", "托"),
    ("baduanjin", "左右开弓", "#00796b", "#b2dfdb", "弓"),
    ("lifestyle", "子午作息", "#3949ab", "#e8eaf6", "时"),
    ("lifestyle", "四季起居", "#1b5e20", "#c8e6c9", "季"),
    ("course-basic", "中医概论", "#1a5f3f", "#e8f5ee", "理"),
    ("course-jingluo", "经络循行", "#0277bd", "#e1f5fe", "经"),
    ("course-moxa", "艾灸实操", "#ef6c00", "#ffe0b2", "艾"),
    ("course-tuina", "家庭推拿", "#6a1b9a", "#e1bee7", "推"),
]

seen: dict[str, int] = {}

for key, label, accent, bg, mark in ITEMS:
    n = seen.get(key, 0) + 1
    seen[key] = n
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{bg}"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <circle cx="320" cy="170" r="90" fill="#fff" opacity="0.75"/>
  <text x="320" y="185" text-anchor="middle" fill="{accent}" font-size="48" font-family="sans-serif" font-weight="700">{mark}</text>
  <text x="320" y="320" text-anchor="middle" fill="{accent}" font-size="26" font-family="sans-serif" font-weight="600">{label}</text>
</svg>
'''
    (OUT / f"{key}-{n}.svg").write_text(svg, encoding="utf-8")

print(f"Generated {len(ITEMS)} SVGs in {OUT}")
