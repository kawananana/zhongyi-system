#!/usr/bin/env python3
import json
import re
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}
BASE = "https://www.cntcm.com.cn"
OUT = Path(__file__).resolve().parent / "cntcm-articles-scan.json"
SKIP = ("logo", "search.png", "hotnews", "sn02", "headline", "/images/", "icon")

# 养生科普栏目
COL_URLS = [
    BASE + "/col2200.html",  # 养生科普
    BASE + "/",
]


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def article_title(html):
    m = re.search(r'<h1[^>]*v-if="content\.title"[^>]*>([^<]+)</h1>', html)
    if m:
        return m.group(1).strip()
    m = re.search(r'"title"\s*:\s*"([^"]{4,120})"', html)
    if m:
        return m.group(1).strip()
    return ""


def article_text(html, limit=800):
    # Vue template body paragraphs
    parts = re.findall(r'<p[^>]*>(.*?)</p>', html, re.S | re.I)
    texts = []
    for p in parts:
        t = re.sub(r"<[^>]+>", "", p)
        t = re.sub(r"\s+", " ", t).strip()
        if len(t) > 20 and "分享" not in t and "更多" not in t:
            texts.append(t)
    return "\n".join(texts[:8])[:limit]


def imgs(url, html):
    m = re.search(r"/content/(\d{6}/\d{2})/", url)
    prefix = m.group(1) if m else None
    pics = re.findall(r"https?://[^\"'\s>]+\.(?:jpg|jpeg|png|webp)", html, re.I)
    out = []
    for p in pics:
        low = p.lower()
        if any(x in low for x in SKIP):
            continue
        if prefix and f"/pic/{prefix}/" not in low:
            continue
        if p not in out:
            out.append(p)
    return out


all_links = []
for col in COL_URLS:
    try:
        html = fetch(col)
        all_links.extend(re.findall(r"/content/\d+/\d+/[a-z0-9]+\.html", html))
    except Exception:
        pass
links = list(dict.fromkeys(all_links))

rows = []
for path in links[:120]:
    url = BASE + path
    try:
        h = fetch(url)
        im = imgs(url, h)
        if not im:
            continue
        t = article_title(h)
        rows.append({
            "url": url,
            "title": t,
            "imgCount": len(im),
            "text": article_text(h),
        })
    except Exception as ex:
        rows.append({"url": url, "error": str(ex)})

OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {len(rows)} articles with images")
