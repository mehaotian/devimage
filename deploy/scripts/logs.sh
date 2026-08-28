#!/usr/bin/env bash
# 跟踪 API 日志（Ctrl+C 退出）
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

pm2 logs "$PM2_APP_NAME" --lines "${1:-80}"
