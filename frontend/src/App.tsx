import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'material-icons/iconfont/material-icons.css';
import { Alert, Button } from 'react-bootstrap';
import MapContainer from './components/Map/MapContainer';
import Sidebar from './components/UI/Sidebar';
import DataPanel from './components/UI/DataPanel';
import AboutButton from './components/UI/AboutButton';
import Footer from './components/UI/Footer';
import { useMapData } from './hooks/useMapData';
import { useWaterQuality } from './hooks/useWaterQuality';
import './App.css';

const THEME_STORAGE_KEY = 'cwcc-theme';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  const [mapFilters, setMapFilters] = useState({
    showPopulation: false,
    showWaterQuality: false,
    showTreatmentPlants: false,
    maxLead: null as number | null,
    maxArsenic: null as number | null,
    maxNitrate: null as number | null,
    plantDistance: 100 as number,
  });
  const [searchLocation, setSearchLocation] = useState<any>(null);

  const {
    counties,
    countyBoundaries,
    treatmentPlants,
    loading: mapLoading,
    error: mapError,
  } = useMapData();

  const {
    waterQualityStats,
    worstCounties,
    loading: waterQualityLoading,
  } = useWaterQuality();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleCountySelect = (county: any) => {
    setSelectedCounty(county);
  };

  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...mapFilters, ...newFilters };

    if (newFilters.showPopulation === true && mapFilters.showWaterQuality) {
      updatedFilters.showWaterQuality = false;
    }

    if (newFilters.showWaterQuality === true && mapFilters.showPopulation) {
      updatedFilters.showPopulation = false;
    }

    setMapFilters(updatedFilters);
  };

  const handleLocationSearch = (location: any) => {
    setSearchLocation(location);
  };

  const activeLayerLabel = mapFilters.showPopulation
    ? 'Population Layer'
    : mapFilters.showWaterQuality
      ? 'Water Quality Layer'
      : mapFilters.showTreatmentPlants
        ? 'Treatment Infrastructure'
        : 'Boundary Overview';

  if (mapLoading || waterQualityLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-panel">
          <div className="loading-ripple" aria-hidden="true">
            <span></span>
            <span></span>
          </div>
          <h2>Launching Water Intelligence Workspace</h2>
          <p>
            Initializing county layers, contaminant indices, and treatment
            infrastructure.
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="app-loading-screen">
        <Alert variant="danger" className="error-panel">
          <h4>Dataset Initialization Failed</h4>
          <p>{mapError}</p>
          <Button
            className="error-retry-btn"
            onClick={() => window.location.reload()}
          >
            Reload Workspace
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="enterprise-dashboard">
      <div className="dashboard-wave wave-a"></div>
      <div className="dashboard-wave wave-b"></div>
      <div className="dashboard-wave wave-c"></div>

      <header className="dashboard-header">
        <div className="brand-column">
          <p className="brand-eyebrow">Environmental Intelligence Platform</p>
          <h1>California Water Command Center</h1>
          <p className="brand-copy">
            Enterprise-grade geospatial monitoring for county contamination,
            public treatment access, and location-aware infrastructure coverage.
          </p>
        </div>

        <div className="header-kpi-grid">
          <div className="kpi-card">
            <span>Counties Monitored</span>
            <strong>{counties?.length ?? 0}</strong>
          </div>
          <div className="kpi-card">
            <span>Avg Lead</span>
            <strong>
              {waterQualityStats
                ? `${waterQualityStats.lead_avg_ug_per_L.mean.toFixed(1)} μg/L`
                : '—'}
            </strong>
          </div>
          <div className="kpi-card">
            <span>Avg Arsenic</span>
            <strong>
              {waterQualityStats
                ? `${waterQualityStats.arsenic_avg_ug_per_L.mean.toFixed(1)} μg/L`
                : '—'}
            </strong>
          </div>
          <div className="kpi-card">
            <span>Avg Nitrate</span>
            <strong>
              {waterQualityStats
                ? `${waterQualityStats.nitrate_avg_mg_per_L.mean.toFixed(1)} mg/L`
                : '—'}
            </strong>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'day' : 'night'} theme`}
          >
            <i
              className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}
              aria-hidden="true"
            ></i>
            {theme === 'dark' ? 'Day Theme' : 'Night Theme'}
          </button>
          <AboutButton />
        </div>
      </header>

      <main className="dashboard-main">
        <section className="map-workspace">
          <div className="workspace-header">
            <div>
              <h2>Geospatial Operations Board</h2>
              <p>
                Inspect counties, stress-test thresholds, and pinpoint treatment
                assets from one control surface.
              </p>
            </div>
            <div className="workspace-badges">
              <span className="status-pill primary-pill">{activeLayerLabel}</span>
              <span className="status-pill subtle-pill">Live Dataset</span>
            </div>
          </div>

          <div className="workspace-map-frame">
            <MapContainer
              counties={counties}
              countyBoundaries={countyBoundaries}
              treatmentPlants={treatmentPlants}
              selectedCounty={selectedCounty}
              onCountySelect={handleCountySelect}
              filters={mapFilters}
              searchLocation={searchLocation}
            />
          </div>
        </section>

        <aside className="control-workspace">
          <Sidebar
            counties={counties}
            selectedCounty={selectedCounty}
            onCountySelect={handleCountySelect}
            filters={mapFilters}
            onFilterChange={handleFilterChange}
            onLocationSearch={handleLocationSearch}
            waterQualityStats={waterQualityStats}
            worstCounties={worstCounties}
          />
        </aside>
      </main>

      {selectedCounty && (
        <DataPanel county={selectedCounty} onClose={() => setSelectedCounty(null)} />
      )}

      <Footer />
    </div>
  );
}

export default App;
