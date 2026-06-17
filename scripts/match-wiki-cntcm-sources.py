#!/usr/bin/env python3
"""Scan cntcm articles with images; match to wiki seed titles."""
import json
import re
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}
BASE = "https://www.cntcm.com.cn"
OUT = Path(__file__).resolve().parent / "cntcm-match-result.json"
SKIP = ("logo", "search.png", "hotnews", "sn02", "headline", "/images/", "icon")

WIKI_ARTICLES = {
    "秋季养生指南：润肺健脾，顺应天时": ["秋季", "润肺", "秋养", "四时", "节气"],
    "枸杞的正确泡发：小小红果，大有讲究": ["枸杞"],
    "熬夜伤肝，如何用中医思路调理作息": ["熬夜", "睡眠", "肝", "作息"],
    "中医养生入门：认识阴阳五行": ["阴阳", "五行", "中医基础"],
    "常用穴位：合谷、太冲的日常保健": ["穴位", "合谷", "太冲", "按揉"],
    "三伏天艾灸：适宜人群与注意事项": ["艾灸", "三伏", "冬病夏治"],
    "颈肩放松推拿：家庭可学手法": ["推拿", "颈肩", "按摩", "颈椎"],
    "拔罐祛湿：操作步骤与禁忌": ["拔罐", "祛湿"],
    "山药薏米粥：健脾祛湿食疗方": ["山药", "薏米", "健脾", "食疗", "粥"],
    "八段锦入门：八个动作练法要点": ["八段锦", "导引"],
    "子午觉与四季起居养生要点": ["子午", "起居", "四季", "作息", "睡眠"],
}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def article_title(html):
    m = re.search(r'<h1\s+v-if="content\.title">([^<]+)</h1>', html)
    return m.group(1).strip() if m else ""


def article_text(html, limit=800):
    m = re.search(r'<div\s+class="content"\s+v-html="content\.content">', html)
    if not m:
        # fallback: strip tags from body-ish region
        body = re.search(r'<div[^>]*class="[^"]*article[^"]*"[^>]*>(.*?)</div>\s*</div>', html, re.S | re.I)
        raw = body.group(1) if body else html
    else:
        start = m.end()
        end = html.find("</div>", start)
        raw = html[start:end] if end > start else ""
    t = re.sub(r"<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", t).strip()[:limit]


def article_imgs(url, html):
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


def collect_links():
    seeds = [BASE + "/", BASE + "/col2200.html"]  # 养生科普
    links = []
    for seed in seeds:
        try:
            html = fetch(seed)
            links.extend(re.findall(r"/content/\d+/\d+/[a-z0-9]+\.html", html))
        except Exception:
            pass
    # known good refs
    links.extend([
        "/content/202604/27/c502233.html",
        "/content/202601/22/c500279.html",
    ])
    return list(dict.fromkeys(links))


def score_match(wiki_title, keywords, art_title, art_text):
    blob = art_title + art_text
    hits = [kw for kw in keywords if kw in blob]
    return len(hits), hits


def main():
    links = collect_links()
    articles = []
    for path in links:
        url = BASE + path
        try:
            html = fetch(url)
            title = article_title(html)
            text = article_text(html)
            imgs = article_imgs(url, html)
            if title and imgs:
                articles.append({
                    "url": url,
                    "title": title,
                    "imgCount": len(imgs),
                    "textPreview": text[:120],
                })
        except Exception as ex:
            pass

    mapping = {}
    for wiki_title, keywords in WIKI_ARTICLES.items():
        best = None
        best_score = 0
        best_hits = []
        for art in articles:
            score, hits = score_match(wiki_title, keywords, art["title"], art["textPreview"])
            if score > best_score:
                best_score = score
                best = art
                best_hits = hits
        mapping[wiki_title] = {
            "sourceUrl": best["url"] if best and best_score > 0 else "",
            "matchScore": best_score,
            "matchHits": best_hits,
            "refTitle": best["title"] if best else "",
            "imgCount": best["imgCount"] if best else 0,
        }

    result = {"articles": articles, "mapping": mapping}
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"scanned {len(links)} links, {len(articles)} with images")
    for wt, m in mapping.items():
        print(f"{wt[:20]}... -> {m['sourceUrl'][:50] if m['sourceUrl'] else 'NONE'} ({m['matchHits']})")


if __name__ == "__main__":
    main()
