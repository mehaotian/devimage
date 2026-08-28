#!/usr/bin/env bash
# 在本机通过 SSH 远程执行服务器上的 pnpm deploy
# 用法：DEPLOY_SSH=ht@x.x.x.x DEPLOY_PATH=/home/ht/devimg pnpm deploy:remote
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [[ -f "$ROOT_DIR/deploy/.env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/deploy/.env.deploy"
  set +a
fi

DEPLOY_SSH="${DEPLOY_SSH:?请设置 DEPLOY_SSH，如 ht@49.233.156.180}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/ht/devimg}"
REMOTE_CMD="${1:-deploy}"

echo "==> ssh $DEPLOY_SSH → $DEPLOY_PATH → pnpm run $REMOTE_CMD"
ssh -t "$DEPLOY_SSH" "cd '$DEPLOY_PATH' && pnpm run $REMOTE_CMD"
