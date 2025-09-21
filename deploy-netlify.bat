@echo off
REM Interview King - Netlify Deployment Script for Windows
REM This script helps you deploy your application step by step

echo 🚀 Interview King - Netlify Deployment Helper
echo ==============================================

REM Check if we're in the right directory
if not exist "netlify.toml" (
    echo ❌ Error: netlify.toml not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Found netlify.toml configuration

REM Check if frontend directory exists
if not exist "FRONTEND" (
    echo ❌ Error: FRONTEND directory not found.
    pause
    exit /b 1
)

echo ✅ Found FRONTEND directory

REM Check if backend directory exists
if not exist "Backend" (
    echo ❌ Error: Backend directory not found.
    pause
    exit /b 1
)

echo ✅ Found Backend directory

echo.
echo 📋 Deployment Checklist:
echo ========================

REM Check for environment files
if exist "FRONTEND\.env.production" (
    echo ✅ Production environment file exists
) else (
    echo ⚠️  Production environment file missing - you'll need to set VITE_API_URL
)

REM Check if git is initialized
if exist ".git" (
    echo ✅ Git repository initialized
) else (
    echo ⚠️  Git repository not initialized. You'll need to push to GitHub.
)

echo.
echo 🔧 Next Steps:
echo ==============
echo 1. 🎯 Deploy your backend first:
echo    - Go to https://railway.app or https://render.com
echo    - Connect your GitHub repository
echo    - Set up environment variables (GROQ_API_KEY, etc.)
echo.
echo 2. 📝 Update your backend URL:
echo    - Copy your backend URL from Railway/Render
echo    - Update FRONTEND\.env.production with: VITE_API_URL=https://your-backend-url
echo    - Commit and push changes
echo.
echo 3. 🌐 Deploy to Netlify:
echo    - Go to https://app.netlify.com
echo    - Click 'New site from Git'
echo    - Select your repository
echo    - Use these settings:
echo      - Base directory: FRONTEND
echo      - Build command: npm install ^&^& npm run build
echo      - Publish directory: FRONTEND/dist
echo.
echo 4. 🔧 Configure CORS:
echo    - Add your Netlify URL to backend ALLOWED_ORIGINS
echo    - Format: https://your-site.netlify.app
echo.
echo 5. ✅ Test your deployment:
echo    - Visit your Netlify site
echo    - Try uploading files and analyzing them
echo.

REM Check for node and npm
node --version >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js is installed (%%i)
) else (
    echo ⚠️  Node.js not found - you'll need it for local testing
)

npm --version >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm is installed (%%i)
) else (
    echo ⚠️  npm not found - you'll need it for local testing
)

echo.
echo 📚 For detailed instructions, see: NETLIFY_DEPLOYMENT.md
echo 🆘 Need help? Check the troubleshooting section in the deployment guide
echo.
echo Happy deploying! 🎉
echo.
pause