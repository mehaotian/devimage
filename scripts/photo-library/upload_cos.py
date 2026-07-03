#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DevImage 图库 COS 批量上传（并发 + manifest 对齐 + checkpoint）

原则：
- 仅上传 manifest/photos.json 中声明的条目，不扫描磁盘、不上传多余文件
- cos_key 必须与 manifest 一致，且全局唯一
- 已存在且体积一致 → 跳过（不重复 PUT）
- checkpoint 记录已验证 key，断点续传时不重复 HEAD/PUT
- 失败项完整写入报告，可 --retry-failed 重试
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = REPO_ROOT / "apps" / "api" / ".env"
LIBRARY_ROOT = Path(
    "/Users/mehaotian/Documents/workBuddyProject/image/placeholder-images"
)
MANIFEST_DIR = LIBRARY_ROOT / "manifest"
REPORT_DIR = LIBRARY_ROOT / "_reports"
CHECKPOINT_PATH = REPORT_DIR / "cos_upload_checkpoint.json"
PROGRESS_PATH = REPORT_DIR / "cos_upload_progress.json"


def load_env(path: Path) -> dict[str, str]:
    """解析 .env 文件"""
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()
    return env


def get_cos_client(secret_id: str, secret_key: str, region: str):
    """创建 COS SDK 客户端"""
    try:
        from qcloud_cos import CosConfig, CosS3Client
    except ImportError:
        print("请先安装: pip install cos-python-sdk-v5", file=sys.stderr)
        sys.exit(1)
    config = CosConfig(Region=region, SecretId=secret_id, SecretKey=secret_key)
    return CosS3Client(config)


def normalize_key(cos_key: str) -> str:
    """规范化 COS object key"""
    return cos_key.lstrip("/")


def load_checkpoint() -> dict[str, dict[str, Any]]:
    """加载已验证 checkpoint：key → {id, size, verified_at}"""
    if not CHECKPOINT_PATH.exists():
        return {}
    try:
        data = json.loads(CHECKPOINT_PATH.read_text(encoding="utf-8"))
        return data.get("verified", {})
    except json.JSONDecodeError:
        return {}


