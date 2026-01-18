import { useState, useEffect } from 'react';
import { waterQualityApi, WaterQualityStats, County } from '../services/api';

export interface WaterQualityState {
  waterQualityStats: WaterQualityStats | null;
  worstCounties: any | null;
  filteredData: County[] | null;
  loading: boolean;
  error: string | null;
}

export const useWaterQuality = () => {
  const [state, setState] = useState<WaterQualityState>({
    waterQualityStats: null,
    worstCounties: null,
    filteredData: null,
    loading: true,
    error: null
  });

  const loadWaterQualityData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load water quality statistics and worst counties
      const [statsResponse, worstResponse] = await Promise.all([
        waterQualityApi.getStatistics(),
        waterQualityApi.getWorstCounties(10)
      ]);

      setState(prev => ({
        ...prev,
        waterQualityStats: statsResponse.data,
        worstCounties: worstResponse.data,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error loading water quality data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load water quality data'
      }));
    }
  };

  const filterWaterQualityData = async (filters: {
    maxLead?: number;
    maxArsenic?: number;
    maxNitrate?: number;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await waterQualityApi.getAll(filters);
      
      setState(prev => ({
        ...prev,
        filteredData: response.data,
        loading: false
      }));

      return response.data;

    } catch (error) {
      console.error('Error filtering water quality data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to filter data'
      }));
      return [];
    }
  };

  const getCountyWaterQuality = async (countyName: string): Promise<County | null> => {
    try {
      const response = await waterQualityApi.getByCounty(countyName);
      return response.data;
    } catch (error) {
      console.error(`Error getting water quality for ${countyName}:`, error);
      return null;
    }
  };

  const getContaminantLevel = (
    county: County, 
    contaminant: 'lead' | 'arsenic' | 'nitrate'
  ): 'good' | 'moderate' | 'poor' => {
    const values = {
      lead: county.lead_avg_ug_per_L,
      arsenic: county.arsenic_avg_ug_per_L,
      nitrate: county.nitrate_avg_mg_per_L
    };

    const thresholds = {
      lead: { good: 5, moderate: 15 },
      arsenic: { good: 5, moderate: 10 },
      nitrate: { good: 5, moderate: 10 }
    };

    const value = values[contaminant];
    const threshold = thresholds[contaminant];

    if (value <= threshold.good) return 'good';
    if (value <= threshold.moderate) return 'moderate';
    return 'poor';
  };

  const getSummaryStats = () => {
    if (!state.waterQualityStats) return null;

    const { lead_avg_ug_per_L, arsenic_avg_ug_per_L, nitrate_avg_mg_per_L } = state.waterQualityStats;

    return {
      lead: {
        average: lead_avg_ug_per_L.mean,
        worst: lead_avg_ug_per_L.max,
        best: lead_avg_ug_per_L.min,
        median: lead_avg_ug_per_L.median
      },
      arsenic: {
        average: arsenic_avg_ug_per_L.mean,
        worst: arsenic_avg_ug_per_L.max,
        best: arsenic_avg_ug_per_L.min,
        median: arsenic_avg_ug_per_L.median
      },
      nitrate: {
        average: nitrate_avg_mg_per_L.mean,
        worst: nitrate_avg_mg_per_L.max,
        best: nitrate_avg_mg_per_L.min,
        median: nitrate_avg_mg_per_L.median
      }
    };
  };

  const refreshData = () => {
    loadWaterQualityData();
  };

  useEffect(() => {
    loadWaterQualityData();
  }, []);

  return {
    ...state,
    filterWaterQualityData,
    getCountyWaterQuality,
    getContaminantLevel,
    getSummaryStats,
    refreshData
  };
}; 