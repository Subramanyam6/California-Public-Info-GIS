import React, { useMemo, useState, useEffect, useRef } from 'react';
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

const COUNTY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  Alameda: { lat: 37.6017, lng: -121.7195 },
  Alpine: { lat: 38.7641, lng: -119.8132 },
  Amador: { lat: 38.4265, lng: -120.5695 },
  Butte: { lat: 39.6413, lng: -121.5802 },
  Calaveras: { lat: 38.2011, lng: -120.5802 },
  Colusa: { lat: 39.0154, lng: -122.2419 },
  'Contra Costa': { lat: 37.8534, lng: -121.7195 },
  'Del Norte': { lat: 41.7441, lng: -124.1016 },
  'El Dorado': { lat: 38.7297, lng: -120.3346 },
  Fresno: { lat: 36.7378, lng: -119.7871 },
  Glenn: { lat: 39.5179, lng: -122.3419 },
  Humboldt: { lat: 40.7449, lng: -124.1016 },
  Imperial: { lat: 32.8427, lng: -115.3617 },
  Inyo: { lat: 36.8, lng: -118.0 },
  Kern: { lat: 35.3733, lng: -119.0187 },
  Kings: { lat: 36.1013, lng: -119.8456 },
  Lake: { lat: 39.084, lng: -122.7633 },
  Lassen: { lat: 40.4732, lng: -120.5802 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  Madera: { lat: 37.0611, lng: -119.5871 },
  Marin: { lat: 38.0834, lng: -122.7633 },
  Mariposa: { lat: 37.4849, lng: -119.9665 },
  Mendocino: { lat: 39.3074, lng: -123.8022 },
  Merced: { lat: 37.3022, lng: -120.4829 },
  Modoc: { lat: 41.5888, lng: -120.3346 },
  Mono: { lat: 37.9577, lng: -119.0 },
  Monterey: { lat: 36.2333, lng: -121.4334 },
  Napa: { lat: 38.5025, lng: -122.2654 },
  Nevada: { lat: 39.2779, lng: -121.0161 },
  Orange: { lat: 33.7175, lng: -117.8311 },
  Placer: { lat: 39.0916, lng: -120.8039 },
  Plumas: { lat: 39.9568, lng: -120.8039 },
  Riverside: { lat: 33.7455, lng: -116.2023 },
  Sacramento: { lat: 38.4747, lng: -121.3542 },
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
  Shasta: { lat: 40.7908, lng: -122.3419 },
  Sierra: { lat: 39.5779, lng: -120.6802 },
  Siskiyou: { lat: 41.5888, lng: -122.7633 },
  Solano: { lat: 38.2494, lng: -121.9552 },
  Sonoma: { lat: 38.578, lng: -122.9888 },
  Stanislaus: { lat: 37.5091, lng: -121.0161 },
  Sutter: { lat: 39.0154, lng: -121.6169 },
  Tehama: { lat: 40.0265, lng: -122.3419 },
  Trinity: { lat: 40.6221, lng: -123.1147 },
  Tulare: { lat: 36.2077, lng: -118.9456 },
  Tuolumne: { lat: 37.9502, lng: -120.2346 },
  Ventura: { lat: 34.3705, lng: -119.1391 },
  Yolo: { lat: 38.7646, lng: -121.9018 },
  Yuba: { lat: 39.2779, lng: -121.4169 },
};

