#!/usr/bin/env python3
"""Build wiki course entries from curated Bilibili videos (5 per category)."""
from __future__ import annotations

import json
import subprocess
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "backend" / "src" / "main" / "resources" / "seed" / "articles-batch.json"
COVER_DIR = ROOT / "frontend" / "public" / "images" / "wiki" / "course-covers"

# (category, bvid, p) — 每分类 5 个独立课程视频
CURATED: list[tuple[str, str, int]] = [
    # 针灸
    ("acupuncture", "BV1yW4y147Mv", 10),
    ("acupuncture", "BV12H64BWEzE", 2),
    ("acupuncture", "BV12H64BWEzE", 12),
    ("acupuncture", "BV12H64BWEzE", 21),
    ("acupuncture", "BV1RR4y147uY", 10),
    # 热敏灸
    ("thermosensitive_moxibustion", "BV1RrwLz4Exd", 1),
    ("thermosensitive_moxibustion", "BV1RrwLz4Exd", 5),
    ("thermosensitive_moxibustion", "BV1RrwLz4Exd", 9),
    ("thermosensitive_moxibustion", "BV1RrwLz4Exd", 16),
    ("thermosensitive_moxibustion", "BV1RrwLz4Exd", 24),
    # 推拿
    ("tuina", "BV1sL4y1K7X6", 1),
    ("tuina", "BV1LWWhewEJo", 1),
    ("tuina", "BV1sL4y1K7X6", 57),
    ("tuina", "BV1sL4y1K7X6", 20),
    ("tuina", "BV1sL4y1K7X6", 10),
    # 拔罐
    ("cupping", "BV1ZhRFBYE3Q", 1),
    ("cupping", "BV1ZhRFBYE3Q", 2),
    ("cupping", "BV1ZhRFBYE3Q", 9),
    ("cupping", "BV1ZhRFBYE3Q", 5),
    ("cupping", "BV1ZhRFBYE3Q", 3),
    # 药膳食疗
    ("diet", "BV1gQiuBKE8e", 1),
    ("diet", "BV1gQiuBKE8e", 6),
    ("diet", "BV183411v7LJ", 1),
    ("diet", "BV183411v7LJ", 2),
    ("diet", "BV1324y1K7HE", 1),
    # 功法锻炼
    ("exercise", "BV1wyvoBpEBG", 1),
    ("exercise", "BV18A4m1c7kU", 1),
    ("exercise", "BV12i421y7hb", 1),
    ("exercise", "BV1mG3KeEEVe", 1),
    ("exercise", "BV1J3411s7Ph", 1),
    # 起居养生
    ("lifestyle", "BV1RR4y147uY", 4),
    ("lifestyle", "BV1RR4y147uY", 5),
    ("lifestyle", "BV1RR4y147uY", 6),
    ("lifestyle", "BV11AvwzQExA", 1),
    ("lifestyle", "BV11AvwzQExA", 2),
]


def http_json(url: str) -> dict:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp:
        tmp_path = tmp.name
    try:
        subprocess.run(
            ["curl.exe", "-s", "--max-time", "30", url, "-o", tmp_path],
            check=True,
        )
        text = Path(tmp_path).read_text(encoding="utf-8").strip()
        if not text or text.startswith("<"):
            raise RuntimeError(f"bad response: {url}")
        return json.loads(text)
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def fetch_page_meta(bvid: str, page: int) -> dict:
    view = http_json(f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}")
    if view.get("code") != 0:
        raise RuntimeError(f"view {bvid}: {view}")
    d = view["data"]
    aid = d["aid"]
    pages = d.get("pages") or []
    pic = (d.get("pic") or "").replace("http://", "https://")
    owner = (d.get("owner") or {}).get("name") or "B站UP主"
    stat = d.get("stat") or {}
    play = int(stat.get("view") or 0)

    cid = None
    part_title = d.get("title", "")
    for pg in pages:
        if pg.get("page") == page:
            cid = pg["cid"]
            part_title = pg.get("part") or part_title
            break
    if cid is None and pages:
        cid = pages[0]["cid"]
        if page == 1:
            part_title = pages[0].get("part") or part_title

    if cid is None:
        raise RuntimeError(f"no cid for {bvid} p{page}")

    return {
        "bvid": bvid,
        "aid": aid,
        "cid": cid,
        "p": page,
        "title": part_title,
        "series_title": d.get("title", ""),
        "pic": pic,
        "owner": owner,
        "play": play,
    }


