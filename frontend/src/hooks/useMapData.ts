import { useState, useEffect } from 'react';
import { countiesApi, treatmentPlantsApi, County, TreatmentPlant } from '../services/api';

export interface MapDataState {
  counties: County[] | null;
  countyBoundaries: any | null;
  treatmentPlants: TreatmentPlant[] | null;
  loading: boolean;
  error: string | null;
}

export const useMapData = () => {
  const [state, setState] = useState<MapDataState>({
    counties: null,
    countyBoundaries: null,
    treatmentPlants: null,
    loading: true,
    error: null
  });

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('useMapData: Starting data load...');

      // Load all data in parallel
      const [countiesResponse, boundariesResponse, plantsResponse] = await Promise.all([
        countiesApi.getAll(),
        countiesApi.getBoundaries(),
        treatmentPlantsApi.getAll()
      ]);

      console.log('useMapData: API responses received', {
        countiesCount: countiesResponse.data?.length,
        boundariesType: typeof boundariesResponse,
        plantsCount: plantsResponse.data?.length
      });

      setState({
        counties: countiesResponse.data,
        countyBoundaries: boundariesResponse,
        treatmentPlants: plantsResponse.data,
        loading: false,
        error: null
      });

      console.log('useMapData: State updated successfully');

    } catch (error) {
      console.error('Error loading map data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load map data'
      }));
    }
  };

  const refreshData = () => {
    loadData();
  };

  const getCountyByName = (countyName: string): County | null => {
    if (!state.counties) return null;
    return state.counties.find(
      county => county.county_name.toLowerCase() === countyName.toLowerCase()
    ) || null;
  };

  const getTreatmentPlantsByCounty = (countyName: string): TreatmentPlant[] => {
    if (!state.treatmentPlants) return [];
    return state.treatmentPlants.filter(
      plant => plant.county.toLowerCase() === countyName.toLowerCase()
    );
  };

  const filterTreatmentPlants = (filters: {
    county?: string;
    publicAccess?: boolean;
  }): TreatmentPlant[] => {
    if (!state.treatmentPlants) return [];
    
    let filtered = [...state.treatmentPlants];
    
    if (filters.county) {
      filtered = filtered.filter(
        plant => plant.county.toLowerCase() === filters.county?.toLowerCase()
      );
    }
    
    if (filters.publicAccess !== undefined) {
      filtered = filtered.filter(
        plant => (plant.public_access?.toLowerCase() === 'yes') === filters.publicAccess
      );
    }
    
    return filtered;
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    ...state,
    refreshData,
    getCountyByName,
    getTreatmentPlantsByCounty,
    filterTreatmentPlants
  };
}; 
