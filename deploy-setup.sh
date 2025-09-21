#!/bin/bash

# Interview King - Quick Deployment Setup Script
# This script helps prepare your project for Render deployment

echo "🚀 Interview King - Render Deployment Setup"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root directory."
    exit 1
fi

echo "✅ Found render.yaml configuration"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Interview King deployment ready"
else
    echo "✅ Git repository already initialized"
fi

# Check for environment variables
echo ""
echo "🔍 Checking environment configuration..."

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production template not found"
else
    echo "✅ Production environment template ready"
fi

# Verify requirements.txt
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
else
    echo "✅ Python requirements file ready"
fi

# Verify frontend package.json
if [ ! -f "FRONTEND/package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
else
    echo "✅ Frontend configuration ready"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "----------------------------"
echo "1. [ ] Get your Groq API key from https://console.groq.com"
echo "2. [ ] Push your code to GitHub"
echo "3. [ ] Create account at https://render.com"
echo "4. [ ] Deploy using Blueprint from render.yaml"
echo "5. [ ] Set environment variables in Render dashboard"
echo "6. [ ] Update CORS settings with frontend URL"
echo ""

echo "🎯 Quick Commands:"
echo "------------------"
echo "Push to GitHub:"
echo "  git add ."
echo "  git commit -m \"Ready for Render deployment\""
echo "  git push origin main"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Setup complete! Your project is ready for Render deployment."