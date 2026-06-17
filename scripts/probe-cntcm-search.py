#!/usr/bin/env python3
import re
import urllib.parse
import urllib.request

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}
keywords = ["枸杞", "艾灸", "拔罐", "穴位", "推拿", "八段锦", "山药", "秋季养生", "阴阳", "太极"]

for kw in keywords:
    url = "https://www.cntcm.com.cn/search.html?keyword=" + urllib.parse.quote(kw)
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read().decode(
            "utf-8", "replace"
        )
        links = list(dict.fromkeys(re.findall(r"/content/\d+/\d+/[a-z0-9]+\.html", html)))
        pics = list(dict.fromkeys(re.findall(r"https://www\.cntcm\.com\.cn/pic/[^\"']+\.(?:jpg|png)", html)))
        print(kw, "links", len(links), "pics", len(pics))
        if pics:
            print("  pic", pics[0])
        if links:
            print("  link", links[0])
    except Exception as e:
        print(kw, "FAIL", e)
