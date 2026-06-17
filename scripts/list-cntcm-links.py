#!/usr/bin/env python3
"""Find cntcm article links by keyword in homepage/listing HTML."""
import re
import urllib.parse
import urllib.request

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}
html = urllib.request.urlopen(
    urllib.request.Request("https://www.cntcm.com.cn/", headers=UA), timeout=25
).read().decode("utf-8", "replace")

# title snippets near links
links = re.findall(
    r'href="(/content/\d+/\d+/[a-z0-9]+\.html)"[^>]*>([^<]{4,80})',
    html,
)
seen = set()
for path, title in links:
    if path in seen:
        continue
    seen.add(path)
    t = re.sub(r"\s+", "", title)
    if t:
        print(path, t[:60])
