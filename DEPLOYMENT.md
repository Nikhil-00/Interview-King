# Interview King - Render Deployment Guide

This guide will help you deploy the Interview King application to Render. The application consists of a FastAPI backend and a React frontend.

## Prerequisites

1. GitHub account with your code repository
2. Render account (free tier available)
3. Groq API key for the AI functionality

## Project Structure

```
Interview-King-main/
├── Backend/               # FastAPI backend
├── FRONTEND/             # React frontend
├── render.yaml          # Render deployment configuration
├── requirements.txt     # Python dependencies
└── .env.production     # Production environment template
```

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Ensure all files are committed**, especially:
   - `render.yaml`
   - Updated `requirements.txt`
   - Frontend environment files
   - Backend CORS configuration

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" → "Blueprint"

2. **Deploy from Blueprint**:
   - Connect your GitHub repository
   - Select the repository containing your Interview King code
   - Render will automatically detect the `render.yaml` file
   - Click "Apply"

#### Option B: Manual Service Creation

If you prefer to create services manually:

1. **Create Backend Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Root Directory**: `Backend`
     - **Build Command**: `pip install -r ../requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

2. **Create Frontend Service**:
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository
   - Configure:
     - **Build Command**: `cd FRONTEND && npm install && npm run build`
     - **Publish Directory**: `FRONTEND/dist`
     - **Plan**: Free

### Step 3: Configure Environment Variables

#### Backend Environment Variables

In your backend service dashboard, add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `GROQ_API_KEY` | `your_actual_groq_api_key` | Get from [Groq Console](https://console.groq.com) |
| `ENVIRONMENT` | `production` | Sets production mode |
| `DEBUG` | `false` | Disables debug mode |
| `ALLOWED_ORIGINS` | `https://your-frontend-url.onrender.com` | Replace with actual frontend URL |

#### Frontend Environment Variables

In your frontend service dashboard, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` | Replace with actual backend URL |

### Step 4: Update CORS Settings

After both services are deployed:

1. **Get your frontend URL** from the Render dashboard
2. **Update backend environment variable**:
   - Go to your backend service → Environment
   - Update `ALLOWED_ORIGINS` with your actual frontend URL
   - Click "Save Changes"

### Step 5: Test Your Deployment

1. **Access your frontend** at the provided Render URL
2. **Test the file upload functionality**:
   - Upload a resume and job description
   - Verify the analysis results appear
3. **Check the backend health** by visiting `https://your-backend-url.onrender.com/`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```
   Error: Failed to install requirements
   ```
   - Check `requirements.txt` for version conflicts
   - Verify Python version compatibility

2. **CORS Errors**:
   ```
   Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked by CORS policy
   ```
   - Update `ALLOWED_ORIGINS` environment variable in backend
   - Ensure frontend URL is correct

3. **API Connection Issues**:
   ```
   Network error: Unable to connect to backend server
   ```
   - Verify `VITE_API_URL` in frontend environment variables
   - Check backend service is running

4. **File Upload Errors**:
   ```
   Upload failed: 500 Internal Server Error
   ```
   - Check Groq API key is correctly set
   - Verify backend logs in Render dashboard

### Logs and Debugging

1. **View Backend Logs**:
   - Go to your backend service → Logs
   - Look for startup messages and error details

2. **View Frontend Build Logs**:
   - Go to your frontend service → Logs
   - Check for build failures or warnings

## Production Considerations

### Performance Optimization

1. **Backend**:
   - Consider upgrading to a paid plan for better performance
   - Implement caching for repeated requests
   - Monitor memory usage for large file processing

2. **Frontend**:
   - Enable gzip compression (automatic on Render)
   - Optimize bundle size with code splitting
   - Use CDN for static assets

### Security

1. **Environment Variables**:
   - Never commit actual API keys to version control
   - Use Render's environment variable encryption
   - Rotate API keys regularly

2. **CORS Configuration**:
   - Use specific origins instead of wildcards in production
   - Implement proper authentication if needed

### Monitoring

1. **Health Checks**:
   - Backend health endpoint: `/`
   - Monitor uptime and response times

2. **Error Tracking**:
   - Implement error logging
   - Set up alerts for critical failures

## Scaling

### Free Tier Limitations

- **Backend**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Frontend**: Unlimited bandwidth, always available
- **Storage**: Ephemeral (files are deleted on restart)

### Upgrade Options

For production use, consider:
- **Starter Plan**: Persistent storage, no sleep
- **Pro Plan**: Enhanced performance and features
- **Database**: PostgreSQL for persistent data storage

## Support

### Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Vite Documentation](https://vitejs.dev/guide/)

### Getting Help

1. **Render Support**: Available through dashboard
2. **GitHub Issues**: Create issues in your repository
3. **Community Forums**: Stack Overflow, Reddit

## Success Checklist

- [ ] Repository pushed to GitHub
- [ ] `render.yaml` configuration file present
- [ ] Backend service deployed and healthy
- [ ] Frontend service deployed and accessible
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] File upload functionality tested
- [ ] AI analysis working correctly

Once all items are checked, your Interview King application should be successfully deployed and ready for use!

## Next Steps

Consider these enhancements for production:
- User authentication and authorization
- Database integration for storing results
- Email notifications for completed analyses
- Advanced analytics and reporting
- Mobile-responsive design improvements