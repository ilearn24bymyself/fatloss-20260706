@echo off
cd /d "%~dp0"

echo =========================================
echo GitHub Pages Deployment Script (002 Cloud)
echo =========================================
echo.
set GITHUB_USER=coolchife

echo.
echo [1/4] Initializing Git repository...
if not exist .git (
    git init
    git add .
    git commit -m "Initial commit"
) else (
    git add .
    git commit -m "Update"
)

echo.
echo [2/4] Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/fatloss-20260706.git
git branch -M main

echo.
echo [3/4] Pushing to GitHub...
git push -u origin main

echo.
echo [4/4] Building and Deploying to GitHub Pages...
call npm run build
call npm run deploy

echo.
echo =========================================
echo DONE!
echo Your site will be live at:
echo https://%GITHUB_USER%.github.io/fatloss-20260706/
echo =========================================
pause
