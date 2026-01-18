# syntax=docker/dockerfile:1

# 1. Use an official Python runtime as a parent image
FROM python:3.9-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy the backend requirements file and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the backend application code
COPY backend/ .

# 5. Copy the data directory (ensure it exists)
COPY data /app/data

# Set DATA_DIR environment variable for the app
ENV DATA_DIR=/app/data

# 6. Make port available (Render uses PORT env var, default to 8080)
EXPOSE 8080

# 7. Define the command to run the app using Gunicorn
# Render.com sets PORT environment variable dynamically
# Use PORT env var if set, otherwise default to 8080
CMD exec gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 1 --threads 8 --timeout 0 "app:create_app()" 