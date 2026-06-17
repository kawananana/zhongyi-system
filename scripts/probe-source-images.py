#!/usr/bin/env python3
"""Probe authoritative TCM sites for article images."""
import re
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

PAGES = {
    "dayi-gouqi": "https://www.dayi.org.cn/g/00001000000000000000000000000001",
    "dayi-home": "https://www.dayi.org.cn/",
    "cntcm-home": "https://www.cntcm.com.cn/",
    "cntcm-article": "https://www.cntcm.com.cn/content/202604/27/c502233.html",
    "natcm-home": "https://www.natcm.gov.cn/",
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def imgs(html: str) -> list[str]:
    found = re.findall(r'(?:src|data-src|data-original)=["\']([^"\']+)["\']', html, re.I)
    out = []
    for u in found:
        if any(x in u.lower() for x in (".jpg", ".jpeg", ".png", ".webp", "/image", "/img", "/upload")):
            out.append(u)
    return out[:15]


if __name__ == "__main__":
    for name, url in PAGES.items():
        try:
            html = fetch(url)
            print(f"\n=== {name} {url} len={len(html)} ===")
            for u in imgs(html):
                print(" ", u[:120])
        except Exception as e:
            print(f"\n=== {name} FAIL: {e} ===")
