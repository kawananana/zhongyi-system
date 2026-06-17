#!/usr/bin/env python3
"""Append cntcm articles (with cover images) to articles-batch.json."""
from __future__ import annotations

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
extract_body = _mod.extract_body
fetch = _mod.fetch
format_wiki_content = _mod.format_wiki_content

# 新增：中国中医药网「每周药食 / 应地药膳」等带配图文章
NEW_ARTICLES = [
    {
        "title": "【每周药食】补虚强身的「定风草」，健脑助眠",
        "category": "lifestyle",
        "sourceUrl": "https://www.cntcm.com.cn/content/202606/10/c503109.html",
        "viewCount": 980,
    },
    {
        "title": "【每周药食】疏肝理气：香橼养肝护胃",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202606/02/c502945.html",
        "viewCount": 920,
    },
    {
        "title": "【每周药食】夏天吃一豆，祛湿补心健脾胃",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202605/26/c502784.html",
        "viewCount": 1100,
    },
    {
        "title": "应地药膳：芒种米豆粽",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202606/11/c503179.html",
        "viewCount": 860,
    },
    {
        "title": "应地药膳：小满七宝粥",
        "category": "lifestyle",
        "sourceUrl": "https://www.cntcm.com.cn/content/202605/28/c502854.html",
        "viewCount": 890,
    },
    {
        "title": "【每周药食】厨房里的脾胃守护神：草果",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202604/28/c502259.html",
        "viewCount": 940,
    },
    {
        "title": "【每周药食】春食马齿苋，清热解毒",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202604/08/c501812.html",
        "viewCount": 870,
    },
    {
        "title": "【每周药食】槐花护心：清肝泻火明目",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202604/14/c501935.html",
        "viewCount": 830,
    },
    {
        "title": "【每周药食】沙棘：天然维生素宝库",
        "category": "diet",
        "sourceUrl": "https://www.cntcm.com.cn/content/202604/21/c502102.html",
        "viewCount": 810,
    },
    {
        "title": "谷雨时节祛湿：小河米粉",
        "category": "lifestyle",
        "sourceUrl": "https://www.cntcm.com.cn/content/202604/29/c502297.html",
        "viewCount": 760,
    },
]


def main() -> None:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    titles = {item["title"] for item in data}

    added = 0
    for spec in NEW_ARTICLES:
        if spec["title"] in titles:
            continue
        page = fetch(spec["sourceUrl"])
        body = format_wiki_content(extract_body(page))
        if not body:
            print("WARN empty body:", spec["title"])
            continue
        data.append(
            {
                "title": spec["title"],
                "articleType": "wiki",
                "category": spec["category"],
                "contentKind": "article",
                "author": "本草萌智编辑部",
                "viewCount": spec["viewCount"],
                "status": 1,
                "sourceName": "中国中医药网",
                "sourceUrl": spec["sourceUrl"],
                "gallery": [],
                "content": body,
            }
        )
        added += 1
        print("ADD", spec["title"])

    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added {added} new -> {SEED}")


if __name__ == "__main__":
    main()
