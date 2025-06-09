"""
California Water Quality GIS System - Flask REST API
Main application entry point
"""
import os
from flask import Flask
from flask_cors import CORS
from api.routes import register_routes

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Configuration
    app.config['DEBUG'] = True
    app.config['JSON_SORT_KEYS'] = False
    
    # Register API routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 