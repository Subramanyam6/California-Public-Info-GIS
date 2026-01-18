#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -euo pipefail

# --- Configuration ---
# Default project id as requested; can be overridden by env var GCP_PROJECT_ID or --project flag
DEFAULT_PROJECT_ID="gis-useful-info-california"
LOCATION="us-central1"
BACKEND_SERVICE_NAME="gis-api-backend"
FRONTEND_SERVICE_NAME="gis-app-frontend"

# Parse optional flags
while [[ ${1-} =~ ^- ]]; do
  case "$1" in
    --project)
      shift
      GCP_PROJECT_ID="$1"
      ;;
    --region|--location)
      shift
      LOCATION="$1"
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
  shift || true
done

# Resolve project id: env var/flag > default (ignore current gcloud config by default)
GCP_PROJECT_ID=${GCP_PROJECT_ID:-"$DEFAULT_PROJECT_ID"}
if [[ -z "$GCP_PROJECT_ID" || "$GCP_PROJECT_ID" == "(unset)" ]]; then
  GCP_PROJECT_ID="$DEFAULT_PROJECT_ID"
fi

# Ensure project exists and switch
if ! gcloud projects describe "$GCP_PROJECT_ID" >/dev/null 2>&1; then
  echo "Error: GCP project '$GCP_PROJECT_ID' not found or access denied. Create it and assign billing, or pass a valid project via --project."
  exit 1
fi
gcloud config set project "$GCP_PROJECT_ID" >/dev/null

# Determine repo root (directory of this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "--- Starting Deployment to GCP Project: $GCP_PROJECT_ID (region: $LOCATION) ---"

# --- 1. Enable GCP Services ---
echo "--- Enabling required GCP services... ---"
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com \
  iam.googleapis.com \
  --project="$GCP_PROJECT_ID"

# --- 2. Create Secret for API Key ---
echo "--- Handling secret for Geocodio API key... ---"
if ! gcloud secrets describe GEOCODIO_API_KEY --project="$GCP_PROJECT_ID" &>/dev/null; then
  echo "Secret 'GEOCODIO_API_KEY' not found. Creating it..."
  gcloud secrets create GEOCODIO_API_KEY --replication-policy="automatic" --project="$GCP_PROJECT_ID"

  # Support non-interactive deployments when GEOCODIO_API_KEY env var is provided
  if [[ -n "${GEOCODIO_API_KEY:-}" ]]; then
    echo -n "$GEOCODIO_API_KEY" | gcloud secrets versions add GEOCODIO_API_KEY --data-file=- --project="$GCP_PROJECT_ID"
  else
    echo "Please enter your Geocodio API key:"
    read -s API_KEY_VALUE
    echo -n "$API_KEY_VALUE" | gcloud secrets versions add GEOCODIO_API_KEY --data-file=- --project="$GCP_PROJECT_ID"
  fi
else
  echo "Secret 'GEOCODIO_API_KEY' already exists."
fi

# --- 2b. Ensure Cloud Run service account can access the secret ---
echo "--- Granting Secret Manager access to Cloud Run default service account... ---"
PROJECT_NUMBER=$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')
CR_SA_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:${CR_SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet >/dev/null

# --- 3. Configure Docker for GCR ---
echo "--- Configuring Docker for Google Container Registry... ---"
gcloud auth configure-docker gcr.io --quiet --project="$GCP_PROJECT_ID"

echo ""
echo "=========================================="
echo "           DEPLOYING BACKEND"
echo "=========================================="

# --- 4. Build and Deploy Backend ---
# Ensure we are at repo root (already cd'ed via SCRIPT_DIR)

echo "--- Building backend Docker image (linux/amd64)... ---"
# Add timestamp to ensure unique image tags
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker build --platform linux/amd64 -t gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME:$TIMESTAMP -t gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME:latest .

echo "--- Pushing backend image to Container Registry... ---"
docker push gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME:$TIMESTAMP
docker push gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME:latest

echo "--- Deploying backend to Cloud Run... ---"
gcloud run deploy $BACKEND_SERVICE_NAME \
  --image gcr.io/$GCP_PROJECT_ID/$BACKEND_SERVICE_NAME:$TIMESTAMP \
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

echo "--- Installing frontend dependencies... ---"
if command -v npm >/dev/null 2>&1; then
  (npm ci || npm install)
else
  echo "Error: npm is not installed. Please install Node.js and npm." >&2
  exit 1
fi

echo "--- Cleaning previous build... ---"
rm -rf build/

echo "--- Building React app... ---"
REACT_APP_API_BASE_URL=$BACKEND_URL/api/v1 npm run build --silent

# Verify build was successful
if [ ! -d "build" ]; then
    echo "Error: Frontend build failed. Build directory not found."
    exit 1
fi

echo "--- Building frontend Docker image (linux/amd64)... ---"
docker build --platform linux/amd64 -t gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME:$TIMESTAMP -t gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME:latest .

echo "--- Pushing frontend image to Container Registry... ---"
docker push gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME:$TIMESTAMP
docker push gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME:latest

echo "--- Deploying frontend to Cloud Run... ---"
gcloud run deploy $FRONTEND_SERVICE_NAME \
  --image gcr.io/$GCP_PROJECT_ID/$FRONTEND_SERVICE_NAME:$TIMESTAMP \
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