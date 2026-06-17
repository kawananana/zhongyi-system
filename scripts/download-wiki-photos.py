#!/usr/bin/env python3
"""Download wiki photos: real JPEG only (no PNG/AI infographics from source sites)."""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "frontend" / "public" / "images" / "wiki" / "photos"
OUT.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
CNTCM = "https://www.cntcm.com.cn"
HKBU = "https://sys01.lib.hkbu.edu.hk/cmed/mmid"

# 仅使用 .jpg 且实测为 JPEG 的新闻配图 / 标本照片（避免 cntcm 上的 PNG AI 插画）
SOURCES: dict[str, tuple[str, str, str]] = {
    "gouqi.jpg": (
        f"{HKBU}/images/small/B00362.jpg",
        "香港浸会大学药用植物图库 · 宁夏枸杞",
        HKBU + "/",
    ),
    "gouqi-dry.jpg": (
        f"{HKBU}/images/small/B00238.jpg",
        "香港浸会大学药用植物图库 · 枸杞药材",
        HKBU + "/",
    ),
    "autumn-pear.jpg": (
        f"{CNTCM}/pic/202606/08/3126ae33-1da4-4162-a9a9-cdddcf2d2236.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "autumn-tea.jpg": (
        f"{CNTCM}/pic/202606/04/e3d6c582-45ab-4f87-b5cc-76d6d7b4bb5b.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "lifestyle-season.jpg": (
        f"{CNTCM}/pic/202606/05/607db2b2-0c80-481a-a4a7-678bf732e509.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "sleep-herb.jpg": (
        f"{CNTCM}/pic/202604/27/2c113f55-7817-4fa4-93fd-a47fa6b00af5.jpg",
        "中国中医药网 · 科普文章配图",
        CNTCM + "/content/202604/27/c502233.html",
    ),
    "jujube-tea.jpg": (
        f"{CNTCM}/pic/202606/10/096d24f1-4691-4154-97a1-eb27e9f37105.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "yinyang-taiji.jpg": (
        f"{CNTCM}/pic/202201/12/f77bb288-54a1-41c5-a7a4-210c2dd28740.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "five-elements.jpg": (
        f"{CNTCM}/pic/202307/28/5c6d417f-fa58-48e9-b453-f10e55b20f49.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "herbal-materia.jpg": (
        f"{CNTCM}/pic/202606/01/2c4725c8-f81f-4673-8061-ebf206f68521.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "acupoint-chart.jpg": (
        f"{CNTCM}/pic/202606/10/a61e4765-a9a1-4022-8934-3e46cb12e701.jpg",
        "中国中医药网 · 针灸推拿",
        CNTCM + "/",
    ),
    "acupuncture.jpg": (
        f"{CNTCM}/pic/202606/11/aa5fb732-a35c-4d5d-9cef-d2a21a76544e.jpg",
        "中国中医药网 · 针灸推拿",
        CNTCM + "/",
    ),
    "meridian-chart.jpg": (
        f"{CNTCM}/pic/202606/11/aa061fdd-978f-43dc-9618-e2df1258f35d.jpg",
        "中国中医药网 · 经络",
        CNTCM + "/",
    ),
    "moxibustion.jpg": (
        f"{CNTCM}/pic/202606/10/9ecd936b-325d-4757-b4d4-13b2a6386aa6.jpg",
        "中国中医药网 · 艾灸",
        CNTCM + "/",
    ),
    "mugwort.jpg": (
        f"{CNTCM}/pic/202606/08/06c2172c-c8e6-4182-b1a3-715b1b7f67a7.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "cupping.jpg": (
        f"{CNTCM}/pic/202606/10/3dc493bc-3811-4988-9676-ca28209c7ea9.jpg",
        "中国中医药网 · 拔罐",
        CNTCM + "/",
    ),
    "cupping-glasses.jpg": (
        f"{CNTCM}/pic/202606/04/a88db8a0-f2af-48aa-a223-b4209e3795d1.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "tuina.jpg": (
        f"{CNTCM}/pic/202605/13/d2de0e39-189a-49d1-8861-701dfab16f9b.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "tuina-back.jpg": (
        f"{CNTCM}/pic/202202/14/dc41a72b-0887-4ae4-91e4-fd07b9d36343.jpg",
        "中国中医药网 · 新闻配图",
        CNTCM + "/",
    ),
    "yam-porridge.jpg": (
        f"{CNTCM}/pic/202606/09/f33c59f4-bf44-4613-a9ef-d2b73250b521.jpg",
        "中国中医药网 · 药膳食疗",
        CNTCM + "/",
    ),
    "tcm-pharmacy.jpg": (
        f"{CNTCM}/pic/202605/29/729c169f-413f-4307-87d6-c0453ea5c2c8.jpg",
        "中国中医药网 · 中药材",
        CNTCM + "/",
    ),
    "baduanjin.jpg": (
        f"{CNTCM}/pic/202406/25/c4e2313c-11d0-42ac-bdf7-95528e0fae5d.jpg",
        "中国中医药网 · 养生功法新闻图",
        CNTCM + "/content/202601/22/c500279.html",
    ),
    "qigong.jpg": (
        f"{CNTCM}/pic/202602/09/7e6ab470-212d-43d9-a066-a305db46f77c.jpg",
        "中国中医药网 · 养生功法",
        CNTCM + "/",
    ),
    "cover-recommend.jpg": (
        f"{CNTCM}/pic/202201/12/f77bb288-54a1-41c5-a7a4-210c2dd28740.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-diet.jpg": (
        f"{HKBU}/images/small/B00362.jpg",
        "中国医药信息查询平台参考资料",
        HKBU + "/",
    ),
    "cover-lifestyle.jpg": (
        f"{CNTCM}/pic/202604/27/2c113f55-7817-4fa4-93fd-a47fa6b00af5.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-exercise.jpg": (
        f"{CNTCM}/pic/202406/25/c4e2313c-11d0-42ac-bdf7-95528e0fae5d.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-cupping.jpg": (
        f"{CNTCM}/pic/202606/10/3dc493bc-3811-4988-9676-ca28209c7ea9.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-acupuncture.jpg": (
        f"{CNTCM}/pic/202606/11/aa5fb732-a35c-4d5d-9cef-d2a21a76544e.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-moxibustion.jpg": (
        f"{CNTCM}/pic/202606/10/9ecd936b-325d-4757-b4d4-13b2a6386aa6.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-tuina.jpg": (
        f"{CNTCM}/pic/202605/13/d2de0e39-189a-49d1-8861-701dfab16f9b.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
    "cover-course.jpg": (
        f"{CNTCM}/pic/202201/26/97048f7b-ff82-4a64-9d7e-39a68b56e0f5.jpg",
        "中国中医药网",
        CNTCM + "/",
    ),
}

META_PATH = OUT / "sources.json"


def download(url: str, dest: Path, referer: str) -> None:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Referer": referer, "Accept": "image/jpeg,*/*"},
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = resp.read()
    if len(data) < 2048:
        raise RuntimeError(f"file too small ({len(data)} bytes)")
    if data[:3] != b"\xff\xd8\xff":
        raise RuntimeError("not a JPEG (likely PNG/AI illustration — skipped)")
    dest.write_bytes(data)


def main() -> None:
    ok, fail = 0, 0
    meta: dict[str, str] = {}
    for local_name, (url, credit, referer) in SOURCES.items():
        dest = OUT / local_name
        try:
            download(url, dest, referer)
            meta[local_name] = credit
            print(f"OK {local_name} ({dest.stat().st_size // 1024} KB) <- {credit}")
            ok += 1
        except Exception as ex:
            print(f"FAIL {local_name}: {ex}")
            fail += 1
    META_PATH.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Done: {ok} ok, {fail} fail -> {OUT}")


if __name__ == "__main__":
    main()
