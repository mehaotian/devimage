#!/usr/bin/env bash
# 本机健康检查
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

log "GET $HEALTH_URL"
curl -sS -o /tmp/devimage-health.json -w "HTTP %{http_code}\n" "$HEALTH_URL"
cat /tmp/devimage-health.json
echo
curl -sS -o /dev/null -w "placeholder /400/300 %{http_code}\n" "http://127.0.0.1:${PORT}/400/300"
