#!/usr/bin/env python3
"""Extract content images from a source article page."""
import re
import sys
import urllib.request

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}

SKIP = ("logo", "search.png", "hotNews", "sn02", "headLine", "icon", "banner", "/images/")


def content_images(url: str) -> list[str]:
    req = urllib.request.Request(url, headers={**UA, "Referer": url})
    with urllib.request.urlopen(req, timeout=25) as r:
        html = r.read().decode("utf-8", "replace")
    pics = re.findall(r"https?://[^\"'\s>]+\.(?:jpg|jpeg|png|webp)", html, re.I)
    out = []
    for p in pics:
        low = p.lower()
        if any(s in low for s in SKIP):
            continue
        if "cntcm.com.cn/pic/" in low or "dayi.org.cn" in low:
            if p not in out:
                out.append(p)
    return out


if __name__ == "__main__":
    for u in sys.argv[1:]:
        try:
            imgs = content_images(u)
            print("URL", u)
            print("  count", len(imgs))
            for i in imgs[:5]:
                print(" ", i)
        except Exception as e:
            print("URL", u, "FAIL", e)