def download_cover(url: str, dest: Path) -> bool:
    if not url:
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1024:
        return True
    subprocess.run(
        ["curl.exe", "-s", "-L", "--max-time", "60", url, "-o", str(dest)],
        check=False,
    )
    return dest.exists() and dest.stat().st_size > 512


def cover_key(category: str, bvid: str, page: int) -> str:
    return f"{bvid}-p{page}" if page > 1 else bvid


def display_title(meta: dict) -> str:
    title = meta["title"]
    series = meta["series_title"]
    if not series:
        return title
    if title == series or series in title:
        return title
    if any(title.endswith(ext) for ext in (".mp4", ".mov", ".avi", ".mkv")):
        return series
    return f"{series} · {title}"


def build_course(category: str, meta: dict, cover_web: str) -> dict:
    display = display_title(meta)
    author = meta["owner"]
    bvid = meta["bvid"]
    page = meta["p"]
    v = {
        "title": display,
        "type": "bilibili",
        "bvid": bvid,
        "aid": meta["aid"],
        "cid": meta["cid"],
        "p": page,
        "poster": cover_web,
    }
    page_q = f"?p={page}" if page > 1 else ""
    return {
        "title": display,
        "articleType": "wiki",
        "category": category,
        "contentKind": "course",
        "coverImage": cover_web,
        "author": author,
        "sourceName": "哔哩哔哩",
        "sourceUrl": f"https://www.bilibili.com/video/{bvid}{page_q}",
        "viewCount": 0,
        "status": 1,
        "gallery": [{"url": cover_web, "caption": display}],
        "videos": [v],
        "content": (
            f"【课程来源】本课视频来自哔哩哔哩，UP主：{author}。\n\n"
            f"【内容简介】{display}\n\n"
            "【学习建议】建议在安静环境下跟练或观摩，动作以舒适为度；"
            "如有基础疾病请在医师指导下练习。"
        ),
    }


def main():
    all_courses: list[dict] = []
    errors: list[str] = []

    for category, bvid, page in CURATED:
        try:
            meta = fetch_page_meta(bvid, page)
            key = cover_key(category, bvid, page)
            cover_file = COVER_DIR / category / f"{key}.jpg"
            pic = meta["pic"]
            if download_cover(pic, cover_file):
                cover_web = f"/images/wiki/course-covers/{category}/{key}.jpg"
            else:
                cover_web = pic
            course = build_course(category, meta, cover_web)
            all_courses.append(course)
            print(f"OK {category} | {bvid} p{page} | {course['title'][:50]}")
            time.sleep(0.4)
        except Exception as ex:
            errors.append(f"{category} {bvid} p{page}: {ex}")
            print(f"FAIL {category} | {bvid} p{page} | {ex}")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(" ", e)
        if len(all_courses) < len(CURATED) - 5:
            raise SystemExit(1)

    data = json.loads(SEED.read_text(encoding="utf-8"))
    articles = [item for item in data if item.get("contentKind") != "course"]
    SEED.write_text(
        json.dumps(articles + all_courses, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    by_cat: dict[str, int] = {}
    for c in all_courses:
        by_cat[c["category"]] = by_cat.get(c["category"], 0) + 1
    print(f"\nWrote {len(all_courses)} courses")
    for k in sorted(by_cat):
        print(f"  {k}: {by_cat[k]}")


if __name__ == "__main__":
    main()
