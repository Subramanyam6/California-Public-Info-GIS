"""
California Water Quality GIS System - Flask REST API
Main application entry point
"""
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_compress import Compress
from api.routes import register_routes

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Enable GZIP compression for responses
    Compress(app)
    
    # Configuration
    app.config['DEBUG'] = True
    app.config['JSON_SORT_KEYS'] = False
    
    # Add health check endpoint
    @app.route('/')
    def root():
        return jsonify({
            "message": "California Water Quality GIS API",
            "status": "running",
            "version": "1.0.0"
        })
    
    @app.route('/health')
    def health():
        return jsonify({"status": "healthy"})
    
    @app.route('/api/v1/health')
    def api_health():
        return jsonify({"status": "healthy", "api": "v1"})

    @app.after_request
    def add_cache_headers(response):
        if request.method == 'GET' and request.path.startswith('/api/v1'):
            if request.path.startswith('/api/v1/geocode'):
                response.headers.setdefault('Cache-Control', 'no-store')
            else:
                response.headers.setdefault('Cache-Control', 'public, max-age=3600')
        return response
    
    # Register API routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 
