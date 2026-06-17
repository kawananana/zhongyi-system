#!/usr/bin/env python3
import json
import re
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://www.dayi.org.cn/"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


# dayi search API (nuxt site)
for kw in ["枸杞", "艾灸", "拔罐", "穴位"]:
    q = urllib.parse.quote(kw)
    for api in [
        f"https://www.dayi.org.cn/api/search?keyword={q}&page=1",
        f"https://www.dayi.org.cn/api/v1/search?keyword={q}",
    ]:
        try:
            body = get(api)
            print("API", api[:60], body[:200])
        except Exception as e:
            print("API fail", api[:50], e)

# try herb list page
for url in [
    "https://www.dayi.org.cn/list/5",
    "https://www.dayi.org.cn/zhongyaocai",
    "https://www.dayi.org.cn/s?keywords=%E6%9E%B8%E6%9D%9E",
]:
    try:
        html = get(url)
        print("\nURL", url, "len", len(html))
        imgs = re.findall(r'https?://[^"\']+\.(?:jpg|jpeg|png|webp)', html)
        for u in imgs[:8]:
            print(" ", u[:100])
    except Exception as e:
        print("URL fail", url, e)
