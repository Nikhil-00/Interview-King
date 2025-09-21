@echo off
REM Interview King - Quick Deployment Setup Script for Windows
REM This script helps prepare your project for Render deployment

echo 🚀 Interview King - Render Deployment Setup
echo ===========================================

REM Check if we're in the right directory
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found. Please run this script from the project root directory.
    pause
    exit /b 1
)

echo ✅ Found render.yaml configuration

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit - Interview King deployment ready"
) else (
    echo ✅ Git repository already initialized
)

REM Check for environment variables
echo.
echo 🔍 Checking environment configuration...

if not exist ".env.production" (
    echo ❌ .env.production template not found
) else (
    echo ✅ Production environment template ready
)

REM Verify requirements.txt
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found
    pause
    exit /b 1
) else (
    echo ✅ Python requirements file ready
)

REM Verify frontend package.json
if not exist "FRONTEND\package.json" (
    echo ❌ Frontend package.json not found
    pause
    exit /b 1
) else (
    echo ✅ Frontend configuration ready
)

echo.
echo 📋 Pre-deployment Checklist:
echo ----------------------------
echo 1. [ ] Get your Groq API key from https://console.groq.com
echo 2. [ ] Push your code to GitHub
echo 3. [ ] Create account at https://render.com
echo 4. [ ] Deploy using Blueprint from render.yaml
echo 5. [ ] Set environment variables in Render dashboard
echo 6. [ ] Update CORS settings with frontend URL
echo.

echo 🎯 Quick Commands:
echo ------------------
echo Push to GitHub:
echo   git add .
echo   git commit -m "Ready for Render deployment"
echo   git push origin main
echo.

echo 📖 For detailed instructions, see DEPLOYMENT.md
echo.
echo 🎉 Setup complete! Your project is ready for Render deployment.
echo.
pause