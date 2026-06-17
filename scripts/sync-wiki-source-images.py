#!/usr/bin/env python3
"""Sync wiki images strictly from each article's sourceUrl (article-body pics only)."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"
PHOTO_DIR = ROOT / "frontend" / "public" / "images" / "wiki" / "photos" / "source"
PHOTO_DIR.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
SKIP_PARTS = ("logo", "search.png", "hotnews", "sn02", "headline", "/images/", "icon")


def slug(s: str) -> str:
    return re.sub(r"[^\w\u4e00-\u9fff]+", "-", s).strip("-")[:40] or "article"


def article_path_prefix(source_url: str) -> str | None:
    m = re.search(r"/content/(\d{6}/\d{2})/", source_url)
    return m.group(1) if m else None


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": url})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def is_article_page(url: str) -> bool:
    return bool(url and re.search(r"/content/\d{6}/\d{2}/", url))


def extract_article_images(source_url: str) -> list[str]:
    if not is_article_page(source_url):
        return []
    html = fetch_html(source_url)
    prefix = article_path_prefix(source_url)
    pics = re.findall(r"https?://[^\"'\s>]+\.(?:jpg|jpeg|png|webp)", html, re.I)
    out: list[str] = []
    for p in pics:
        low = p.lower()
        if any(x in low for x in SKIP_PARTS):
            continue
        if prefix and f"/pic/{prefix}/" not in low:
            continue
        if p not in out:
            out.append(p)
    return out


def download(url: str, dest_base: Path, referer: str) -> Path | None:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Referer": referer, "Accept": "image/*,*/*"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if len(data) < 1024:
        return None
    ext = ".jpg"
    low = url.lower()
    if low.endswith(".png"):
        ext = ".png"
    elif low.endswith(".webp"):
        ext = ".webp"
    dest = dest_base.with_suffix(ext)
    dest.write_bytes(data)
    return dest


def apply_to_item(item: dict) -> None:
    if item.get("contentKind", "article") == "course":
        item.pop("coverImage", None)
        item["gallery"] = []
        for v in item.get("videos") or []:
            v.pop("poster", None)
        return

    url = (item.get("sourceUrl") or "").strip()
    if not is_article_page(url):
        item.pop("coverImage", None)
        item["gallery"] = []
        return

    title = item["title"]
    try:
        remote = extract_article_images(url)
    except Exception as ex:
        print(f"WARN {title}: fetch failed — {ex}")
        item.pop("coverImage", None)
        item["gallery"] = []
        return

    if not remote:
        print(f"NONE {title}: no images in {url}")
        item.pop("coverImage", None)
        item["gallery"] = []
        return

    gallery = []
    for i, pic_url in enumerate(remote[:4], start=1):
        dest_base = PHOTO_DIR / f"{slug(title)}-{i}"
        try:
            saved = download(pic_url, dest_base, url)
            if saved:
                gallery.append({"url": f"/images/wiki/photos/source/{saved.name}", "caption": ""})
        except Exception as ex:
            print(f"SKIP download {pic_url}: {ex}")

    if not gallery:
        item.pop("coverImage", None)
        item["gallery"] = []
        print(f"NONE {title}: downloads failed")
        return

    item["coverImage"] = gallery[0]["url"]
    item["gallery"] = gallery
    print(f"OK {title}: {len(gallery)} image(s) from {url}")


def main() -> None:
    data = json.loads(SEED.read_text(encoding="utf-8"))
    for item in data:
        apply_to_item(item)
    SEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {SEED}")


if __name__ == "__main__":
    main()
