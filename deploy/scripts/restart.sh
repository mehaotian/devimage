#!/usr/bin/env bash
# 重启 API
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

log "pm2 restart $PM2_APP_NAME"
pm2 restart "$PM2_APP_NAME" --update-env
pm2 list
