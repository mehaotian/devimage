#!/usr/bin/env bash
# 停止 API（不删除 PM2 应用记录）
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

log "pm2 stop $PM2_APP_NAME"
pm2 stop "$PM2_APP_NAME"
pm2 list
