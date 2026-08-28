#!/usr/bin/env bash
# 查看 PM2 状态
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

pm2 list
pm2 describe "$PM2_APP_NAME" || true
