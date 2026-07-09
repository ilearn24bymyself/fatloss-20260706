@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting Fat Loss Tracker...
npm run dev -- --open
pause
