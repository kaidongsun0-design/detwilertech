#!/usr/bin/env bash
# ============================================================
# dev-clean.sh — 干净启动 dev server (Git Bash / WSL / macOS / Linux)
#  1. 杀掉占用 3000 端口的 node 进程
#  2. 清掉 dev 缓存 .next-dev
#  3. 用新的 distDir(.next-dev)启动 dev,绝不与 build 产物冲突
#
# 用法: bash dev-clean.sh
# ============================================================

set -e
cd "$(dirname "$0")"

echo "[1/3] Killing node processes on port 3000..."
PIDS=$(netstat -ano 2>/dev/null | grep ":3000.*LISTENING" | awk '{print $NF}' | sort -u || true)
if [ -n "$PIDS" ]; then
  for pid in $PIDS; do
    echo "    killing PID $pid"
    taskkill //F //PID "$pid" >/dev/null 2>&1 || kill -9 "$pid" 2>/dev/null || true
  done
fi
# 兜底:把所有 node.exe 也杀了(Git Bash 在 Windows 上跑时)
if command -v taskkill >/dev/null 2>&1; then
  taskkill //F //IM node.exe >/dev/null 2>&1 || true
fi
sleep 1

echo "[2/3] Cleaning dev cache (.next-dev)..."
rm -rf .next-dev dev.log

echo "[3/3] Starting dev server on port 3000 (distDir=.next-dev)..."
export NODE_OPTIONS=--no-deprecation
exec npx next dev -p 3000 -H 0.0.0.0
