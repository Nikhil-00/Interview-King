#!/bin/bash

# Interview King - Netlify Deployment Script
# This script helps you deploy your application step by step

echo "🚀 Interview King - Netlify Deployment Helper"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: netlify.toml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found netlify.toml configuration"

# Check if frontend directory exists
if [ ! -d "FRONTEND" ]; then
    echo "❌ Error: FRONTEND directory not found."
    exit 1
fi

echo "✅ Found FRONTEND directory"

# Check if backend directory exists
if [ ! -d "Backend" ]; then
    echo "❌ Error: Backend directory not found."
    exit 1
fi

echo "✅ Found Backend directory"

echo ""
echo "📋 Deployment Checklist:"
echo "========================"

# Check for environment files
if [ -f "FRONTEND/.env.production" ]; then
    echo "✅ Production environment file exists"
else
    echo "⚠️  Production environment file missing - you'll need to set VITE_API_URL"
fi

# Check if git is initialized
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  You have uncommitted changes. Consider committing them first."
    else
        echo "✅ No uncommitted changes"
    fi
else
    echo "⚠️  Git repository not initialized. You'll need to push to GitHub."
fi

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. 🎯 Deploy your backend first:"
echo "   - Go to https://railway.app or https://render.com"
echo "   - Connect your GitHub repository"
echo "   - Set up environment variables (GROQ_API_KEY, etc.)"
echo ""
echo "2. 📝 Update your backend URL:"
echo "   - Copy your backend URL from Railway/Render"
echo "   - Update FRONTEND/.env.production with: VITE_API_URL=https://your-backend-url"
echo "   - Commit and push changes"
echo ""
echo "3. 🌐 Deploy to Netlify:"
echo "   - Go to https://app.netlify.com"
echo "   - Click 'New site from Git'"
echo "   - Select your repository"
echo "   - Use these settings:"
echo "     - Base directory: FRONTEND"
echo "     - Build command: npm install && npm run build"
echo "     - Publish directory: FRONTEND/dist"
echo ""
echo "4. 🔧 Configure CORS:"
echo "   - Add your Netlify URL to backend ALLOWED_ORIGINS"
echo "   - Format: https://your-site.netlify.app"
echo ""
echo "5. ✅ Test your deployment:"
echo "   - Visit your Netlify site"
echo "   - Try uploading files and analyzing them"
echo ""

# Check for node and npm
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed ($(node --version))"
else
    echo "⚠️  Node.js not found - you'll need it for local testing"
fi

if command -v npm &> /dev/null; then
    echo "✅ npm is installed ($(npm --version))"
else
    echo "⚠️  npm not found - you'll need it for local testing"
fi

echo ""
echo "📚 For detailed instructions, see: NETLIFY_DEPLOYMENT.md"
echo "🆘 Need help? Check the troubleshooting section in the deployment guide"
echo ""
echo "Happy deploying! 🎉"