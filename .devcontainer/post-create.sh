#!/usr/bin/env bash
# Runs once after the Codespace container is created.
# Installs dependencies and initializes the SQLite database.

set -e

echo "================================================"
echo "  CPG.ai Data Products Tool — Codespace Setup   "
echo "================================================"
echo

echo "[1/2] Installing npm dependencies..."
npm install --legacy-peer-deps --no-audit --no-fund

echo
echo "[2/2] Initializing SQLite database..."
node db/init.js

echo
echo "================================================"
echo "  Setup complete!"
echo
echo "  To start the app:"
echo "    npm start"
echo
echo "  Then click the 'Web App (Vite)' port in the"
echo "  Ports panel to open the app in your browser."
echo "================================================"
