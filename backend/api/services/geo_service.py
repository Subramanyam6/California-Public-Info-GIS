"""
Geographic Service
Handles geographic calculations and spatial operations
"""
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from api.services.data_service import DataService

class GeoService:
    def __init__(self):
        self.data_service = DataService()
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees)
        Returns distance in kilometers
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        # Radius of earth in kilometers
        R = 6371.0
        distance = R * c
        
        return distance
    
    def find_nearby_treatment_plants(self, lat, lng, radius_km):
        """Find treatment plants within radius of given coordinates"""
        plants_df = self.data_service.treatment_plants_data.copy()
        
        # Calculate distances
        plants_df['distance_km'] = plants_df.apply(
            lambda row: self.calculate_distance(
                lat, lng, row['latitude'], row['longitude']
            ), axis=1
        )
        
        # Filter by radius
        nearby_plants = plants_df[plants_df['distance_km'] <= radius_km]
        
        # Sort by distance
        nearby_plants = nearby_plants.sort_values('distance_km')
        
        return nearby_plants.to_dict('records') 