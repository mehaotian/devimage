#!/usr/bin/env bash
# 拉取最新代码（fast-forward）
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

log "git pull --ff-only"
git pull --ff-only

log "当前提交"
git log -1 --oneline
