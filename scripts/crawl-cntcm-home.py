#!/usr/bin/env python3
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}
html = urllib.request.urlopen(
    urllib.request.Request("https://www.cntcm.com.cn/", headers=UA), timeout=25
).read().decode("utf-8", "replace")
links = list(dict.fromkeys(re.findall(r"/content/\d+/\d+/[a-z0-9]+\.html", html)))[:30]
print("links", len(links))
for path in links:
    try:
        h = urllib.request.urlopen(
            urllib.request.Request("https://www.cntcm.com.cn" + path, headers=UA), timeout=20
        ).read().decode("utf-8", "replace")
        title = re.search(r"<title>([^<]+)</title>", h)
        pics = list(dict.fromkeys(re.findall(r"https://www\.cntcm\.com\.cn/pic/[^\"']+\.(?:jpg|png)", h)))
        main = [p for p in pics if "search.png" not in p][:2]
        if main:
            print((title.group(1).strip() if title else path)[:40], main[0])
    except Exception as e:
        print(path, e)
