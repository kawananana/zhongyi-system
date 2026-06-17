#!/usr/bin/env python3
import re
import urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
BASE = "https://www.cntcm.com.cn"

ARTICLES = [
    "/content/202604/27/c502233.html",  # 熬夜/睡眠
    "/content/202601/22/c500279.html",  # 八段锦
    "/content/202601/15/0007985f.html",  # guess
    "/content/202602/09/7e6ab470.html",
]


def fetch(path: str) -> str:
    url = BASE + path if path.startswith("/") else path
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": BASE + "/"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")


def content_imgs(html: str) -> list[str]:
    pics = re.findall(r'https://www\.cntcm\.com\.cn/pic/[^"\']+\.(?:jpg|jpeg|png)', html, re.I)
    # de-dupe, skip tiny icons
    seen = []
    for p in pics:
        if p not in seen and "logo" not in p.lower():
            seen.append(p)
    return seen


if __name__ == "__main__":
    for path in ARTICLES:
        try:
            html = fetch(path)
            title = re.search(r"<title>([^<]+)</title>", html)
            print("\n", title.group(1).strip() if title else path)
            for p in content_imgs(html)[:5]:
                print("  ", p)
        except Exception as e:
            print(path, e)

    # homepage news thumbs
    html = fetch("/")
    for p in content_imgs(html)[:12]:
        print("HOME", p)
