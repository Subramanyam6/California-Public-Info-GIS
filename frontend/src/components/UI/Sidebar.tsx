import React, { useState, useEffect, useRef } from 'react';
import { Form, InputGroup, Button, Alert, Badge } from 'react-bootstrap';
import { County, WaterQualityStats } from '../../services/api';
import { GeocodingService } from '../../services/geocodingService';

interface SidebarProps {
  counties: County[] | null;
  selectedCounty: County | null;
  onCountySelect: (county: County | null) => void;
  filters: {
    showPopulation: boolean;
    showWaterQuality: boolean;
    showTreatmentPlants: boolean;
    maxLead: number | null;
    maxArsenic: number | null;
    maxNitrate: number | null;
    plantDistance: number;
  };
  onFilterChange: (filters: any) => void;
  onLocationSearch: (location: any) => void;
  waterQualityStats: WaterQualityStats | null;
  worstCounties: any | null;
}

// California county coordinates (approximate centroids)
const COUNTY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Alameda': { lat: 37.6017, lng: -121.7195 },
  'Alpine': { lat: 38.7641, lng: -119.8132 },
  'Amador': { lat: 38.4265, lng: -120.5695 },
  'Butte': { lat: 39.6413, lng: -121.5802 },
  'Calaveras': { lat: 38.2011, lng: -120.5802 },
  'Colusa': { lat: 39.0154, lng: -122.2419 },
  'Contra Costa': { lat: 37.8534, lng: -121.7195 },
  'Del Norte': { lat: 41.7441, lng: -124.1016 },
  'El Dorado': { lat: 38.7297, lng: -120.3346 },
  'Fresno': { lat: 36.7378, lng: -119.7871 },
  'Glenn': { lat: 39.5179, lng: -122.3419 },
  'Humboldt': { lat: 40.7449, lng: -124.1016 },
  'Imperial': { lat: 32.8427, lng: -115.3617 },
  'Inyo': { lat: 36.8000, lng: -118.0000 },
  'Kern': { lat: 35.3733, lng: -119.0187 },
  'Kings': { lat: 36.1013, lng: -119.8456 },
  'Lake': { lat: 39.0840, lng: -122.7633 },
  'Lassen': { lat: 40.4732, lng: -120.5802 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Madera': { lat: 37.0611, lng: -119.5871 },
  'Marin': { lat: 38.0834, lng: -122.7633 },
  'Mariposa': { lat: 37.4849, lng: -119.9665 },
  'Mendocino': { lat: 39.3074, lng: -123.8022 },
  'Merced': { lat: 37.3022, lng: -120.4829 },
  'Modoc': { lat: 41.5888, lng: -120.3346 },
  'Mono': { lat: 37.9577, lng: -119.0000 },
  'Monterey': { lat: 36.2333, lng: -121.4334 },
  'Napa': { lat: 38.5025, lng: -122.2654 },
  'Nevada': { lat: 39.2779, lng: -121.0161 },
  'Orange': { lat: 33.7175, lng: -117.8311 },
  'Placer': { lat: 39.0916, lng: -120.8039 },
  'Plumas': { lat: 39.9568, lng: -120.8039 },
  'Riverside': { lat: 33.7455, lng: -116.2023 },
  'Sacramento': { lat: 38.4747, lng: -121.3542 },
  'San Benito': { lat: 36.6077, lng: -121.0161 },
  'San Bernardino': { lat: 34.8941, lng: -116.4194 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'San Joaquin': { lat: 37.9358, lng: -121.2908 },
  'San Luis Obispo': { lat: 35.3102, lng: -120.6596 },
  'San Mateo': { lat: 37.4419, lng: -122.4194 },
  'Santa Barbara': { lat: 34.4208, lng: -119.6982 },
  'Santa Clara': { lat: 37.3541, lng: -121.9552 },
  'Santa Cruz': { lat: 37.0421, lng: -122.0139 },
  'Shasta': { lat: 40.7908, lng: -122.3419 },
  'Sierra': { lat: 39.5779, lng: -120.6802 },
  'Siskiyou': { lat: 41.5888, lng: -122.7633 },
  'Solano': { lat: 38.2494, lng: -121.9552 },
  'Sonoma': { lat: 38.5780, lng: -122.9888 },
  'Stanislaus': { lat: 37.5091, lng: -121.0161 },
  'Sutter': { lat: 39.0154, lng: -121.6169 },
  'Tehama': { lat: 40.0265, lng: -122.3419 },
  'Trinity': { lat: 40.6221, lng: -123.1147 },
  'Tulare': { lat: 36.2077, lng: -118.9456 },
  'Tuolumne': { lat: 37.9502, lng: -120.2346 },
  'Ventura': { lat: 34.3705, lng: -119.1391 },
  'Yolo': { lat: 38.7646, lng: -121.9018 },
  'Yuba': { lat: 39.2779, lng: -121.4169 }
};

const Sidebar: React.FC<SidebarProps> = ({
  counties,
  selectedCounty,
  onCountySelect,
  filters,
  onFilterChange,
  onLocationSearch,
  waterQualityStats,
  worstCounties
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [addressTerm, setAddressTerm] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [hasSearchedAddress, setHasSearchedAddress] = useState(false);
  const [filterValues, setFilterValues] = useState({
    maxLead: '',
    maxArsenic: '',
    maxNitrate: ''
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter counties based on search term
  const filteredCounties = counties?.filter(county =>
    county.county_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFilterToggle = (filterName: string) => {
    onFilterChange({ [filterName]: !filters[filterName as keyof typeof filters] });
  };

  const handleNumericFilterChange = (filterName: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterName]: value }));
    
    const numericValue = value === '' ? null : parseFloat(value);
    onFilterChange({ [filterName]: numericValue });
  };

  const handleCountyClick = (county: County) => {
    // Don't auto-select county, just zoom to it and show info marker
    setSearchTerm(county.county_name);
    setShowDropdown(false);
    
    // Get coordinates for the county and zoom to it
    const coordinates = COUNTY_COORDINATES[county.county_name];
    if (coordinates) {
      onLocationSearch({
        lat: coordinates.lat,
        lng: coordinates.lng,
        zoom: 9,
        type: 'county'
      });
    } else {
      // Fallback to California center if county coordinates not found
      onLocationSearch({
        lat: 37.0,
        lng: -119.4,
        zoom: 8,
        type: 'county'
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  const handleAddressSearch = async () => {
    if (!addressTerm.trim()) return;

    setAddressLoading(true);
    setAddressError('');

    try {
      const result = await GeocodingService.geocodeAddress(addressTerm);
      
      if (result) {
        if (GeocodingService.isInCalifornia(result.latitude, result.longitude)) {
          // Success - zoom to address location and enable treatment plants layer
          onLocationSearch({
            lat: result.latitude,
            lng: result.longitude,
            zoom: 9,
            address: result.formatted_address,
            type: 'address'
          });
          setAddressError('');
          setHasSearchedAddress(true);
          
          // Auto-enable treatment plants layer if not already enabled
          if (!filters.showTreatmentPlants) {
            onFilterChange({ showTreatmentPlants: true });
          }
        } else {
          setAddressError('Address is outside California. Please enter a California address.');
        }
      } else {
        setAddressError('Address not found. Please try a different address.');
      }
    } catch (error) {
      setAddressError('Error searching for address. Please try again.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setShowDropdown(false);
    setAddressTerm('');
    setAddressError('');
    setHasSearchedAddress(false);
    onCountySelect(null);
    // Reset map view to California and clear search location
    onLocationSearch({
      lat: 37.0,
      lng: -119.4,
      zoom: 6,
      type: 'reset'
    });
  };

  const getContaminantLevel = (value: number, contaminant: 'lead' | 'arsenic' | 'nitrate'): string => {
    const thresholds = {
      lead: { good: 5, moderate: 15 },
      arsenic: { good: 5, moderate: 10 },
      nitrate: { good: 5, moderate: 10 }
    };

    const threshold = thresholds[contaminant];
    if (value <= threshold.good) return 'success';
    if (value <= threshold.moderate) return 'warning';
    return 'danger';
  };

  return (
    <div className="sidebar h-100 d-flex flex-column">
      {/* Header */}
      <div className="sidebar-section">
        <h5 className="mb-3 modern-title">California Water Quality GIS</h5>
        
        {/* Searchable County Dropdown with Refresh */}
        <div className="search-dropdown-container mb-3" style={{ position: 'relative' }} ref={dropdownRef}>
          <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search counties..."
            value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowDropdown(searchTerm.length > 0)}
            />
            <Button 
              variant="outline-secondary" 
              onClick={handleRefresh}
              title="Refresh and reset map view"
              className="refresh-btn"
            >
              <i className="fas fa-sync-alt"></i>
            </Button>
          </InputGroup>
          
          {showDropdown && (
            <div 
              className="search-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #ced4da',
                borderTop: 'none',
                borderRadius: '0 0 0.375rem 0.375rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {filteredCounties.length > 0 ? (
                filteredCounties.map((county) => (
                  <div
                    key={county.county_name}
                    className="dropdown-item"
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f8f9fa'
                    }}
                    onClick={() => handleCountyClick(county)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div className="fw-bold">{county.county_name}</div>
                    <small className="text-muted">
                      Pop: {county.total_population.toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <div className="dropdown-item text-muted" style={{ padding: '0.5rem' }}>
                  No counties found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Or Divider */}
        <div className="text-center mb-3">
          <small className="text-muted">or</small>
        </div>

        {/* Address Search */}
        <div className="mb-3">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="CA address to find nearby plants..."
              title="Enter a CA address to find nearby treatment plants"
              value={addressTerm}
              onChange={(e) => setAddressTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
            />
            <Button 
              variant="primary" 
              onClick={handleAddressSearch}
              disabled={addressLoading || !addressTerm.trim()}
              className="address-search-btn"
            >
              {addressLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-search"></i>
              )}
            </Button>
        </InputGroup>
          {addressError && (
            <Alert variant="warning" className="mt-2 py-2">
              <small>{addressError}</small>
            </Alert>
          )}
        </div>
      </div>

      {/* Layer Controls */}
      <div className="sidebar-section">
        <h6>Map Layers</h6>
        
        <Form.Check
          type="switch"
          id="show-population"
          label="Population Data"
          checked={filters.showPopulation}
          onChange={() => handleFilterToggle('showPopulation')}
          className="mb-2"
        />
        
        <Form.Check
          type="switch"
          id="show-water-quality"
          label="Water Quality"
          checked={filters.showWaterQuality}
          onChange={() => handleFilterToggle('showWaterQuality')}
          className="mb-2"
        />
        
        <Form.Check
          type="switch"
          id="show-treatment-plants"
          label="Treatment Plants"
          checked={filters.showTreatmentPlants}
          onChange={() => handleFilterToggle('showTreatmentPlants')}
          className="mb-2"
        />
        
        {/* Treatment Plant Distance Filter - Only show when address is searched */}
        {hasSearchedAddress && filters.showTreatmentPlants && (
          <div className="mt-3 p-3" style={{ backgroundColor: '#e8f4fd', borderRadius: '8px', border: '1px solid #bee5eb' }}>
            <Form.Label className="mb-2">
              <i className="fas fa-map-marker-alt text-primary me-1"></i>
              <strong>Distance from your location</strong>
            </Form.Label>
            <div className="d-flex align-items-center mb-2">
              <span className="me-2" style={{ minWidth: '30px', fontSize: '0.9rem' }}>1 mi</span>
              <Form.Range
                min={1}
                max={500}
                step={5}
                value={filters.plantDistance}
                onChange={(e) => onFilterChange({ plantDistance: parseInt(e.target.value) })}
                className="flex-grow-1"
              />
              <span className="ms-2" style={{ minWidth: '50px', fontSize: '0.9rem' }}>500 mi</span>
            </div>
            <div className="text-center">
              <Badge bg="primary" className="px-3 py-2">
                <i className="fas fa-crosshairs me-1"></i>
                {filters.plantDistance} miles
              </Badge>
            </div>
            <small className="text-muted d-block mt-2 text-center">
              Showing treatment plants within {filters.plantDistance} miles of your address
            </small>
          </div>
        )}
      </div>

      {/* Water Quality Filters */}
      {filters.showWaterQuality && (
        <div className="sidebar-section">
          <h6>Water Quality Filters</h6>
          
          <div className="filter-group">
            <Form.Label>
              Max Lead (μg/L) 
              <small className="text-danger ms-1">(Higher is worse)</small>
            </Form.Label>
            <div className="number-control">
              <button 
                className="control-btn minus-btn"
                onClick={() => {
                  const currentValue = parseFloat(filterValues.maxLead) || 0;
                  const newValue = Math.max(0, currentValue - 1);
                  handleNumericFilterChange('maxLead', newValue.toString());
                }}
                disabled={!filterValues.maxLead || filterValues.maxLead === '' || parseFloat(filterValues.maxLead || '0') <= 0}
              >
                −
              </button>
              <span className="control-value">
                {filterValues.maxLead || '∞'}
              </span>
              <button 
                className="control-btn plus-btn"
                onClick={() => {
                  const currentValue = parseFloat(filterValues.maxLead) || 0;
                  const newValue = Math.min(50, currentValue + 1);
                  handleNumericFilterChange('maxLead', newValue.toString());
                }}
                disabled={Boolean(filterValues.maxLead && parseFloat(filterValues.maxLead) >= 50)}
              >
                +
              </button>
            </div>
            <small className="text-muted">Safe: &lt;5, Moderate: 5-15, High: &gt;15</small>
          </div>
          
          <div className="filter-group">
            <Form.Label>
              Max Arsenic (μg/L)
              <small className="text-danger ms-1">(Higher is worse)</small>
            </Form.Label>
            <div className="number-control">
              <button 
                className="control-btn minus-btn"
                onClick={() => {
                  const currentValue = parseFloat(filterValues.maxArsenic) || 0;
                  const newValue = Math.max(0, currentValue - 1);
                  handleNumericFilterChange('maxArsenic', newValue.toString());
                }}
                disabled={!filterValues.maxArsenic || filterValues.maxArsenic === '' || parseFloat(filterValues.maxArsenic || '0') <= 0}
              >
                −
              </button>
              <span className="control-value">
                {filterValues.maxArsenic || '∞'}
              </span>
              <button 
                className="control-btn plus-btn"
                onClick={() => {
                  const currentValue = parseFloat(filterValues.maxArsenic) || 0;
                  const newValue = Math.min(25, currentValue + 1);
                  handleNumericFilterChange('maxArsenic', newValue.toString());
                }}
                disabled={Boolean(filterValues.maxArsenic && parseFloat(filterValues.maxArsenic) >= 25)}
              >
                +
              </button>
            </div>
            <small className="text-muted">Safe: &lt;5, Moderate: 5-10, High: &gt;10</small>
          </div>
          
          <div className="filter-group">
            <Form.Label>
              Max Nitrate (mg/L)
              <small className="text-danger ms-1">(Higher is worse)</small>
            </Form.Label>
            <div className="number-control">
              <button 
                className="control-btn minus-btn"
                onClick={() => {
                  const currentValue = parseFloat(filterValues.maxNitrate) || 0;
                  const newValue = Math.max(0, currentValue - 1);
                  handleNumericFilterChange('maxNitrate', newValue.toString());
                }}
                disabled={!filterValues.maxNitrate || filterValues.maxNitrate === '' || parseFloat(filterValues.maxNitrate || '0') <= 0}
              >
                −
              </button>
              <span className="control-value">
                {filterValues.maxNitrate || '∞'}
              </span>
              <button 
                className="control-btn plus-btn"
                onClick={() => {
                  const currentValue = parseFloat(filterValues.maxNitrate) || 0;
                  const newValue = Math.min(20, currentValue + 1);
                  handleNumericFilterChange('maxNitrate', newValue.toString());
                }}
                disabled={Boolean(filterValues.maxNitrate && parseFloat(filterValues.maxNitrate) >= 20)}
              >
                +
              </button>
            </div>
            <small className="text-muted">Safe: &lt;5, Moderate: 5-10, High: &gt;10</small>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {waterQualityStats && (
        <div className="sidebar-section">
          <h6>Statewide Pollutant Averages</h6>
          
          <div className="stats-card">
            <div className="stats-value">
              {waterQualityStats.lead_avg_ug_per_L.mean.toFixed(1)} μg/L
            </div>
            <div className="stats-label">Average Lead</div>
          </div>
          
          <div className="stats-card">
            <div className="stats-value">
              {waterQualityStats.arsenic_avg_ug_per_L.mean.toFixed(1)} μg/L
            </div>
            <div className="stats-label">Average Arsenic</div>
          </div>
          
          <div className="stats-card">
            <div className="stats-value">
              {waterQualityStats.nitrate_avg_mg_per_L.mean.toFixed(1)} mg/L
            </div>
            <div className="stats-label">Average Nitrate</div>
          </div>
        </div>
      )}

      {/* Counties List */}
      <div className="sidebar-section flex-grow-1">
        <h6>Counties ({filteredCounties.length})</h6>
        
        <div className="county-list">
          {filteredCounties.map((county) => (
            <div
              key={county.county_name}
              className={`county-item ${selectedCounty?.county_name === county.county_name ? 'selected' : ''}`}
              onClick={() => handleCountyClick(county)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{county.county_name}</div>
                  <small className="text-muted">
                    Pop: {county.total_population.toLocaleString()}
                  </small>
                </div>
                <div className="d-flex flex-column">
                  <Badge 
                    bg={getContaminantLevel(county.lead_avg_ug_per_L, 'lead')}
                    className="mb-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Pb: {county.lead_avg_ug_per_L.toFixed(1)}
                  </Badge>
                  <Badge 
                    bg={getContaminantLevel(county.arsenic_avg_ug_per_L, 'arsenic')}
                    style={{ fontSize: '0.7rem' }}
                  >
                    As: {county.arsenic_avg_ug_per_L.toFixed(1)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 