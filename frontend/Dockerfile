# Multi-stage build for React app
# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY frontend/ .

# Build argument for API URL (can be overridden via --build-arg or env var)
# Render.com will pass this as a build arg from environment variable
ARG REACT_APP_API_BASE_URL=http://localhost:5001/api/v1
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.23-alpine

# Copy the built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY frontend/start-nginx.sh /start-nginx.sh
RUN chmod +x /start-nginx.sh

# Expose port (Render uses PORT env var, default to 8080)
EXPOSE 8080

# Set default PORT if not provided
ENV PORT=8080

# Start Nginx with dynamic port
CMD ["/start-nginx.sh"]
