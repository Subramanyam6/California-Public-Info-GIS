"""
Water Quality API endpoints
Handles water quality metrics by county
"""
from flask import Blueprint, jsonify, request
from api.services.data_service import DataService

water_quality_bp = Blueprint('water_quality', __name__)
data_service = DataService()

@water_quality_bp.route('/water-quality', methods=['GET'])
def get_all_water_quality():
    """Get water quality data for all counties"""
    try:
        max_lead = request.args.get('max_lead', type=float)
        max_arsenic = request.args.get('max_arsenic', type=float)
        max_nitrate = request.args.get('max_nitrate', type=float)
        
        water_quality_data = data_service.get_water_quality_data(
            max_lead=max_lead,
            max_arsenic=max_arsenic,
            max_nitrate=max_nitrate
        )
        
        return jsonify({
            'status': 'success',
            'data': water_quality_data,
            'count': len(water_quality_data)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@water_quality_bp.route('/water-quality/<county_name>', methods=['GET'])
def get_county_water_quality(county_name):
    """Get water quality data for a specific county"""
    try:
        water_quality = data_service.get_county_water_quality(county_name)
        if water_quality:
            return jsonify({
                'status': 'success',
                'data': water_quality
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Water quality data for "{county_name}" not found'
            }), 404
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@water_quality_bp.route('/water-quality/statistics', methods=['GET'])
def get_water_quality_statistics():
    """Get statistical summary of water quality metrics"""
    try:
        stats = data_service.get_water_quality_statistics()
        return jsonify({
            'status': 'success',
            'data': stats
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@water_quality_bp.route('/water-quality/worst-counties', methods=['GET'])
def get_worst_counties():
    """Get counties with worst water quality for each contaminant"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        worst_counties = data_service.get_worst_water_quality_counties(limit)
        return jsonify({
            'status': 'success',
            'data': worst_counties
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 