def save_checkpoint(verified: dict[str, dict[str, Any]]) -> None:
    """持久化 checkpoint"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_PATH.write_text(
        json.dumps(
            {
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "count": len(verified),
                "verified": verified,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def cos_key_to_local_path(cos_key: str, seed_prefix: str) -> Path:
    """从 cos_key 推导采集侧本地原图路径（仅上传脚本使用，不进 API manifest）"""
    prefix = normalize_key(seed_prefix)
    key = normalize_key(cos_key)
    if not key.startswith(prefix):
        raise ValueError(f"cos_key 不在 seed 前缀下: {cos_key}")
    return LIBRARY_ROOT / key[len(prefix) :]


def validate_manifest_rows(
    photos: list[dict[str, Any]],
    seed_prefix: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    """
    校验 manifest 行：cos_key 唯一且与 id/cat 对应；本地可读性单独判定
    返回 (valid_rows, fatal_errors, excluded_rows)
    """
    fatal: list[dict[str, Any]] = []
    excluded: list[dict[str, Any]] = []
    seen_keys: dict[str, int] = {}
    valid: list[dict[str, Any]] = []

    for row in photos:
        photo_id = row.get("id")
        cat = row.get("cat")
        pexels_id = row.get("pexels_id")
        cos_key = normalize_key(
            row.get("cos_key") or f"{seed_prefix}{cat}/pexels_{pexels_id}.jpeg"
        )
        expected_key = normalize_key(f"{seed_prefix}{cat}/pexels_{pexels_id}.jpeg")

        if cos_key != expected_key:
            fatal.append(
                {
                    "id": photo_id,
                    "reason": f"cos_key 与 manifest 规则不一致: {cos_key} != {expected_key}",
                }
            )
            continue

        if cos_key in seen_keys:
            fatal.append(
                {
                    "id": photo_id,
                    "cos_key": cos_key,
                    "reason": f"cos_key 重复，首次出现于 id={seen_keys[cos_key]}",
                }
            )
            continue
        seen_keys[cos_key] = photo_id

        try:
            local_path = cos_key_to_local_path(cos_key, seed_prefix)
        except ValueError as exc:
            fatal.append({"id": photo_id, "cos_key": cos_key, "reason": str(exc)})
            continue

        if not local_path.exists():
            excluded.append(
                {
                    "id": photo_id,
                    "cos_key": cos_key,
                    "reason": "采集侧本地原图不存在",
                }
            )
            continue

        local_size = local_path.stat().st_size
        if local_size < 1000:
            excluded.append(
                {
                    "id": photo_id,
                    "cos_key": cos_key,
                    "local_size": local_size,
                    "reason": "本地文件过小，疑似损坏，不上传",
                }
            )
            continue

        valid.append(
            {
                "id": photo_id,
                "cat": cat,
                "pexels_id": pexels_id,
                "cos_key": cos_key,
                "local_path": str(local_path),
                "local_size": local_size,
            }
        )

    return valid, fatal, excluded


def head_remote_size(client, bucket: str, cos_key: str) -> int | None:
    """HEAD 远程对象，返回 Content-Length；不存在返回 None"""
    try:
        resp = client.head_object(Bucket=bucket, Key=cos_key)
        return int(resp.get("Content-Length", 0))
    except Exception:
        return None


def put_photo(client, bucket: str, cos_key: str, local_path: Path) -> None:
    """上传单张原图（小文件 put_object 即可）"""
    with local_path.open("rb") as fp:
        client.put_object(
            Bucket=bucket,
            Key=cos_key,
            Body=fp,
            ContentType="image/jpeg",
            CacheControl="public, max-age=31536000, immutable",
        )


def process_one(
    row: dict[str, Any],
    client,
    bucket: str,
    checkpoint: dict[str, dict[str, Any]],
    lock: threading.Lock,
    skip_head: bool,
) -> dict[str, Any]:
    """
    处理单条 manifest 记录
    返回 status: uploaded | skipped_checkpoint | skipped_remote | failed
    """
    cos_key = row["cos_key"]
    local_path = Path(row["local_path"])
    local_size = row["local_size"]
    base = {
        "id": row["id"],
        "cat": row["cat"],
        "pexels_id": row["pexels_id"],
        "cos_key": cos_key,
        "local_size": local_size,
    }

    with lock:
        cached = checkpoint.get(cos_key)
        if cached and cached.get("size") == local_size:
            return {**base, "status": "skipped_checkpoint"}

    if not skip_head:
        remote_size = head_remote_size(client, bucket, cos_key)
        if remote_size is not None and remote_size == local_size:
            with lock:
                checkpoint[cos_key] = {
                    "id": row["id"],
                    "size": local_size,
                    "verified_at": datetime.now(timezone.utc).isoformat(),
                    "source": "head_skip",
                }
            return {**base, "status": "skipped_remote"}

    try:
        put_photo(client, bucket, cos_key, local_path)
        remote_size = head_remote_size(client, bucket, cos_key)
        if remote_size != local_size:
            return {
                **base,
                "status": "failed",
                "reason": f"上传后体积不一致 local={local_size} remote={remote_size}",
            }
        with lock:
            checkpoint[cos_key] = {
                "id": row["id"],
                "size": local_size,
                "verified_at": datetime.now(timezone.utc).isoformat(),
                "source": "uploaded",
            }
        return {**base, "status": "uploaded"}
    except Exception as exc:  # noqa: BLE001
        return {**base, "status": "failed", "reason": str(exc)}


def upload_manifest_files(
    client,
    bucket: str,
    manifest_prefix: str,
    checkpoint: dict[str, dict[str, Any]],
    lock: threading.Lock,
) -> list[dict[str, Any]]:
    """上传 manifest 三件套（仅 manifest 目录内文件）"""
    results: list[dict[str, Any]] = []
    for name in ("photos.json", "categories.json", "scenes.json"):
        local_m = MANIFEST_DIR / name
        cos_key = normalize_key(f"{manifest_prefix}{name}")
        if not local_m.exists():
            results.append({"file": name, "status": "failed", "reason": "本地 manifest 缺失"})
            continue
        local_size = local_m.stat().st_size
        remote_size = head_remote_size(client, bucket, cos_key)
        if remote_size == local_size:
            results.append({"file": name, "cos_key": cos_key, "status": "skipped_remote"})
            continue
        try:
            with local_m.open("rb") as fp:
                client.put_object(
                    Bucket=bucket,
                    Key=cos_key,
                    Body=fp,
                    ContentType="application/json",
                    CacheControl="public, max-age=3600",
                )
            with lock:
                checkpoint[cos_key] = {
                    "file": name,
                    "size": local_size,
                    "verified_at": datetime.now(timezone.utc).isoformat(),
                    "source": "manifest_upload",
                }
            results.append({"file": name, "cos_key": cos_key, "status": "uploaded"})
        except Exception as exc:  # noqa: BLE001
            results.append({"file": name, "cos_key": cos_key, "status": "failed", "reason": str(exc)})
    return results


def write_progress(summary: dict[str, Any], failed_sample: list[dict]) -> None:
    """写入进度文件"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    PROGRESS_PATH.write_text(
        json.dumps(
            {"step": "upload_cos", **summary, "failed_sample": failed_sample[-30:]},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    """批量上传入口"""
    parser = argparse.ArgumentParser(description="DevImage 图库 COS 上传")
    parser.add_argument("--workers", type=int, default=16, help="并发线程数，默认 16")
    parser.add_argument(
        "--retry-failed",
        action="store_true",
        help="仅重试 cos_upload_latest.json 中 failed 列表",
    )
    parser.add_argument(
        "--skip-head",
        action="store_true",
        help="不 HEAD 远端（仅依赖 checkpoint），适合刚续跑且确定无部分上传",
    )
    args = parser.parse_args()

    env = {**load_env(ENV_PATH), **os.environ}
    secret_id = env.get("TENCENT_SECRET_ID", "")
    secret_key = env.get("TENCENT_SECRET_KEY", "")
    region = env.get("COS_REGION", "ap-beijing")
    bucket = env.get("COS_BUCKET", "")
    seed_prefix = env.get("COS_SEED_PREFIX", "assets/seed-pack/").rstrip("/") + "/"
    manifest_prefix = env.get("COS_MANIFEST_PREFIX", "manifest/").rstrip("/") + "/"
    seed_key_prefix = normalize_key(seed_prefix)

    if not secret_id or not secret_key or not bucket:
        print("缺少 TENCENT_SECRET_ID / TENCENT_SECRET_KEY / COS_BUCKET", file=sys.stderr)
        sys.exit(1)

    photos_path = MANIFEST_DIR / "photos.json"
    if not photos_path.exists():
        print("请先运行 build_manifest.py", file=sys.stderr)
        sys.exit(1)

    with photos_path.open(encoding="utf-8") as f:
        manifest = json.load(f)

    photos = manifest.get("photos", [])
    valid_rows, fatal_errors, excluded_rows = validate_manifest_rows(photos, seed_prefix)
    if fatal_errors:
        err_path = REPORT_DIR / "cos_upload_validation_errors.json"
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        err_path.write_text(
            json.dumps({"fatal": fatal_errors, "excluded": excluded_rows}, ensure_ascii=False, indent=2)
            + "\n",
            encoding="utf-8",
        )
        print(f"manifest 致命校验失败 {len(fatal_errors)} 条，见 {err_path}", file=sys.stderr)
        sys.exit(1)
    if excluded_rows:
        print(
            f"排除 {len(excluded_rows)} 条无效本地文件（不上传），继续处理 {len(valid_rows)} 条",
            flush=True,
        )

    if args.retry_failed:
        latest = REPORT_DIR / "cos_upload_latest.json"
        if not latest.exists():
            print("无 cos_upload_latest.json，无法 --retry-failed", file=sys.stderr)
            sys.exit(1)
        failed_ids = {x.get("id") for x in json.loads(latest.read_text())["failed"] if x.get("id")}
        valid_rows = [r for r in valid_rows if r["id"] in failed_ids]
        print(f"--retry-failed: 待重试 {len(valid_rows)} 条")

    client = get_cos_client(secret_id, secret_key, region)
    checkpoint = load_checkpoint()
    lock = threading.Lock()
    started = datetime.now(timezone.utc).isoformat()

    counters = {
        "uploaded": 0,
        "skipped_checkpoint": 0,
        "skipped_remote": 0,
        "failed": 0,
    }
    failed_list: list[dict[str, Any]] = []
    total = len(valid_rows)

    print(
        f"开始上传 manifest 对齐原图 {total} 张 "
        f"(workers={args.workers}, checkpoint={len(checkpoint)}) → bucket={bucket}",
        flush=True,
    )

    done = 0
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {
            pool.submit(process_one, row, client, bucket, checkpoint, lock, args.skip_head): row
            for row in valid_rows
        }
        for fut in as_completed(futures):
            result = fut.result()
            status = result.get("status", "failed")
            if status == "failed":
                counters["failed"] += 1
                failed_list.append(result)
            else:
                counters[status] = counters.get(status, 0) + 1

            done += 1
            if done % 100 == 0 or done == total:
                with lock:
                    save_checkpoint(checkpoint)
                verified_photos = sum(
                    1 for k in checkpoint if k.startswith(seed_key_prefix)
                )
                print(
                    f"  进度 {done}/{total} "
                    f"新传={counters['uploaded']} "
                    f"跳过(checkpoint)={counters['skipped_checkpoint']} "
                    f"跳过(remote)={counters['skipped_remote']} "
                    f"失败={counters['failed']} "
                    f"checkpoint={verified_photos}",
                    flush=True,
                )
                write_progress(
                    {
                        "progress": f"{done}/{total}",
                        "manifest_total": len(photos),
                        **counters,
                        "checkpoint_verified": verified_photos,
                    },
                    failed_list,
                )

    save_checkpoint(checkpoint)
    manifest_results = upload_manifest_files(client, bucket, manifest_prefix, checkpoint, lock)
    save_checkpoint(checkpoint)

    verified_photo_keys = {
        k for k in checkpoint if k.startswith(seed_key_prefix)
    }
    missing_ids = [
        r["id"]
        for r in valid_rows
        if r["cos_key"] not in verified_photo_keys
    ]

    finished = datetime.now(timezone.utc).isoformat()
    report = {
        "step": "upload_cos",
        "started_at": started,
        "finished_at": finished,
        "bucket": bucket,
        "region": region,
        "workers": args.workers,
        "summary": {
            "manifest_photos_total": len(photos),
            "validated_rows": total,
            "excluded_local_invalid": len(excluded_rows),
            "uploaded_new": counters["uploaded"],
            "skipped_checkpoint": counters["skipped_checkpoint"],
            "skipped_remote": counters["skipped_remote"],
            "failed": counters["failed"],
            "checkpoint_verified_photos": len(verified_photo_keys),
            "missing_after_run": len(missing_ids),
            "manifest_files": manifest_results,
        },
        "missing_ids": missing_ids[:100],
        "excluded": excluded_rows,
        "failed": failed_list,
    }

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORT_DIR / f"cos_upload_{ts}.json"
    latest_path = REPORT_DIR / "cos_upload_latest.json"
    body = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    report_path.write_text(body, encoding="utf-8")
    latest_path.write_text(body, encoding="utf-8")
    write_progress({**report["summary"], "progress": f"{total}/{total}"}, failed_list)

    print(json.dumps(report["summary"], ensure_ascii=False, indent=2))
    print(f"checkpoint: {CHECKPOINT_PATH}")
    print(f"报告: {report_path}")

    if counters["failed"] or missing_ids:
        sys.exit(2)


if __name__ == "__main__":
    main()
