#!/usr/bin/env python3
"""Collect cntcm.com.cn JPEG news photos (skip PNG/AI infographics)."""
import re
import urllib.parse
import urllib.request

UA = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.cntcm.com.cn/"}
BASE = "https://www.cntcm.com.cn"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def jpg_urls(html: str) -> list[str]:
    urls = re.findall(r"https://www\.cntcm\.com\.cn/pic/[^\"']+\.jpg", html, re.I)
    return list(dict.fromkeys(urls))


def is_jpeg(data: bytes) -> bool:
    return len(data) > 3 and data[:3] == b"\xff\xd8\xff"


def probe(url: str) -> tuple[int, str] | None:
    try:
        req = urllib.request.Request(url, headers={**UA, "Accept": "image/jpeg"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read(4096)
        if not is_jpeg(data):
            return None
        size = len(data)
        # read rest if small
        return size, "jpeg"
    except Exception:
        return None


if __name__ == "__main__":
    html = fetch(BASE + "/")
    links = list(dict.fromkeys(re.findall(r"/content/\d+/\d+/[a-z0-9]+\.html", html)))[:40]
    all_jpg: list[str] = jpg_urls(html)
    for path in links:
        try:
            all_jpg.extend(jpg_urls(fetch(BASE + path)))
        except Exception:
            pass
    all_jpg = list(dict.fromkeys(all_jpg))
    print("found jpg urls", len(all_jpg))
    ok = []
    for u in all_jpg:
        try:
            req = urllib.request.Request(u, headers={**UA, "Accept": "image/jpeg"})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = r.read()
            if is_jpeg(data) and 20_000 < len(data) < 800_000:
                ok.append((len(data), u))
        except Exception:
            pass
    ok.sort(reverse=True)
    for size, u in ok[:25]:
        print(size // 1024, "KB", u)
