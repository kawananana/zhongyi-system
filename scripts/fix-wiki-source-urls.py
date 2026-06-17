#!/usr/bin/env python3
"""Ensure wiki images only come from each item's own sourceUrl article page."""
from __future__ import annotations

import json
from pathlib import Path

SEED = Path(__file__).resolve().parents[1] / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"

# 仅当百科条目与 cntcm 具体文章一一对应时，才保留该参考链接（配图亦来自同一页）
VALID_SOURCE_BY_TITLE: dict[str, str] = {
    "熬夜伤肝，如何用中医思路调理作息": "https://www.cntcm.com.cn/content/202604/27/c502233.html",
    "八段锦入门：八个动作练法要点": "https://www.cntcm.com.cn/content/202601/22/c500279.html",
    "【每周药食】补虚强身的「定风草」，健脑助眠": "https://www.cntcm.com.cn/content/202606/10/c503109.html",
    "【每周药食】疏肝理气：香橼养肝护胃": "https://www.cntcm.com.cn/content/202606/02/c502945.html",
    "【每周药食】夏天吃一豆，祛湿补心健脾胃": "https://www.cntcm.com.cn/content/202605/26/c502784.html",
    "应地药膳：芒种米豆粽": "https://www.cntcm.com.cn/content/202606/11/c503179.html",
    "应地药膳：小满七宝粥": "https://www.cntcm.com.cn/content/202605/28/c502854.html",
    "【每周药食】厨房里的脾胃守护神：草果": "https://www.cntcm.com.cn/content/202604/28/c502259.html",
    "【每周药食】春食马齿苋，清热解毒": "https://www.cntcm.com.cn/content/202604/08/c501812.html",
    "【每周药食】槐花护心：清肝泻火明目": "https://www.cntcm.com.cn/content/202604/14/c501935.html",
    "【每周药食】沙棘：天然维生素宝库": "https://www.cntcm.com.cn/content/202604/21/c502102.html",
    "谷雨时节祛湿：小河米粉": "https://www.cntcm.com.cn/content/202604/29/c502297.html",
}

DEFAULT_SOURCE: dict[str, str] = {
    "中医养生入门：认识阴阳五行": "https://www.natcm.gov.cn/",
    "枸杞的正确泡发：小小红果，大有讲究": "https://www.dayi.org.cn/",
}


def main() -> None:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    fixed = 0
    for item in data:
        if item.get("contentKind", "article") != "article":
            continue
        title = item["title"]
        if title in VALID_SOURCE_BY_TITLE:
            item["sourceUrl"] = VALID_SOURCE_BY_TITLE[title]
            item["sourceName"] = "中国中医药网"
        elif title in DEFAULT_SOURCE:
            item["sourceUrl"] = DEFAULT_SOURCE[title]
            item.pop("coverImage", None)
            item["gallery"] = []
            fixed += 1
        elif title not in VALID_SOURCE_BY_TITLE:
            # 自编科普：无对应 cntcm 文章页，不用无关新闻配图
            if item.get("sourceUrl", "").startswith("https://www.cntcm.com.cn/content/"):
                item["sourceUrl"] = "https://www.cntcm.com.cn/"
                item.pop("coverImage", None)
                item["gallery"] = []
                fixed += 1
    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"fixed {fixed} legacy articles, {len(VALID_SOURCE_BY_TITLE)} with matched source pages")


if __name__ == "__main__":
    main()
