#!/usr/bin/env bash
# 部署脚本公共变量（由其它脚本 source）
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

# 可选：deploy/.env.deploy（不提交密钥；仅放公开构建变量）
if [[ -f "$ROOT_DIR/deploy/.env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/deploy/.env.deploy"
  set +a
fi

export VITE_API_BASE="${VITE_API_BASE:-https://cdn.devimg.cn}"
export VITE_DOCS_ORIGIN="${VITE_DOCS_ORIGIN:-https://devimg.cn}"
export PM2_APP_NAME="${PM2_APP_NAME:-devimage-api}"
export PORT="${PORT:-3010}"
export ECOSYSTEM_FILE="${ECOSYSTEM_FILE:-$ROOT_DIR/deploy/ecosystem.config.cjs}"
export HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/health}"

mkdir -p "$ROOT_DIR/logs"

# 打印步骤标题
log() {
  printf '\n==> %s\n' "$*"
}
