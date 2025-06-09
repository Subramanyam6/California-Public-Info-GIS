#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
GCP_PROJECT_ID=$(gcloud config get-value project)
LOCATION="us-central1"
BACKEND_SERVICE_NAME="gis-api-backend"
FRONTEND_SERVICE_NAME="gis-app-frontend"

echo "--- Starting Deployment to GCP Project: $GCP_PROJECT_ID ---"

# --- 1. Enable GCP Services ---
echo "--- Enabling required GCP services... ---"
gcloud services enable run.googleapis.com secretmanager.googleapis.com --project="$GCP_PROJECT_ID"

# --- 2. Create Secret for API Key ---
echo "--- Handling secret for Geocodio API key... ---"
if ! gcloud secrets describe GEOCODIO_API_KEY --project="$GCP_PROJECT_ID" &>/dev/null; then
  echo "Secret 'GEOCODIO_API_KEY' not found. Creating it..."
  gcloud secrets create GEOCODIO_API_KEY --replication-policy="automatic" --project="$GCP_PROJECT_ID"
  
  echo "Please enter your Geocodio API key:"
  read -s API_KEY_VALUE
  echo -n "$API_KEY_VALUE" | gcloud secrets versions add GEOCODIO_API_KEY --data-file=- --project="$GCP_PROJECT_ID"
else
  echo "Secret 'GEOCODIO_API_KEY' already exists."
fi

# --- 3. Configure Docker for GCR ---
echo "--- Configuring Docker for Google Container Registry... ---"
gcloud auth configure-docker gcr.io --quiet --project="$GCP_PROJECT_ID"

echo ""
echo "=========================================="
echo "           DEPLOYING BACKEND"
echo "=========================================="

# --- 4. Build and Deploy Backend ---
cd /Users/subramanyam6666/Documents/Learning_SoftwareEngineering/GIS_UsefulInfo_California

echo "--- Building backend Docker image (linux/amd64)... ---"
docker build --platform linux/amd64 -t gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME .

echo "--- Pushing backend image to Container Registry... ---"
docker push gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME

echo "--- Deploying backend to Cloud Run... ---"
gcloud run deploy $BACKEND_SERVICE_NAME \
  --image gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME \
  --platform managed \
  --region $LOCATION \
  --allow-unauthenticated \
  --set-secrets "GEOCODIO_API_KEY=GEOCODIO_API_KEY:latest" \
  --project="$GCP_PROJECT_ID"

# --- 5. Get Backend URL ---
echo "--- Getting backend URL... ---"
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --platform managed --region $LOCATION --format 'value(status.url)' --project="$GCP_PROJECT_ID")

if [ -z "$BACKEND_URL" ]; then
    echo "Error: Could not retrieve backend URL. Aborting."
    exit 1
fi
echo "✅ Backend deployed successfully at: $BACKEND_URL"

echo ""
echo "=========================================="
echo "           DEPLOYING FRONTEND"
echo "=========================================="

# --- 6. Build and Deploy Frontend ---
cd frontend

echo "--- Building React app... ---"
REACT_APP_API_BASE_URL=$BACKEND_URL/api/v1 npm run build

echo "--- Building frontend Docker image (linux/amd64)... ---"
docker build --platform linux/amd64 -t gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME .

echo "--- Pushing frontend image to Container Registry... ---"
docker push gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME

echo "--- Deploying frontend to Cloud Run... ---"
gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME \
  --platform managed \
  --region $LOCATION \
  --allow-unauthenticated \
  --project="$GCP_PROJECT_ID"

# --- 7. Get Frontend URL ---
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --platform managed --region $LOCATION --format 'value(status.url)' --project="$GCP_PROJECT_ID")

echo ""
echo "=========================================="
echo "         🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Your California Water Quality GIS app is now live!"