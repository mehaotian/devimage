#!/usr/bin/env bash
# 安装依赖并构建 API + 文档站（生产 URL）
# shellcheck source=./_common.sh
source "$(cd "$(dirname "$0")" && pwd)/_common.sh"

log "pnpm install"
pnpm install --frozen-lockfile

log "build api + docs (VITE_API_BASE=$VITE_API_BASE)"
VITE_API_BASE="$VITE_API_BASE" VITE_DOCS_ORIGIN="$VITE_DOCS_ORIGIN" pnpm build

log "构建完成"
test -f apps/api/dist/main.js
test -f apps/docs/.vitepress/dist/index.html
