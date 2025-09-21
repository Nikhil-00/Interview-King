# Interview King - Netlify Deployment Guide

This guide will help you deploy the Interview King application with the frontend on Netlify and the backend on Railway/Render.

## Architecture Overview

- **Frontend**: React + Vite application deployed to Netlify
- **Backend**: FastAPI application deployed to Railway or Render
- **Database**: ChromaDB (embedded database that comes with the backend)

## Prerequisites

1. GitHub account with your code repository
2. Netlify account (free tier available)
3. Railway or Render account (free tier available)
4. Groq API key for the AI functionality

## Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Verify all configuration files are present**:
   - ✅ `netlify.toml` (created)
   - ✅ `FRONTEND/.env.production` (exists)
   - ✅ `FRONTEND/.env.development` (exists)
   - ✅ `FRONTEND/public/_redirects` (exists)

## Step 2: Deploy Backend (Choose Railway or Render)

### Option A: Deploy to Railway (Recommended)

1. **Sign up/Login to Railway**: https://railway.app
2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Interview-King repository
3. **Configure Backend Service**:
   - Select the `Backend` folder as the root directory
   - Railway will auto-detect it's a Python app
4. **Set Environment Variables**:
   ```
   GROQ_API_KEY=your_actual_groq_api_key
   ENVIRONMENT=production
   DEBUG=false
   PORT=8000
   ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
   ```
5. **Deploy**: Railway will automatically build and deploy your backend

### Option B: Deploy to Render

1. **Sign up/Login to Render**: https://render.com
2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
3. **Configure Service**:
   - **Root Directory**: `Backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
4. **Set Environment Variables**:
   ```
   GROQ_API_KEY=your_actual_groq_api_key
   ENVIRONMENT=production
   DEBUG=false
   ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
   ```

## Step 3: Get Your Backend URL

After backend deployment, copy your backend URL:
- **Railway**: Usually `https://your-project-name.railway.app`
- **Render**: Usually `https://your-service-name.onrender.com`

## Step 4: Update Frontend Environment Variables

Update your `FRONTEND/.env.production` file with your actual backend URL:

```bash
# Production environment variables
VITE_API_URL=https://your-backend-url-here
```

Commit and push this change:
```bash
git add FRONTEND/.env.production
git commit -m "Update production API URL"
git push origin main
```

## Step 5: Deploy Frontend to Netlify

### Method 1: Netlify Dashboard (Recommended)

1. **Login to Netlify**: https://app.netlify.com
2. **Import Project**:
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your Interview-King repository
3. **Configure Build Settings**:
   - **Base directory**: `FRONTEND`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `FRONTEND/dist`
4. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url`
5. **Deploy**: Click "Deploy site"

### Method 2: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**:
   ```bash
   cd FRONTEND
   netlify login
   netlify init
   netlify deploy --prod
   ```

## Step 6: Update Backend CORS Settings

1. **Get your Netlify site URL** (e.g., `https://amazing-app-123456.netlify.app`)
2. **Update backend environment variables**:
   - Go to your Railway/Render dashboard
   - Update `ALLOWED_ORIGINS` to include your Netlify URL:
     ```
     ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
     ```
3. **Redeploy backend** if needed

## Step 7: Custom Domain (Optional)

1. **In Netlify Dashboard**:
   - Go to Domain settings
   - Add custom domain
   - Update DNS records as instructed
2. **Update Backend CORS**:
   - Add your custom domain to `ALLOWED_ORIGINS`

## Verification Checklist

- [ ] Backend deployed and accessible via URL
- [ ] Frontend deployed to Netlify
- [ ] Environment variables configured correctly
- [ ] CORS settings allow Netlify domain
- [ ] File upload functionality works
- [ ] AI analysis generates results
- [ ] Chat functionality works
- [ ] No console errors in browser

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   ```
   Access to fetch at 'backend-url' from origin 'netlify-url' has been blocked by CORS policy
   ```
   **Solution**: Update `ALLOWED_ORIGINS` in backend environment variables

2. **Build Failures**:
   ```
   Error: Cannot resolve dependency
   ```
   **Solution**: Check `package.json` dependencies and Node.js version

3. **API Connection Issues**:
   ```
   Network error: Unable to connect to backend server
   ```
   **Solution**: Verify `VITE_API_URL` environment variable and backend status

4. **File Upload Errors**:
   ```
   Upload failed: 500 Internal Server Error
   ```
   **Solution**: Check backend logs for Groq API key and file processing errors

### Debugging Steps

1. **Check Netlify Build Logs**:
   - Go to Deploys → View deploy logs
   - Look for build errors or warnings

2. **Check Backend Logs**:
   - Railway: Check deployment logs in dashboard
   - Render: Go to service logs

3. **Test API Endpoints**:
   - Visit `https://your-backend-url/` (should return status message)
   - Visit `https://your-backend-url/test` (should return test data)

## Performance Optimization

### Frontend (Netlify)
- ✅ Automatic CDN and compression
- ✅ Instant cache invalidation
- ✅ Global edge locations

### Backend Considerations
- **Free Tier Limitations**: May have cold starts
- **Upgrade Options**: Consider paid plans for production use
- **File Storage**: Uploaded files are temporary (deleted after processing)

## Security Best Practices

1. **Environment Variables**:
   - Never commit API keys to Git
   - Use different keys for dev/prod
   - Rotate keys regularly

2. **CORS Configuration**:
   - Use specific domains, not wildcards
   - Regularly review allowed origins

3. **HTTPS**:
   - Both Netlify and Railway/Render provide HTTPS by default
   - Ensure all API calls use HTTPS

## Monitoring and Maintenance

1. **Netlify Analytics**: Monitor site performance and usage
2. **Backend Monitoring**: Check Railway/Render dashboards for uptime
3. **Error Tracking**: Implement error logging for production issues

## Scaling Considerations

### Current Limitations
- **Backend**: Free tier has usage limits and may sleep
- **File Processing**: Limited by memory and processing time
- **Storage**: No persistent file storage

### Upgrade Path
- **Paid Hosting**: For guaranteed uptime and performance
- **Database**: Add PostgreSQL for persistent data storage
- **CDN**: For large file handling and global performance

## Success! 🎉

Once deployed, your Interview King application will be available at:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-backend.railway.app` or `https://your-backend.onrender.com`

## Next Steps

Consider these enhancements:
- [ ] User authentication and accounts
- [ ] Results history and storage
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app version
- [ ] API rate limiting
- [ ] Automated testing pipeline

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Vite Docs**: https://vitejs.dev