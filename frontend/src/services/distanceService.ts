import { TreatmentPlant } from './api';

export class DistanceService {
  /**
   * Calculate the haversine distance between two points on Earth
   * @param lat1 Latitude of first point
   * @param lng1 Longitude of first point  
   * @param lat2 Latitude of second point
   * @param lng2 Longitude of second point
   * @returns Distance in miles
   */
  static haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find treatment plants within a specified radius of a location
   * @param userLat User's latitude
   * @param userLng User's longitude
   * @param treatmentPlants Array of treatment plants
   * @param maxDistance Maximum distance in miles
   * @returns Array of treatment plants with their distances
   */
  static findPlantsWithinRadius(
    userLat: number, 
    userLng: number, 
    treatmentPlants: TreatmentPlant[], 
    maxDistance: number
  ): Array<TreatmentPlant & { distance: number }> {
    return treatmentPlants
      .map(plant => ({
        ...plant,
        distance: this.haversineDistance(userLat, userLng, plant.latitude, plant.longitude)
      }))
      .filter(plant => plant.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find the nearest treatment plant to a location
   * @param userLat User's latitude
   * @param userLng User's longitude
   * @param treatmentPlants Array of treatment plants
   * @returns Nearest treatment plant with distance, or null if none found
   */
  static findNearestPlant(
    userLat: number, 
    userLng: number, 
    treatmentPlants: TreatmentPlant[]
  ): (TreatmentPlant & { distance: number }) | null {
    if (treatmentPlants.length === 0) return null;

    const plantsWithDistance = treatmentPlants.map(plant => ({
      ...plant,
      distance: this.haversineDistance(userLat, userLng, plant.latitude, plant.longitude)
    }));

    return plantsWithDistance.reduce((nearest, current) => 
      current.distance < nearest.distance ? current : nearest
    );
  }

  /**
   * Format distance for display
   * @param distance Distance in miles
   * @returns Formatted distance string
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)} mi`;
    } else {
      return `${distance.toFixed(0)} mi`;
    }
  }
} 