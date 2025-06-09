# Deployment Guide for California Water Quality GIS

## 🚀 Pre-Deployment Checklist

Before running `./deploy.sh`, ensure:

1. **All changes are committed and pushed to GitHub**
   ```bash
   git status  # Should show "working tree clean"
   git push origin main
   ```

2. **Frontend dependencies are up to date**
   ```bash
   cd frontend && npm install
   ```

3. **Test the build locally**
   ```bash
   cd frontend && npm run build
   ```

## 🛠️ Deployment Process

### Option 1: Full Deployment (Recommended)
```bash
./deploy.sh
```

### Option 2: Frontend Only Deployment
```bash
cd frontend
rm -rf build/
REACT_APP_API_BASE_URL=https://your-backend-url/api/v1 npm run build
# Then run frontend deployment commands...
```

## 🔍 Common Issues & Solutions

### Issue: Changes not reflecting in deployed app
**Cause**: Stale build directory or Docker cache
**Solution**: 
```bash
# Clean everything and redeploy
cd frontend
rm -rf build/
docker system prune -f  # Optional: clean Docker cache
cd ..
./deploy.sh
```

### Issue: Docker build fails
**Cause**: Platform compatibility or missing dependencies
**Solution**: 
```bash
# Ensure you're building for the correct platform
docker buildx create --use  # Enable buildx
docker buildx build --platform linux/amd64 -t your-image .
```

### Issue: Environment variables not working
**Cause**: Missing REACT_APP_ prefix or build-time vs runtime confusion
**Solution**: 
- Frontend env vars must start with `REACT_APP_`
- They are embedded at build time, not runtime
- Rebuild after changing env vars

## 📋 Deployment Verification

After deployment, verify:

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url/api/v1/health
   ```

2. **Frontend Loading**
   - Open the frontend URL in browser
   - Check browser console for errors
   - Test key features (search, map interaction)

3. **API Integration**
   - Test county search
   - Test address search
   - Verify map data loads

## 🏷️ Version Management

The deployment script now uses timestamped tags:
- `gcr.io/PROJECT/SERVICE:YYYYMMDD-HHMMSS` (unique)
- `gcr.io/PROJECT/SERVICE:latest` (always current)

This ensures Cloud Run deploys fresh images every time.

## 🆘 Rollback Process

If deployment fails:
```bash
# Get previous working image
gcloud container images list --repository=gcr.io/YOUR_PROJECT/SERVICE

# Deploy previous version
gcloud run deploy SERVICE_NAME \
  --image gcr.io/YOUR_PROJECT/SERVICE:PREVIOUS_TAG \
  --region us-central1
```

## 📝 Notes

- The script automatically cleans the build directory
- Docker images are tagged with timestamps for uniqueness
- Both backend and frontend are deployed with each run
- Secrets (API keys) are managed through Google Secret Manager 