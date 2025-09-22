@echo off
echo Interview King - Backend URL Update Script
echo =========================================
echo.
echo Current backend URL in .env.production:
type "FRONTEND\.env.production"
echo.
echo.
set /p BACKEND_URL="Enter your new backend URL (e.g., https://your-project.railway.app): "
echo.
echo Updating .env.production file...
echo # Production environment variables > "FRONTEND\.env.production"
echo VITE_API_URL=%BACKEND_URL% >> "FRONTEND\.env.production"
echo.
echo Updated! New content:
type "FRONTEND\.env.production"
echo.
echo Don't forget to commit and push this change to GitHub!
echo git add FRONTEND/.env.production
echo git commit -m "Update production API URL"
echo git push origin main
pause