"""
Water Treatment Plants API endpoints
Handles treatment plant locations and information
"""
from flask import Blueprint, jsonify, request
from api.services.data_service import DataService
from api.services.geo_service import GeoService

treatment_plants_bp = Blueprint('treatment_plants', __name__)
data_service = DataService()
geo_service = GeoService()

@treatment_plants_bp.route('/treatment-plants', methods=['GET'])
def get_all_treatment_plants():
    """Get all water treatment plants"""
    try:
        county_filter = request.args.get('county')
        public_access_only = request.args.get('public_access', type=bool)
        
        plants_data = data_service.get_treatment_plants(
            county_filter=county_filter,
            public_access_only=public_access_only
        )
        
        return jsonify({
            'status': 'success',
            'data': plants_data,
            'count': len(plants_data)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@treatment_plants_bp.route('/treatment-plants/<int:facility_id>', methods=['GET'])
def get_treatment_plant(facility_id):
    """Get specific treatment plant by facility ID"""
    try:
        plant_data = data_service.get_treatment_plant_by_id(facility_id)
        if plant_data:
            return jsonify({
                'status': 'success',
                'data': plant_data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Treatment plant with ID {facility_id} not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@treatment_plants_bp.route('/treatment-plants/nearby', methods=['GET'])
def get_nearby_treatment_plants():
    """Find treatment plants within a specified radius of coordinates"""
    try:
        latitude = request.args.get('lat', type=float)
        longitude = request.args.get('lng', type=float)
        radius_km = request.args.get('radius', default=50, type=float)
        
        if latitude is None or longitude is None:
            return jsonify({
                'status': 'error',
                'message': 'latitude and longitude parameters are required'
            }), 400
        
        nearby_plants = geo_service.find_nearby_treatment_plants(
            latitude, longitude, radius_km
        )
        
        return jsonify({
            'status': 'success',
            'data': nearby_plants,
            'count': len(nearby_plants),
            'search_center': {'latitude': latitude, 'longitude': longitude},
            'radius_km': radius_km
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@treatment_plants_bp.route('/treatment-plants/county/<county_name>', methods=['GET'])
def get_treatment_plants_by_county(county_name):
    """Get all treatment plants in a specific county"""
    try:
        plants = data_service.get_treatment_plants_by_county(county_name)
        return jsonify({
            'status': 'success',
            'data': plants,
            'count': len(plants),
            'county': county_name
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 