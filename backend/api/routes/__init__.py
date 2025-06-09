"""
Routes package initialization and registration
"""
from .counties import counties_bp
from .water_quality import water_quality_bp
from .treatment_plants import treatment_plants_bp

def register_routes(app):
    """Register all API blueprints with the Flask app"""
    from config import Config
    
    app.register_blueprint(counties_bp, url_prefix=Config.API_PREFIX)
    app.register_blueprint(water_quality_bp, url_prefix=Config.API_PREFIX)
    app.register_blueprint(treatment_plants_bp, url_prefix=Config.API_PREFIX) 