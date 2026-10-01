@echo off
cd /d "%~dp0.."
if not exist node_modules\vite\bin\vite.js (
  echo Run npm ci first.
  pause
  exit /b 1
)
call npm run dev -- --open
