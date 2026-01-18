"""
Geocoding API endpoints
Handles address geocoding using Geocodio API
"""
import os
import requests
from flask import Blueprint, jsonify, request

geocoding_bp = Blueprint('geocoding', __name__)

GEOCODIO_API_KEY = os.getenv('GEOCODIO_API_KEY')
GEOCODIO_BASE_URL = 'https://api.geocod.io/v1.7'

@geocoding_bp.route('/geocode', methods=['GET'])
def geocode_address():
    """Geocode an address using Geocodio API"""
    if not GEOCODIO_API_KEY:
        return jsonify({
            'status': 'error',
            'message': 'Geocodio API key not configured'
        }), 500
    
    address = request.args.get('address')
    if not address:
        return jsonify({
            'status': 'error',
            'message': 'address parameter is required'
        }), 400
    
    try:
        response = requests.get(
            f'{GEOCODIO_BASE_URL}/geocode',
            params={
                'q': address,
                'api_key': GEOCODIO_API_KEY,
                'limit': 1
            },
            timeout=10
        )
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('results') and len(data['results']) > 0:
            result = data['results'][0]
            return jsonify({
                'status': 'success',
                'data': {
                    'latitude': result['location']['lat'],
                    'longitude': result['location']['lng'],
                    'formatted_address': result['formatted_address'],
                    'accuracy': result.get('accuracy', 0),
                    'accuracy_type': result.get('accuracy_type', 'unknown')
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'No results found for the given address'
            }), 404
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            'status': 'error',
            'message': f'Geocoding service error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
