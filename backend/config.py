"""
Configuration settings for the California Water Quality GIS System
"""
import os

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, '..', 'data')
    
    # Data file paths
    POPULATION_DATA = os.path.join(DATA_DIR, 'population_by_county.csv')
    WATER_QUALITY_DATA = os.path.join(DATA_DIR, 'water_quality_by_county.csv')
    TREATMENT_PLANTS_DATA = os.path.join(DATA_DIR, 'water_treatment_plants.csv')
    COUNTIES_GEOJSON = os.path.join(DATA_DIR, 'California_Counties.geojson')
    
    # API Configuration
    API_VERSION = 'v1'
    API_PREFIX = f'/api/{API_VERSION}' 