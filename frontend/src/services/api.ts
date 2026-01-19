import axios from 'axios';

type RuntimeEnv = {
  API_BASE_URL?: string;
  API_TIMEOUT?: string;
};

const runtimeEnv = (window as any).__ENV__ as RuntimeEnv | undefined;
const rawBaseUrl =
  runtimeEnv?.API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:5001/api/v1';

const normalizeApiBaseUrl = (baseUrl: string): string => {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return /\/api\/v1$/.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
};

const API_BASE_URL = normalizeApiBaseUrl(rawBaseUrl);
const timeoutValue = runtimeEnv?.API_TIMEOUT || process.env.REACT_APP_API_TIMEOUT;
const API_TIMEOUT = timeoutValue ? parseInt(timeoutValue, 10) : 30000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface County {
  county_name: string;
  total_population: number;
  lead_avg_ug_per_L: number;
  arsenic_avg_ug_per_L: number;
  nitrate_avg_mg_per_L: number;
}

export interface TreatmentPlant {
  facility_id: number;
  facility_name: string;
  county: string;
  latitude: number;
  longitude: number;
  public_access: string;
  capacity_mgd?: number;
}

export interface WaterQualityStats {
  lead_avg_ug_per_L: {
    mean: number;
    median: number;
    min: number;
    max: number;
    std: number;
  };
  arsenic_avg_ug_per_L: {
    mean: number;
    median: number;
    min: number;
    max: number;
    std: number;
  };
  nitrate_avg_mg_per_L: {
    mean: number;
    median: number;
    min: number;
    max: number;
    std: number;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  count?: number;
  message?: string;
}

// Counties API
export const countiesApi = {
  getAll: (): Promise<ApiResponse<County[]>> =>
    apiClient.get('/counties').then(res => res.data),

  getByName: (countyName: string): Promise<ApiResponse<County>> =>
    apiClient.get(`/counties/${encodeURIComponent(countyName)}`).then(res => res.data),

  getBoundaries: (): Promise<any> =>
    apiClient.get('/counties/boundaries').then(res => res.data?.data ?? res.data),

  getPopulation: (sortBy = 'county_name', order = 'asc'): Promise<ApiResponse<County[]>> =>
    apiClient.get('/counties/population', { params: { sort_by: sortBy, order } }).then(res => res.data),
};

// Water Quality API
export const waterQualityApi = {
  getAll: (filters?: {
    maxLead?: number;
    maxArsenic?: number;
    maxNitrate?: number;
  }): Promise<ApiResponse<County[]>> =>
    apiClient.get('/water-quality', { params: filters }).then(res => res.data),

  getByCounty: (countyName: string): Promise<ApiResponse<County>> =>
    apiClient.get(`/water-quality/${encodeURIComponent(countyName)}`).then(res => res.data),

  getStatistics: (): Promise<ApiResponse<WaterQualityStats>> =>
    apiClient.get('/water-quality/statistics').then(res => res.data),

  getWorstCounties: (limit = 10): Promise<ApiResponse<any>> =>
    apiClient.get('/water-quality/worst-counties', { params: { limit } }).then(res => res.data),
};

// Treatment Plants API
export const treatmentPlantsApi = {
  getAll: (filters?: {
    county?: string;
    publicAccess?: boolean;
  }): Promise<ApiResponse<TreatmentPlant[]>> =>
    apiClient.get('/treatment-plants', { params: filters }).then(res => res.data),

  getById: (facilityId: number): Promise<ApiResponse<TreatmentPlant>> =>
    apiClient.get(`/treatment-plants/${facilityId}`).then(res => res.data),

  getNearby: (lat: number, lng: number, radius = 50): Promise<ApiResponse<TreatmentPlant[]>> =>
    apiClient.get('/treatment-plants/nearby', { params: { lat, lng, radius } }).then(res => res.data),

  getByCounty: (countyName: string): Promise<ApiResponse<TreatmentPlant[]>> =>
    apiClient.get(`/treatment-plants/county/${encodeURIComponent(countyName)}`).then(res => res.data),
};

export default apiClient; 
