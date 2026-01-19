"""
Counties API endpoints
Handles California county data and boundaries
"""
from flask import Blueprint, jsonify, request, send_file
from api.services.data_service import DataService
from config import Config

counties_bp = Blueprint('counties', __name__)
data_service = DataService()

@counties_bp.route('/counties', methods=['GET'])
def get_all_counties():
    """Get all California counties with population data"""
    try:
        counties_data = data_service.get_all_counties()
        return jsonify({
            'status': 'success',
            'data': counties_data,
            'count': len(counties_data)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@counties_bp.route('/counties/<county_name>', methods=['GET'])
def get_county(county_name):
    """Get specific county data by name"""
    try:
        county_data = data_service.get_county_by_name(county_name)
        if county_data:
            return jsonify({
                'status': 'success',
                'data': county_data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'County "{county_name}" not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@counties_bp.route('/counties/boundaries', methods=['GET'])
def get_county_boundaries():
    """Get California county geographic boundaries (GeoJSON)"""
    try:
        response = send_file(
            Config.COUNTIES_GEOJSON,
            mimetype='application/json',
            conditional=True
        )
        response.headers['Cache-Control'] = 'public, max-age=86400'
        return response
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@counties_bp.route('/counties/population', methods=['GET'])
def get_population_data():
    """Get population data for all counties"""
    try:
        sort_by = request.args.get('sort_by', 'county_name')
        order = request.args.get('order', 'asc')
        
        population_data = data_service.get_population_data(sort_by, order)
        return jsonify({
            'status': 'success',
            'data': population_data,
            'count': len(population_data)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 
