#!/usr/bin/env python3
import re
import urllib.request

UA = {"User-Agent": "Mozilla/5.0"}
url = "https://sys01.lib.hkbu.edu.hk/cmed/mmid/detail.php?herb_id=D00483&lang=chs"
html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25).read().decode("utf-8", "replace")
imgs = re.findall(r'src="([^"]+)"', html)
for u in imgs:
    if "jpg" in u.lower() or "image" in u.lower() or "photo" in u.lower():
        print(u)
