# Render.com Deployment Guide

This guide explains how to deploy the California Water Quality GIS application to Render.com's free tier.

## Prerequisites

1. A Render.com account (sign up at https://render.com)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A Geocodio API key (for geocoding functionality)

## Architecture

The application consists of two services:
- **Backend**: Flask API service (Python)
- **Frontend**: React application served by Nginx

You'll need to deploy these as two separate Web Services on Render.

## Deployment Steps

### Step 1: Deploy Backend Service

1. Log in to Render.com dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Configure the backend service:
   - **Name**: `gis-api-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (should auto-detect)
   - **Docker Context**: `.` (root directory)

5. **Environment Variables**:
   - Click **"Add Environment Variable"** button
   - **Key**: `GEOCODIO_API_KEY`
   - **Value**: Your Geocodio API key (get it from https://www.geocod.io/)
   - Click **"Save Changes"**
   - `DATA_DIR`: `/app/data` (already set in Dockerfile, no need to add this)

6. Click **"Create Web Service"**

7. Wait for the build to complete and note the **Service URL** (e.g., `https://gis-api-backend.onrender.com`)

### Step 2: Build Frontend Locally (Required)

The frontend needs to be built with the backend URL before deployment. You have two options:

#### Option A: Build Locally and Push

```bash
cd frontend
npm install
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api/v1 npm run build
cd ..
git add frontend/build
git commit -m "Build frontend with production API URL"
git push
```

#### Option B: Use Render Build Command

1. In Render dashboard, go to your frontend service settings
2. Under **Build Command**, add:
   ```bash
   cd frontend && npm install && REACT_APP_API_BASE_URL=$BACKEND_URL/api/v1 npm run build
   ```
3. Set environment variable `BACKEND_URL` to your backend service URL

### Step 3: Deploy Frontend Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect the same Git repository
3. Configure the frontend service:
   - **Name**: `gis-app-frontend` (or your preferred name)
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `frontend`

4. **Environment Variables**:
   - `PORT`: Leave empty (Render sets this automatically)
   - `REACT_APP_API_BASE_URL`: `https://your-backend-url.onrender.com/api/v1`
     - ⚠️ **Note**: This is only used if rebuilding. If you pre-built locally, it's already baked in.

5. Click **"Create Web Service"**

### Step 4: Update Frontend After Backend Deployment

After deploying the backend, you'll need to rebuild the frontend with the correct backend URL:

1. Update `REACT_APP_API_BASE_URL` in frontend service environment variables
2. Trigger a new deployment (or push a commit)

## Important Notes

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)
- 750 hours/month free (enough for one service running 24/7)

### Environment Variables

#### Backend Service Environment Variables:
1. Go to your backend service dashboard in Render
2. Click on **"Environment"** tab (in the left sidebar)
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `GEOCODIO_API_KEY`
   - **Value**: Your Geocodio API key (get it from https://www.geocod.io/)
   - Click **"Save Changes"**

#### Frontend Service Environment Variables:
- **REACT_APP_API_BASE_URL**: Only needed if rebuilding frontend (set to your backend URL)

### CORS Configuration

The backend already has CORS enabled, so it will accept requests from your frontend domain.

### Health Checks

Both services have health check endpoints:
- Backend: `https://your-backend-url.onrender.com/health`
- Frontend: Just check if the page loads

## Troubleshooting

### Backend Issues

1. **Build fails**: Check that all dependencies are in `requirements.txt`
2. **Data files not found**: Verify `DATA_DIR` is set correctly
3. **Port binding errors**: Render sets `PORT` automatically - don't override it

### Frontend Issues

1. **API calls fail**: Verify `REACT_APP_API_BASE_URL` matches your backend URL
2. **Build fails**: Ensure `frontend/build` directory exists or build command runs successfully
3. **404 errors on routes**: Nginx config should handle client-side routing (already configured)

### Common Problems

- **Services can't communicate**: Use the Render-provided service URLs, not localhost
- **Environment variables not working**: Restart the service after adding env vars
- **Build takes too long**: Consider using Render's build cache

## Testing Locally

Before deploying, test locally with Docker Compose:

```bash
# Set your Geocodio API key (optional, only if testing geocoding)
export GEOCODIO_API_KEY=your-api-key

# Build and start services
docker-compose up --build

# Backend will be at http://localhost:5001
# Frontend will be at http://localhost:3000
```

## Post-Deployment

1. Test the backend health endpoint
2. Test the frontend loads correctly
3. Test API integration (search, map features)
4. Monitor logs in Render dashboard for any errors

## Cost Optimization

- Use the free tier for development/testing
- Consider upgrading to paid tier for production (no spin-down, better performance)
- Monitor usage in Render dashboard
