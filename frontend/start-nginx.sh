#!/bin/sh
# Startup script for Nginx that handles dynamic PORT from Render.com

# Exit on error and undefined vars (we still use ${VAR:-} for optional envs).
set -eu

# Use PORT environment variable if set, otherwise default to 8080
PORT=${PORT:-8080}

# Write runtime environment config for the React app.
ENV_JS_PATH="/usr/share/nginx/html/env.js"
escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/\"/\\"/g'
}
API_BASE_URL_ESCAPED=$(escape "${REACT_APP_API_BASE_URL:-}")
API_TIMEOUT_ESCAPED=$(escape "${REACT_APP_API_TIMEOUT:-}")
cat > "$ENV_JS_PATH" <<EOF
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL_ESCAPED}",
  API_TIMEOUT: "${API_TIMEOUT_ESCAPED}"
};
EOF

# Replace the port in nginx.conf
sed -i "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf

# Start Nginx
exec nginx -g "daemon off;"
