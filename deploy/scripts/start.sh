#!/usr/bin/env bash
# 启动或热更新 PM2 中的 API
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "未找到 pm2，请先: npm i -g pm2" >&2
  exit 1
fi

if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  log "pm2 reload $PM2_APP_NAME"
  pm2 reload "$PM2_APP_NAME" --update-env
else
  log "pm2 start $ECOSYSTEM_FILE"
  pm2 start "$ECOSYSTEM_FILE"
fi

pm2 save
pm2 list
