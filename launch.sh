#!/usr/bin/env bash
# ============================================================
# CPG.ai Data Products Tool — One-click launcher (macOS/Linux)
#
# What this does:
#   1. Verifies Node.js is installed
#   2. Installs npm dependencies if node_modules is missing
#   3. Initializes the SQLite database if it doesn't exist
#   4. Starts the API (port 5000) and the frontend (port 5173)
#      together with prefixed output
#
# Usage: ./launch.sh
# ============================================================

set -e
cd "$(dirname "$0")"

echo
echo "============================================"
echo "   CPG.ai Data Products Tool"
echo "============================================"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed. Install Node 22.x from https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "[SETUP] Installing dependencies (first run only)..."
  npm install --legacy-peer-deps
fi

echo "[LAUNCH] Starting API on port 5000 and frontend on port 5173..."
echo "[LAUNCH] Open http://localhost:5173 in your browser."
echo "[LAUNCH] Press Ctrl+C to stop both servers."
echo

npm start
