#!/usr/bin/env python3
"""Extract article title and body text from cntcm.com.cn content pages."""
from __future__ import annotations

import html as html_lib
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def extract_title(page: str) -> str:
    m = re.search(r'<h1[^>]*v-if="content\.title"[^>]*>([^<]+)</h1>', page)
    if m:
        return html_lib.unescape(m.group(1).strip())
    m = re.search(r'"title"\s*:\s*"([^"]{4,120})"', page)
    if m:
        return html_lib.unescape(m.group(1).strip())
    return ""


def strip_nav(text: str) -> str:
    markers = (
        "国家中医药管理局主管",
        "设为首页",
        "友情链接",
        "国内统一刊号",
        "https://www.cntcm.com.cn/",
        "Your browser does not support",
    )
    for m in markers:
        idx = text.find(m)
        if idx > 0:
            text = text[:idx]
    return text.strip()


def extract_body(page: str) -> str:
    paras = re.findall(r"<p[^>]*>(.*?)</p>", page, re.S | re.I)
    chunks: list[str] = []
    skip_fragments = (
        "设为首页", "加入收藏", "关于我们", "联系我们", "网站地图",
        "国家中医药管理局主管", "新闻中心", "学术临床", "责任编辑",
        "【每周药食】", "友情链接", "国内统一刊号", "https://www.cntcm",
        "中国北京市", "邮编：", "业务合作", "举报电话", "技术支持", "传真：",
        "E-mail", "邮箱：",
    )
    for raw in paras:
        t = re.sub(r"<[^>]+>", "", raw)
        t = html_lib.unescape(re.sub(r"\s+", " ", t).strip())
        if len(t) < 20:
            continue
        if any(x in t for x in skip_fragments):
            continue
        if t.startswith("首页 "):
            continue
        chunks.append(t)
    return strip_nav("\n\n".join(chunks))


def format_wiki_content(body: str, source_name: str = "中国中医药网") -> str:
    if not body:
        return ""
    sections = body.split("\n\n")
    out: list[str] = []
    for i, sec in enumerate(sections):
        if i == 0 and len(sec) < 40:
            out.append(f"【导读】\n{sec}")
        else:
            out.append(sec)
    out.append(f"\n以上内容参考{source_name}公开文章摘编改写，仅供学习，不能替代诊疗。")
    return "\n\n".join(out)


if __name__ == "__main__":
    import json
    import sys

    for url in sys.argv[1:]:
        page = fetch(url)
        title = extract_title(page)
        body = extract_body(page)
        print(json.dumps({"url": url, "title": title, "bodyLen": len(body), "preview": body[:300]}, ensure_ascii=False, indent=2))
