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

# 5. Copy the data directory
COPY data/ ../data/

# 6. Make port 8080 available to the world outside this container
EXPOSE 8080

# 7. Define the command to run the app using Gunicorn
# The --bind 0.0.0.0:8080 is required by Cloud Run.
# The value for workers is a recommendation. You can adjust it.
CMD exec gunicorn --bind 0.0.0.0:8080 --workers 1 --threads 8 --timeout 0 "app:create_app()" 