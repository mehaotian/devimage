#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DevImage 图库 manifest 构建：补全 meta 扩展字段 + 生成 photos/categories/scenes.json
"""

from __future__ import annotations

import json
import math
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = REPO_ROOT / "docs" / "图库分类目录.json"
LIBRARY_ROOT = Path(
    "/Users/mehaotian/Documents/workBuddyProject/image/placeholder-images"
)
API_DATA_DIR = REPO_ROOT / "apps" / "api" / "data" / "photo"
MANIFEST_DIR = LIBRARY_ROOT / "manifest"

IMAGE_RE = re.compile(r"^pexels_(\d+)\.(jpe?g|webp|png)$", re.I)


def load_catalog() -> dict[str, Any]:
    """加载图库分类目录 JSON"""
    with CATALOG_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def build_cat_index(catalog: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """cat 名 → 目录配置"""
    return {item["cat"]: item for item in catalog["categories"]}


def infer_orientation(width: int, height: int) -> str:
    """按宽高比推断 orientation"""
    if width <= 0 or height <= 0:
        return "square"
    ratio = width / height
    if ratio > 1.2:
        return "landscape"
    if ratio < 0.83:
        return "portrait"
    return "square"


def infer_aspect(width: int, height: int) -> str:
    """简化 aspect 字符串"""
    if width <= 0 or height <= 0:
        return "1:1"
    g = math.gcd(width, height)
    return f"{width // g}:{height // g}"


def usage_for_cat(cat_cfg: dict[str, Any]) -> list[str]:
    """根据 tier / mock_priority 生成 usage 标签"""
    mp = cat_cfg.get("mock_priority", 2)
    tier = cat_cfg.get("tier", "")
    usage = ["api", "browse"]
    if mp <= 2:
        usage.insert(0, "mock")
    if tier == "F-decor" and mp >= 3:
        return ["api", "browse", "decor"]
    return usage


def enrich_meta(meta: dict[str, Any], cat_cfg: dict[str, Any]) -> dict[str, Any]:
    """补全 shot_type / scenes / orientation 等扩展字段"""
    width = int(meta.get("width") or 0)
    height = int(meta.get("height") or 0)
    if "shot_type" not in meta:
        meta["shot_type"] = cat_cfg.get("shot_type", "product-lifestyle")
    if "orientation" not in meta:
        meta["orientation"] = infer_orientation(width, height)
    if "aspect" not in meta:
        meta["aspect"] = infer_aspect(width, height)
    if "scenes" not in meta:
        meta["scenes"] = list(cat_cfg.get("scenes") or ["gallery"])
    if "alias_group" not in meta:
        meta["alias_group"] = cat_cfg.get("alias_group")
    if "mock_priority" not in meta:
        meta["mock_priority"] = cat_cfg.get("mock_priority", 2)
    if "tags" not in meta:
        tags: list[str] = []
        if meta["shot_type"] == "white-bg":
            tags.append("white-bg")
        meta["tags"] = tags
    return meta


def collect_photos(cat_index: dict[str, dict[str, Any]]) -> tuple[list[dict], dict]:
    """扫描图库并 enrich meta，返回 photos 列表与统计"""
    stats = {"enriched_meta": 0, "written_meta": 0, "skipped_dirs": []}
    rows: list[dict[str, Any]] = []

    for cat_dir in sorted(LIBRARY_ROOT.iterdir()):
        if not cat_dir.is_dir():
            continue
        cat = cat_dir.name
        if cat.startswith("_") or cat == "manifest":
            continue
        cat_cfg = cat_index.get(cat)
        if not cat_cfg:
            stats["skipped_dirs"].append(cat)
            continue

        for img_path in sorted(cat_dir.iterdir()):
            m = IMAGE_RE.match(img_path.name)
            if not m:
                continue
            pexels_id = int(m.group(1))
            meta_path = cat_dir / f"pexels_{pexels_id}_meta.json"
            meta: dict[str, Any]
            if meta_path.exists():
                with meta_path.open(encoding="utf-8") as f:
                    meta = json.load(f)
            else:
                meta = {
                    "pexels_id": pexels_id,
                    "category": cat,
                    "width": 0,
                    "height": 0,
                }
            before = json.dumps(meta, sort_keys=True)
            meta = enrich_meta(meta, cat_cfg)
            meta["category"] = cat
            meta["pexels_id"] = pexels_id
            after = json.dumps(meta, sort_keys=True)
            if before != after:
                stats["enriched_meta"] += 1
                with meta_path.open("w", encoding="utf-8") as f:
                    json.dump(meta, f, ensure_ascii=False, indent=2)
                    f.write("\n")
                stats["written_meta"] += 1

            cos_key = f"assets/seed-pack/{cat}/pexels_{pexels_id}.jpeg"
            rows.append(
                {
                    "pexels_id": pexels_id,
                    "cat": cat,
                    "tier": cat_cfg.get("tier"),
                    "shot_type": meta.get("shot_type"),
                    "orientation": meta.get("orientation"),
                    "aspect": meta.get("aspect"),
                    "scenes": meta.get("scenes", []),
                    "alias_group": meta.get("alias_group"),
                    "mock_priority": meta.get("mock_priority", 2),
                    "usage": usage_for_cat(cat_cfg),
                    "width": meta.get("width"),
                    "height": meta.get("height"),
                    "avg_color": meta.get("avg_color"),
                    "photographer": meta.get("photographer"),
                    "pexels_url": meta.get("pexels_url"),
                    "cos_key": cos_key,
                }
            )

    rows.sort(key=lambda r: (r["cat"], r["pexels_id"]))
    for idx, row in enumerate(rows, start=1):
        row["id"] = idx
    return rows, stats


def build_categories(photos: list[dict], cat_index: dict[str, dict[str, Any]], catalog: dict) -> dict:
    """生成分类索引"""
    counts: dict[str, int] = defaultdict(int)
    for p in photos:
        counts[p["cat"]] += 1
    categories = []
    for cat, cfg in sorted(cat_index.items()):
        if counts.get(cat, 0) == 0:
            continue
        categories.append(
            {
                "slug": cat,
                "label": cat,
                "tier": cfg.get("tier"),
                "count": counts[cat],
                "shot_type": cfg.get("shot_type"),
                "scenes": cfg.get("scenes", []),
                "alias_group": cfg.get("alias_group"),
                "mock_priority": cfg.get("mock_priority", 2),
                "usage": usage_for_cat(cfg),
                "description": (cfg.get("notes") or cfg.get("accept", [""])[0] if cfg.get("accept") else ""),
            }
        )
    return {
        "version": catalog.get("version", 2),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total": len(photos),
        "categories": categories,
        "alias_groups": catalog.get("alias_groups", {}),
    }


def build_scenes(photos: list[dict], catalog: dict) -> dict:
    """生成 scene → photo id 池（mock 默认池 mock_priority<=2）"""
    scene_all: dict[str, list[int]] = defaultdict(list)
    scene_mock: dict[str, list[int]] = defaultdict(list)
    cat_scene_map = catalog.get("scenes", {})

    for p in photos:
        pid = p["id"]
        for scene in p.get("scenes") or []:
            scene_all[scene].append(pid)
            if p.get("mock_priority", 2) <= 2:
                scene_mock[scene].append(pid)

    # gallery = 全库 mock_priority<=2
    all_mock_ids = [p["id"] for p in photos if p.get("mock_priority", 2) <= 2]
    scene_all["gallery"] = [p["id"] for p in photos]
    scene_mock["gallery"] = all_mock_ids

    scenes_out = []
    for slug, label_pairs in [
        ("product", "商品"),
        ("food", "餐饮"),
        ("news", "新闻资讯"),
        ("article", "文章博客"),
        ("travel", "出行"),
        ("hotel", "酒店民宿"),
        ("banner", "首页轮播"),
        ("social", "社交动态"),
        ("education", "教育"),
        ("health", "健康医疗"),
        ("realestate", "房产家居"),
        ("business", "商务金融"),
        ("game", "游戏"),
        ("promo", "促销活动"),
        ("gallery", "图集混排"),
    ]:
        cats = cat_scene_map.get(slug, [])
        scenes_out.append(
            {
                "slug": slug,
                "label": label_pairs,
                "categories": cats if slug != "gallery" else ["*"],
                "photo_count": len(scene_all.get(slug, [])),
                "mock_pool_count": len(scene_mock.get(slug, [])),
                "mock_field": {
                    "product": "products.image",
                    "news": "posts.cover",
                    "food": "restaurants.image",
                    "travel": "trips.image",
                    "hotel": "hotels.image",
                }.get(slug),
            }
        )

    return {
        "version": catalog.get("version", 2),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "scenes": scenes_out,
        "pools": {
            "all": {k: v for k, v in sorted(scene_all.items())},
            "mock": {k: v for k, v in sorted(scene_mock.items())},
        },
    }


def main() -> None:
    """入口：写 manifest 到图库目录与 API data 目录"""
    catalog = load_catalog()
    cat_index = build_cat_index(catalog)
    photos, stats = collect_photos(cat_index)

    categories = build_categories(photos, cat_index, catalog)
    scenes = build_scenes(photos, catalog)

    manifest_payload = {
        "version": 2,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total": len(photos),
        "stats": stats,
        "photos": photos,
    }

    for target in (MANIFEST_DIR, API_DATA_DIR):
        target.mkdir(parents=True, exist_ok=True)
        (target / "photos.json").write_text(
            json.dumps(manifest_payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        (target / "categories.json").write_text(
            json.dumps(categories, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        (target / "scenes.json").write_text(
            json.dumps(scenes, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    report = {
        "step": "build_manifest",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_photos": len(photos),
        "total_categories": len(categories["categories"]),
        "enriched_meta": stats["enriched_meta"],
        "written_meta": stats["written_meta"],
        "skipped_dirs": stats["skipped_dirs"],
        "outputs": [
            str(MANIFEST_DIR),
            str(API_DATA_DIR),
        ],
    }
    report_path = LIBRARY_ROOT / "_reports" / "manifest_build.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
