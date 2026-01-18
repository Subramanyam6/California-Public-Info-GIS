#!/bin/sh
# Startup script for Nginx that handles dynamic PORT from Render.com

# Use PORT environment variable if set, otherwise default to 8080
PORT=${PORT:-8080}

# Replace the port in nginx.conf
sed -i "s/listen 8080/listen $PORT/g" /etc/nginx/conf.d/default.conf

# Start Nginx
exec nginx -g "daemon off;"