const Sidebar: React.FC<SidebarProps> = ({
  counties,
  selectedCounty,
  onCountySelect,
  filters,
  onFilterChange,
  onLocationSearch,
  waterQualityStats,
  worstCounties,
}) => {
  const [countyQuery, setCountyQuery] = useState('');
  const [showCountyMatches, setShowCountyMatches] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [hasAddressContext, setHasAddressContext] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [thresholdInputs, setThresholdInputs] = useState({
    maxLead: filters.maxLead !== null ? filters.maxLead.toString() : '',
    maxArsenic: filters.maxArsenic !== null ? filters.maxArsenic.toString() : '',
    maxNitrate: filters.maxNitrate !== null ? filters.maxNitrate.toString() : '',
  });

  const countyLookupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (countyLookupRef.current && !countyLookupRef.current.contains(event.target as Node)) {
        setShowCountyMatches(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  useEffect(() => {
    setThresholdInputs({
      maxLead: filters.maxLead !== null ? filters.maxLead.toString() : '',
      maxArsenic: filters.maxArsenic !== null ? filters.maxArsenic.toString() : '',
      maxNitrate: filters.maxNitrate !== null ? filters.maxNitrate.toString() : '',
    });
  }, [filters.maxLead, filters.maxArsenic, filters.maxNitrate]);

  const rankedCounties = useMemo(() => {
    if (!counties) {
      return [];
    }

    const query = countyQuery.trim().toLowerCase();
    const base = [...counties].sort((a, b) => b.total_population - a.total_population);

    if (!query) {
      return base;
    }

    return base.filter((county) => county.county_name.toLowerCase().includes(query));
  }, [counties, countyQuery]);

  const countyMatches = rankedCounties.slice(0, 8);
  const countyDirectory = rankedCounties.slice(0, 24);

  const highLeadQueue = worstCounties?.highest_lead?.slice(0, 4) ?? [];

  const focusCounty = (county: County, openPanel = false) => {
    const coordinates = COUNTY_COORDINATES[county.county_name];

    if (coordinates) {
      onLocationSearch({
        lat: coordinates.lat,
        lng: coordinates.lng,
        zoom: 9,
        type: 'county',
      });
    } else {
      onLocationSearch({
        lat: 37.0,
        lng: -119.4,
        zoom: 8,
        type: 'county',
      });
    }

    if (openPanel) {
      onCountySelect(county);
    }
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) {
      return;
    }

    setAddressLoading(true);
    setAddressError('');

    try {
      const result = await GeocodingService.geocodeAddress(addressQuery);

      if (result) {
        if (GeocodingService.isInCalifornia(result.latitude, result.longitude)) {
          onLocationSearch({
            lat: result.latitude,
            lng: result.longitude,
            zoom: 10,
            address: result.formatted_address,
            type: 'address',
          });

          setAddressError('');
          setHasAddressContext(true);

          if (!filters.showTreatmentPlants) {
            onFilterChange({ showTreatmentPlants: true });
          }
        } else {
          setAddressError('Address is outside California. Enter a California location.');
        }
      } else {
        setAddressError('Address not found. Try a more specific address.');
      }
    } catch (error) {
      setAddressError('Location lookup failed. Please retry.');
    } finally {
      setAddressLoading(false);
    }
  };

  const resetWorkspace = () => {
    setCountyQuery('');
    setShowCountyMatches(false);
    setAddressQuery('');
    setAddressError('');
    setHasAddressContext(false);
    setIsDirectoryOpen(false);
    onCountySelect(null);
    onLocationSearch({
      lat: 37.0,
      lng: -119.4,
      zoom: 6,
      type: 'reset',
    });
  };

  const toggleLayer = (layer: 'showPopulation' | 'showWaterQuality' | 'showTreatmentPlants') => {
    onFilterChange({ [layer]: !filters[layer] });
  };

  const updateThreshold = (
    key: 'maxLead' | 'maxArsenic' | 'maxNitrate',
    max: number,
    rawValue: string
  ) => {
    setThresholdInputs((prev) => ({ ...prev, [key]: rawValue }));

    if (rawValue === '') {
      onFilterChange({ [key]: null });
      return;
    }

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      return;
    }

    const clamped = Math.max(0, Math.min(max, parsed));
    onFilterChange({ [key]: clamped });
  };

  const getBadgeTone = (value: number, contaminant: 'lead' | 'arsenic' | 'nitrate') => {
    const thresholds = {
      lead: { good: 5, moderate: 15 },
      arsenic: { good: 5, moderate: 10 },
      nitrate: { good: 5, moderate: 10 },
    };

    const threshold = thresholds[contaminant];
    if (value <= threshold.good) return 'success';
    if (value <= threshold.moderate) return 'warning';
    return 'danger';
  };

  return (
    <div className="control-tower">
      <div className="control-scroll">
        <section className="tower-section tower-section-intro">
          <div className="tower-header-row">
            <div>
              <p className="tower-kicker">Control Tower</p>
              <h3>Query & Focus</h3>
            </div>
            <button type="button" className="tower-reset-btn" onClick={resetWorkspace}>
              <i className="fas fa-broom"></i>
              Reset
            </button>
          </div>
          <p className="tower-description">
            Run county-level investigations, map an address, and open county
            profiles from one operational panel.
          </p>

          <div className="query-stack" ref={countyLookupRef}>
            <label htmlFor="county-query">County Lookup</label>
            <InputGroup>
              <Form.Control
                id="county-query"
                type="text"
                placeholder="Type county name..."
                value={countyQuery}
                onChange={(event) => {
                  setCountyQuery(event.target.value);
                  setShowCountyMatches(true);
                }}
                onFocus={() => setShowCountyMatches(true)}
              />
              <Button
                variant="outline-secondary"
                className="query-icon-btn"
                onClick={() => setShowCountyMatches((prev) => !prev)}
              >
                <i className="fas fa-search"></i>
              </Button>
            </InputGroup>

            {showCountyMatches && countyMatches.length > 0 && (
              <div className="county-match-list">
                {countyMatches.map((county) => (
                  <button
                    type="button"
                    key={county.county_name}
                    className="county-match-item"
                    onClick={() => {
                      focusCounty(county);
                      setCountyQuery(county.county_name);
                      setShowCountyMatches(false);
                    }}
                  >
                    <span>{county.county_name}</span>
                    <small>{county.total_population.toLocaleString()} residents</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="query-stack">
            <label htmlFor="address-query">Address Locator</label>
            <InputGroup>
              <Form.Control
                id="address-query"
                type="text"
                placeholder="California street address"
                value={addressQuery}
                onChange={(event) => setAddressQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleAddressSearch()}
              />
              <Button
                variant="primary"
                className="query-icon-btn address-btn"
                disabled={addressLoading || !addressQuery.trim()}
                onClick={handleAddressSearch}
              >
                {addressLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-location-arrow"></i>
                )}
              </Button>
            </InputGroup>
            {addressError && (
              <Alert variant="warning" className="tower-alert mb-0 mt-2 py-2">
                <small>{addressError}</small>
              </Alert>
            )}
          </div>
        </section>

        <section className="tower-section">
          <div className="tower-header-row">
            <h3>Layer Orchestration</h3>
            <small>Activate layers as needed</small>
          </div>

          <div className="layer-button-grid">
            <button
              id="show-population"
              type="button"
              className={`layer-toggle-btn ${filters.showPopulation ? 'active' : ''}`}
              onClick={() => toggleLayer('showPopulation')}
            >
              <i className="fas fa-users"></i>
              Population Density
            </button>
            <button
              id="show-water-quality"
              type="button"
              className={`layer-toggle-btn ${filters.showWaterQuality ? 'active' : ''}`}
              onClick={() => toggleLayer('showWaterQuality')}
            >
              <i className="fas fa-flask"></i>
              Water Contaminants
            </button>
            <button
              id="show-treatment-plants"
              type="button"
              className={`layer-toggle-btn ${filters.showTreatmentPlants ? 'active' : ''}`}
              onClick={() => toggleLayer('showTreatmentPlants')}
            >
              <i className="fas fa-building"></i>
              Treatment Plants
            </button>
          </div>

          {hasAddressContext && filters.showTreatmentPlants && (
            <div className="distance-zone-card">
              <div className="distance-zone-top">
                <span>Plant search radius</span>
                <Badge bg="primary">{filters.plantDistance} mi</Badge>
              </div>
              <Form.Range
                min={1}
                max={500}
                step={5}
                value={filters.plantDistance}
                onChange={(event) =>
                  onFilterChange({ plantDistance: parseInt(event.target.value, 10) })
                }
              />
              <small>Filter treatment facilities around your searched address.</small>
            </div>
          )}
        </section>

        <section className="tower-section">
          <div className="tower-header-row">
            <h3>Contaminant Thresholds</h3>
            <small>Set upper limits</small>
          </div>

          <div className="threshold-grid">
            <div className="threshold-card">
              <label htmlFor="threshold-lead">Lead (μg/L)</label>
              <Form.Control
                id="threshold-lead"
                type="number"
                min={0}
                max={50}
                value={thresholdInputs.maxLead}
                placeholder="No limit"
                onChange={(event) => updateThreshold('maxLead', 50, event.target.value)}
              />
              <small>Safe &lt; 5 | Moderate 5-15 | High &gt; 15</small>
            </div>

            <div className="threshold-card">
              <label htmlFor="threshold-arsenic">Arsenic (μg/L)</label>
              <Form.Control
                id="threshold-arsenic"
                type="number"
                min={0}
                max={25}
                value={thresholdInputs.maxArsenic}
                placeholder="No limit"
                onChange={(event) =>
                  updateThreshold('maxArsenic', 25, event.target.value)
                }
              />
              <small>Safe &lt; 5 | Moderate 5-10 | High &gt; 10</small>
            </div>

            <div className="threshold-card">
              <label htmlFor="threshold-nitrate">Nitrate (mg/L)</label>
              <Form.Control
                id="threshold-nitrate"
                type="number"
                min={0}
                max={20}
                value={thresholdInputs.maxNitrate}
                placeholder="No limit"
                onChange={(event) =>
                  updateThreshold('maxNitrate', 20, event.target.value)
                }
              />
              <small>Safe &lt; 5 | Moderate 5-10 | High &gt; 10</small>
            </div>
          </div>
        </section>

        <section className="tower-section">
          <div className="tower-header-row">
            <h3>State Intelligence</h3>
            <small>Latest statewide indicators</small>
          </div>

          {waterQualityStats && (
            <div className="insight-grid">
              <article className="insight-card">
                <span>Lead Mean</span>
                <strong>{waterQualityStats.lead_avg_ug_per_L.mean.toFixed(1)} μg/L</strong>
              </article>
              <article className="insight-card">
                <span>Arsenic Mean</span>
                <strong>{waterQualityStats.arsenic_avg_ug_per_L.mean.toFixed(1)} μg/L</strong>
              </article>
              <article className="insight-card">
                <span>Nitrate Mean</span>
                <strong>{waterQualityStats.nitrate_avg_mg_per_L.mean.toFixed(1)} mg/L</strong>
              </article>
              <article className="insight-card">
                <span>Highest Lead</span>
                <strong>{waterQualityStats.lead_avg_ug_per_L.max.toFixed(1)} μg/L</strong>
              </article>
            </div>
          )}

          {highLeadQueue.length > 0 && (
            <div className="risk-queue">
              <div className="risk-queue-title">Priority Lead Queue</div>
              {highLeadQueue.map((entry: any, index: number) => (
                <div key={`${entry.county_name}-${index}`} className="risk-row">
                  <span>{entry.county_name}</span>
                  <strong>{Number(entry.lead_avg_ug_per_L).toFixed(1)} μg/L</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="tower-section tower-section-last">
          <div className="tower-header-row">
            <h3>County Directory</h3>
            <div className="directory-header-actions">
              <small>{countyDirectory.length} counties in scope</small>
              <button
                type="button"
                className="directory-collapse-btn"
                aria-expanded={isDirectoryOpen}
                onClick={() => setIsDirectoryOpen((prev) => !prev)}
              >
                {isDirectoryOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>

          {!isDirectoryOpen && (
            <p className="directory-collapsed-hint">
              Directory is collapsed by default. Expand when you want to browse
              county-level rows.
            </p>
          )}

          {isDirectoryOpen && (
            <div className="directory-list">
              {countyDirectory.map((county) => (
                <div
                  key={county.county_name}
                  className={`directory-row ${
                    selectedCounty?.county_name === county.county_name ? 'selected' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="directory-focus"
                    onClick={() => focusCounty(county)}
                  >
                    <div className="directory-name">{county.county_name}</div>
                    <small>Population: {county.total_population.toLocaleString()}</small>
                  </button>

                  <div className="directory-side">
                    <Badge bg={getBadgeTone(county.lead_avg_ug_per_L, 'lead')}>
                      Pb {county.lead_avg_ug_per_L.toFixed(1)}
                    </Badge>
                    <Badge bg={getBadgeTone(county.arsenic_avg_ug_per_L, 'arsenic')}>
                      As {county.arsenic_avg_ug_per_L.toFixed(1)}
                    </Badge>
                    <button
                      type="button"
                      className="inspect-btn"
                      onClick={() => focusCounty(county, true)}
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Sidebar;
