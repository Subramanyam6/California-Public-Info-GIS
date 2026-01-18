import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'material-icons/iconfont/material-icons.css';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import MapContainer from './components/Map/MapContainer';
import Sidebar from './components/UI/Sidebar';
import DataPanel from './components/UI/DataPanel';
import AboutButton from './components/UI/AboutButton';
import Footer from './components/UI/Footer';
import { useMapData } from './hooks/useMapData';
import { useWaterQuality } from './hooks/useWaterQuality';
import './App.css';

function App() {
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  const [mapFilters, setMapFilters] = useState({
    showPopulation: false,
    showWaterQuality: false,
    showTreatmentPlants: false,
    maxLead: null as number | null,
    maxArsenic: null as number | null,
    maxNitrate: null as number | null,
    plantDistance: 100 as number // Default 100 miles for treatment plant filtering
  });
  const [searchLocation, setSearchLocation] = useState<any>(null);

  const { 
    counties, 
    countyBoundaries, 
    treatmentPlants, 
    loading: mapLoading, 
    error: mapError 
  } = useMapData();

  const { 
    waterQualityStats, 
    worstCounties, 
    loading: waterQualityLoading 
  } = useWaterQuality();

  const handleCountySelect = (county: any) => {
    setSelectedCounty(county);
  };

  const handleFilterChange = (newFilters: any) => {
    // Handle choropleth layer toggling - ensure only one is active at a time
    const updatedFilters = { ...mapFilters, ...newFilters };
    
    // If Population Data is being enabled, turn off Water Quality
    if (newFilters.showPopulation === true && mapFilters.showWaterQuality) {
      updatedFilters.showWaterQuality = false;
    }
    
    // If Water Quality is being enabled, turn off Population Data  
    if (newFilters.showWaterQuality === true && mapFilters.showPopulation) {
      updatedFilters.showPopulation = false;
    }
    
    setMapFilters(updatedFilters);
  };

  const handleLocationSearch = (location: any) => {
    setSearchLocation(location);
  };

  if (mapLoading || waterQualityLoading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading California Water Quality Data...</p>
        </div>
      </Container>
    );
  }

  if (mapError) {
    return (
      <Container fluid className="mt-3">
        <Alert variant="danger">
          <h4>Error Loading Data</h4>
          <p>{mapError}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="App">
      {/* About Button */}
      <AboutButton />
      
      <Container fluid className="h-100">
        <Row className="h-100">
          {/* Sidebar */}
          <Col md={3} className="sidebar-col">
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
          </Col>

          {/* Main Content - Full Height Map */}
          <Col md={9} className="main-content p-0">
                <MapContainer
                  counties={counties}
                  countyBoundaries={countyBoundaries}
                  treatmentPlants={treatmentPlants}
                  selectedCounty={selectedCounty}
                  onCountySelect={handleCountySelect}
                  filters={mapFilters}
                  searchLocation={searchLocation}
                />
          </Col>
        </Row>

        {/* Data Panel Modal */}
        {selectedCounty && (
          <DataPanel
            county={selectedCounty}
            onClose={() => setSelectedCounty(null)}
          />
        )}
      </Container>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
