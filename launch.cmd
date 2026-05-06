@echo off
REM ============================================================
REM CPG.ai Data Products Tool — One-click launcher (Windows)
REM
REM What this does:
REM   1. Verifies Node.js is installed
REM   2. Installs npm dependencies if node_modules is missing
REM   3. Initializes the SQLite database if it doesn't exist
REM   4. Starts the API (port 5000) and the frontend (port 5173)
REM      together in the same terminal window with prefixed output
REM
REM Usage: Double-click this file, or run from terminal:
REM        launch.cmd
REM ============================================================

cd /d "%~dp0"

echo.
echo ============================================
echo   CPG.ai Data Products Tool
echo ============================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 22.x from https://nodejs.org
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [SETUP] Installing dependencies (first run only)...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

REM Launch
echo [LAUNCH] Starting API on port 5000 and frontend on port 5173...
echo [LAUNCH] Open http://localhost:5173 in your browser.
echo [LAUNCH] Press Ctrl+C to stop both servers.
echo.

call npm start
