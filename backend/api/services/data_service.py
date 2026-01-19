"""
Data Service
Handles all data loading, processing, and filtering operations
"""
import pandas as pd
import json
import os
from config import Config

class DataService:
    def __init__(self):
        self._population_data = None
        self._water_quality_data = None
        self._treatment_plants_data = None
        self._county_boundaries = None
        self._all_counties = None
        self._all_counties_by_name = None
        self._population_records = None
        self._water_quality_records = None
        self._treatment_plants_records = None
        self._water_quality_stats = None
        self._worst_water_quality_cache = {}
    
    @property
    def population_data(self):
        """Lazy load population data"""
        if self._population_data is None:
            self._population_data = pd.read_csv(Config.POPULATION_DATA)
        return self._population_data
    
    @property
    def water_quality_data(self):
        """Lazy load water quality data"""
        if self._water_quality_data is None:
            self._water_quality_data = pd.read_csv(Config.WATER_QUALITY_DATA)
        return self._water_quality_data
    
    @property
    def treatment_plants_data(self):
        """Lazy load treatment plants data"""
        if self._treatment_plants_data is None:
            self._treatment_plants_data = pd.read_csv(Config.TREATMENT_PLANTS_DATA)
        return self._treatment_plants_data
    
    @property
    def county_boundaries(self):
        """Lazy load county boundaries GeoJSON"""
        if self._county_boundaries is None:
            with open(Config.COUNTIES_GEOJSON, 'r') as f:
                self._county_boundaries = json.load(f)
        return self._county_boundaries
    
    def get_all_counties(self):
        """Get all counties with basic information"""
        if self._all_counties is None:
            population = self.population_data
            water_quality = self.water_quality_data
            
            # Merge population and water quality data
            merged = pd.merge(
                population, 
                water_quality, 
                on='county_name', 
                how='inner'
            )
            
            self._all_counties = merged.to_dict('records')
            self._all_counties_by_name = {
                county['county_name'].lower(): county for county in self._all_counties
            }
        
        return self._all_counties
    
    def get_county_by_name(self, county_name):
        """Get specific county data"""
        if self._all_counties_by_name is None:
            self.get_all_counties()
        return self._all_counties_by_name.get(county_name.lower())
    
    def get_county_boundaries(self):
        """Get county boundaries GeoJSON"""
        return self.county_boundaries
    
    def get_population_data(self, sort_by='county_name', order='asc'):
        """Get population data with optional sorting"""
        df = self.population_data.copy()
        
        if sort_by in df.columns:
            ascending = (order.lower() == 'asc')
            df = df.sort_values(by=sort_by, ascending=ascending)

        if sort_by == 'county_name' and order.lower() == 'asc':
            if self._population_records is None:
                self._population_records = df.to_dict('records')
            return self._population_records

        return df.to_dict('records')
    
    def get_water_quality_data(self, max_lead=None, max_arsenic=None, max_nitrate=None):
        """Get water quality data with optional filtering"""
        if max_lead is None and max_arsenic is None and max_nitrate is None:
            if self._water_quality_records is None:
                self._water_quality_records = self.water_quality_data.to_dict('records')
            return self._water_quality_records

        df = self.water_quality_data.copy()
        
        # Apply filters if provided
        if max_lead is not None:
            df = df[df['lead_avg_ug_per_L'] <= max_lead]
        if max_arsenic is not None:
            df = df[df['arsenic_avg_ug_per_L'] <= max_arsenic]
        if max_nitrate is not None:
            df = df[df['nitrate_avg_mg_per_L'] <= max_nitrate]
        
        return df.to_dict('records')
    
    def get_county_water_quality(self, county_name):
        """Get water quality data for specific county"""
        df = self.water_quality_data
        county_data = df[df['county_name'].str.lower() == county_name.lower()]
        
        if not county_data.empty:
            return county_data.iloc[0].to_dict()
        return None
    
    def get_water_quality_statistics(self):
        """Get statistical summary of water quality metrics"""
        if self._water_quality_stats is not None:
            return self._water_quality_stats

        df = self.water_quality_data
        
        stats = {
            'lead_avg_ug_per_L': {
                'mean': df['lead_avg_ug_per_L'].mean(),
                'median': df['lead_avg_ug_per_L'].median(),
                'min': df['lead_avg_ug_per_L'].min(),
                'max': df['lead_avg_ug_per_L'].max(),
                'std': df['lead_avg_ug_per_L'].std()
            },
            'arsenic_avg_ug_per_L': {
                'mean': df['arsenic_avg_ug_per_L'].mean(),
                'median': df['arsenic_avg_ug_per_L'].median(),
                'min': df['arsenic_avg_ug_per_L'].min(),
                'max': df['arsenic_avg_ug_per_L'].max(),
                'std': df['arsenic_avg_ug_per_L'].std()
            },
            'nitrate_avg_mg_per_L': {
                'mean': df['nitrate_avg_mg_per_L'].mean(),
                'median': df['nitrate_avg_mg_per_L'].median(),
                'min': df['nitrate_avg_mg_per_L'].min(),
                'max': df['nitrate_avg_mg_per_L'].max(),
                'std': df['nitrate_avg_mg_per_L'].std()
            }
        }
        
        self._water_quality_stats = stats
        return stats
    
    def get_worst_water_quality_counties(self, limit=10):
        """Get counties with worst water quality for each contaminant"""
        if limit in self._worst_water_quality_cache:
            return self._worst_water_quality_cache[limit]

        df = self.water_quality_data
        
        worst_counties = {
            'highest_lead': df.nlargest(limit, 'lead_avg_ug_per_L')[['county_name', 'lead_avg_ug_per_L']].to_dict('records'),
            'highest_arsenic': df.nlargest(limit, 'arsenic_avg_ug_per_L')[['county_name', 'arsenic_avg_ug_per_L']].to_dict('records'),
            'highest_nitrate': df.nlargest(limit, 'nitrate_avg_mg_per_L')[['county_name', 'nitrate_avg_mg_per_L']].to_dict('records')
        }
        
        self._worst_water_quality_cache[limit] = worst_counties
        return worst_counties
    
    def get_treatment_plants(self, county_filter=None, public_access_only=False):
        """Get treatment plants with optional filtering"""
        if not county_filter and not public_access_only:
            if self._treatment_plants_records is None:
                self._treatment_plants_records = self.treatment_plants_data.to_dict('records')
            return self._treatment_plants_records

        df = self.treatment_plants_data.copy()
        
        if county_filter:
            df = df[df['county'].str.lower() == county_filter.lower()]
        
        if public_access_only:
            df = df[df['public_access'].str.lower() == 'yes']
        
        return df.to_dict('records')
    
    def get_treatment_plant_by_id(self, facility_id):
        """Get specific treatment plant by facility ID"""
        df = self.treatment_plants_data
        plant_data = df[df['facility_id'] == facility_id]
        
        if not plant_data.empty:
            return plant_data.iloc[0].to_dict()
        return None
    
    def get_treatment_plants_by_county(self, county_name):
        """Get all treatment plants in a specific county"""
        df = self.treatment_plants_data
        county_plants = df[df['county'].str.lower() == county_name.lower()]
        return county_plants.to_dict('records') 
