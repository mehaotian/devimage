#!/usr/bin/env bash
# 完整生产部署：pull → install/build → reload PM2 → health
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

log "开始部署 $(date '+%F %T')"
bash "$ROOT_DIR/deploy/scripts/pull.sh"
bash "$ROOT_DIR/deploy/scripts/build.sh"
bash "$ROOT_DIR/deploy/scripts/start.sh"
bash "$ROOT_DIR/deploy/scripts/health.sh"
log "部署完成 $(date '+%F %T')"
