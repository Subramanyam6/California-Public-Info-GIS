import apiClient from './api';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
  accuracy: number;
  accuracy_type: string;
}

export class GeocodingService {
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      // Use the backend API endpoint instead of calling Geocodio directly
      const response = await apiClient.get('/geocode', {
        params: {
          address: address
        }
      });

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static isInCalifornia(lat: number, lng: number): boolean {
    // California bounding box (approximate)
    const CA_BOUNDS = {
      north: 42.0,
      south: 32.5,
      east: -114.1,
      west: -124.4
    };

    return (
      lat >= CA_BOUNDS.south &&
      lat <= CA_BOUNDS.north &&
      lng >= CA_BOUNDS.west &&
      lng <= CA_BOUNDS.east
    );
  }
} 