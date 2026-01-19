import React, { useEffect, useMemo } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// import CountyLayer from './CountyLayer';
// import TreatmentPlantLayer from './TreatmentPlantLayer';
import MapLegend from './MapLegend';
import { County, TreatmentPlant } from '../../services/api';
import { MapService } from '../../services/mapService';
import { DistanceService } from '../../services/distanceService';

interface MapContainerProps {
  counties: County[] | null;
  countyBoundaries: any;
  treatmentPlants: TreatmentPlant[] | null;
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
  searchLocation: { lat: number; lng: number; zoom: number; address?: string; type?: string } | null;
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

// Create custom info icon for county details
const createInfoIcon = () => {
  return L.divIcon({
    className: 'county-info-marker',
    html: `<div class="info-marker">
      <i class="fas fa-info-circle"></i>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Create address target icon
const createAddressIcon = () => {
  return L.divIcon({
    className: 'address-target-marker',
    html: `<div class="target-marker">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc3545">
        <circle cx="12" cy="12" r="2" fill="#dc3545"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="#dc3545" stroke-width="2"/>
        <circle cx="12" cy="12" r="10" fill="none" stroke="#dc3545" stroke-width="1" opacity="0.5"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#dc3545" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Create treatment plant icon - enhanced for nearest plant highlighting
const createTreatmentPlantIcon = (isNearest = false) => {
  const baseSize = 28;
  const iconSize = isNearest ? baseSize + 6 : baseSize;

  // Modern icon using Font Awesome droplet inside a colored circle
  const html = `
    <div class="water-plant-icon ${isNearest ? 'buzzy' : ''}" style="width:${iconSize}px;height:${iconSize}px;">
      <div class="plant-icon-circle ${isNearest ? 'nearest' : ''}" style="width:${iconSize}px;height:${iconSize}px;">
        <i class="fas fa-tint"></i>
      </div>
      ${isNearest ? '<div class="nearest-banner">CLOSEST</div>' : ''}
    </div>
  `;

  return L.divIcon({
    className: `treatment-plant-marker ${isNearest ? 'nearest-plant' : ''}`,
    html,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2]
  });
};

// Simple County Layer Component
const CountyLayer: React.FC<{
  counties: County[];
  countyBoundaries: any;
  selectedCounty: County | null;
  onCountySelect: (county: County | null) => void;
  showPopulation: boolean;
  showWaterQuality: boolean;
}> = ({ counties, countyBoundaries, selectedCounty, onCountySelect, showPopulation, showWaterQuality }) => {
  if (!countyBoundaries || !counties) {
    return null;
  }

  const countyLookup = useMemo(() => {
    const map = new Map<string, County>();
    counties.forEach(county => {
      map.set(county.county_name.toLowerCase().trim(), county);
    });
    return map;
  }, [counties]);

  const getTooltipContent = (county: County): string => {
    if (showPopulation) {
      return `<div style="font-weight: bold; margin-bottom: 4px;">${county.county_name} County</div>
              <div>Population: ${county.total_population.toLocaleString()}</div>`;
    } else if (showWaterQuality) {
      return `<div style="font-weight: bold; margin-bottom: 4px;">${county.county_name} County</div>
              <div>Lead: ${county.lead_avg_ug_per_L.toFixed(2)} μg/L</div>
              <div>Arsenic: ${county.arsenic_avg_ug_per_L.toFixed(2)} μg/L</div>
              <div>Nitrate: ${county.nitrate_avg_mg_per_L.toFixed(2)} mg/L</div>`;
    } else {
      return `<div style="font-weight: bold;">${county.county_name} County</div>`;
    }
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const countyNameFromGeoJSON = feature.properties?.NAME || feature.properties?.name || feature.properties?.county_name;
    // Remove "County" suffix if present and normalize
    const normalizedGeoJSONName = countyNameFromGeoJSON?.replace(/\s+County$/i, '').toLowerCase().trim();
    const county = normalizedGeoJSONName ? countyLookup.get(normalizedGeoJSONName) : undefined;
    
    if (county) {
      // Add click event with zoom functionality
      layer.on('click', (e) => {
        e.originalEvent.stopPropagation();
        
        // Get county coordinates and zoom to it
        const countyCoords = COUNTY_COORDINATES[county.county_name];
        if (countyCoords) {
          const map = e.target._map;
          map.setView([countyCoords.lat, countyCoords.lng], 9); // Same zoom level as other features
        }
        
        // Select the county for info display
        onCountySelect(county);
      });
      
      // Add tooltip with appropriate content
      layer.bindTooltip(getTooltipContent(county), {
        permanent: false,
        direction: 'center',
        className: 'county-tooltip'
      });
    }
  };

  const getStyle = (feature: any) => {
    const countyNameFromGeoJSON = feature.properties?.NAME || feature.properties?.name || feature.properties?.county_name;
    // Remove "County" suffix if present and normalize
    const normalizedGeoJSONName = countyNameFromGeoJSON?.replace(/\s+County$/i, '').toLowerCase().trim();
    const county = normalizedGeoJSONName ? countyLookup.get(normalizedGeoJSONName) : undefined;
    
    if (county) {
      // Show choropleth styling only if one of the data layers is enabled
      if (showPopulation || showWaterQuality) {
      return MapService.createCountyStyle(county, {
        showPopulation,
        showWaterQuality,
        contaminant: 'lead'
      });
      } else {
        // Default county boundary style - just borders with tooltips
        return {
          fillColor: 'transparent',
          weight: 2,
          opacity: 1,
          color: '#666',
          dashArray: '',
          fillOpacity: 0
        };
      }
    }
    
    // Show counties with a neutral border style even if no data match
    return {
      fillColor: 'transparent',
      weight: 1,
      opacity: 1,
      color: '#999',
      dashArray: '3',
      fillOpacity: 0
    };
  };

  return (
    <GeoJSON
      key={`county-layer-${counties.length}-${showPopulation}-${showWaterQuality}`}
      data={countyBoundaries}
      style={getStyle}
      onEachFeature={onEachFeature}
    />
  );
};

// Info Marker Component for searched county
const InfoMarker: React.FC<{
  county: County;
  coordinates: { lat: number; lng: number };
  onCountySelect: (county: County) => void;
}> = ({ county, coordinates, onCountySelect }) => {
  return (
    <Marker
      position={[coordinates.lat, coordinates.lng]}
      icon={createInfoIcon()}
      eventHandlers={{
        click: () => {
          onCountySelect(county);
        }
      }}
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>{county.county_name} County</strong>
          <br />
          <small>Click for detailed analysis</small>
        </div>
      </Popup>
    </Marker>
  );
};

// Address Marker Component for user-searched addresses
const AddressMarker: React.FC<{
  coordinates: { lat: number; lng: number };
  address?: string;
}> = ({ coordinates, address }) => {
  return (
    <Marker
      position={[coordinates.lat, coordinates.lng]}
      icon={createAddressIcon()}
    >
      {address && (
        <Popup>
          <div style={{ textAlign: 'center' }}>
            <strong>📍 Your Location</strong>
            <br />
            <small>{address}</small>
          </div>
        </Popup>
      )}
    </Marker>
  );
};

// Enhanced Treatment Plant Layer Component with Distance Filtering
const TreatmentPlantLayer: React.FC<{
  treatmentPlants: TreatmentPlant[];
  selectedCounty: County | null;
  searchLocation: { lat: number; lng: number; zoom: number; address?: string; type?: string } | null;
  plantDistance: number;
}> = ({ treatmentPlants, selectedCounty, searchLocation, plantDistance }) => {
  const map = useMap();

  useEffect(() => {
    if (!treatmentPlants) return;

    const markers: L.Marker[] = [];

    // If user has searched an address, filter plants by distance
    let plantsToShow = treatmentPlants;
    let nearestPlant: (TreatmentPlant & { distance: number }) | null = null;

    if (searchLocation && searchLocation.type === 'address') {
      const plantsWithDistance = DistanceService.findPlantsWithinRadius(
        searchLocation.lat,
        searchLocation.lng,
        treatmentPlants,
        plantDistance
      );
      
      plantsToShow = plantsWithDistance;
      nearestPlant = plantsWithDistance.length > 0 ? plantsWithDistance[0] : null;
    }

         plantsToShow.forEach(plant => {
       const isNearest = Boolean(nearestPlant && 
         plant.latitude === nearestPlant.latitude && 
         plant.longitude === nearestPlant.longitude);
      
      const plantWithDistance = plant as TreatmentPlant & { distance?: number };

      const marker = L.marker([plant.latitude, plant.longitude], {
        icon: createTreatmentPlantIcon(isNearest),
        zIndexOffset: isNearest ? 1000 : 0
      });

             // Enhanced popup content
       const popupContent = `
         <div style="min-width: 230px;">
           <img src="https://picsum.photos/seed/plant${plant.facility_id}/230/120" alt="Plant" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 6px; object-fit: cover;" />
           ${isNearest ? `
             <div style="margin-bottom: 8px; padding: 6px; background-color: #fff3cd; border-radius: 4px; border: 1px solid #ffeaa7;">
               <strong style="color: #856404;">
                 <i class="fas fa-star" style="margin-right: 4px;"></i>
                 Nearest Treatment Plant
               </strong>
             </div>
           ` : ''}
           <h6 style="margin-bottom: 6px;">${plant.facility_name}</h6>
           <div style="margin-bottom: 4px;"><strong>ID:</strong> ${plant.facility_id}</div>
           <div style="margin-bottom: 4px;"><strong>County:</strong> ${plant.county}</div>
           <div style="margin-bottom: 4px;"><strong>Public Access:</strong> ${plant.public_access}</div>
           ${plant.capacity_mgd ? `<div style="margin-bottom: 4px;"><strong>Capacity:</strong> ${plant.capacity_mgd} MGD</div>` : ''}
           ${plantWithDistance.distance !== undefined ? `
             <div style="margin-top: 8px; padding: 6px; background-color: #e8f4fd; border-radius: 4px;">
               <strong style="color: #007bff;">
                 <i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>
                 ${DistanceService.formatDistance(plantWithDistance.distance)} away
               </strong>
             </div>
           ` : ''}
         </div>
       `;

      marker.bindPopup(popupContent);
      marker.bindTooltip(plant.facility_name, { direction: 'top' });
      
      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [treatmentPlants, map, searchLocation, plantDistance]);

  return null;
};

// Map updater component for search functionality
const MapUpdater: React.FC<{
  searchLocation: { lat: number; lng: number; zoom: number; address?: string; type?: string } | null;
}> = ({ searchLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (map && searchLocation) {
      map.setView([searchLocation.lat, searchLocation.lng], searchLocation.zoom);
    }
  }, [map, searchLocation]);

  return null;
};

const MapContainer: React.FC<MapContainerProps> = ({
  counties,
  countyBoundaries,
  treatmentPlants,
  selectedCounty,
  onCountySelect,
  filters,
  searchLocation
}) => {
  // Filter counties based on water quality filters - ONLY when water quality layer is active
  const getFilteredCounties = (): County[] => {
    if (!counties) return [];
    
    // Only apply water quality filters when water quality layer is shown
    if (!filters.showWaterQuality) {
      return counties; // Return all counties for population layer or boundary display
    }
    
    let filtered = [...counties];
    
    if (filters.maxLead !== null) {
      filtered = filtered.filter(county => county.lead_avg_ug_per_L <= filters.maxLead!);
    }
    
    if (filters.maxArsenic !== null) {
      filtered = filtered.filter(county => county.arsenic_avg_ug_per_L <= filters.maxArsenic!);
    }
    
    if (filters.maxNitrate !== null) {
      filtered = filtered.filter(county => county.nitrate_avg_mg_per_L <= filters.maxNitrate!);
    }
    
    return filtered;
  };

  // Filter treatment plants based on filters
  const getFilteredTreatmentPlants = (): TreatmentPlant[] => {
    if (!treatmentPlants || !filters.showTreatmentPlants) return [];
    
    return treatmentPlants;
  };

  const filteredCounties = getFilteredCounties();
  const filteredTreatmentPlants = getFilteredTreatmentPlants();

  // Get county from search location for info marker
  const getSearchedCounty = (): County | null => {
    // Only show info marker when there's an actual county search (not initial state or address search)
    if (!searchLocation || !searchLocation.type || searchLocation.type === 'address' || !counties) {
      return null;
    }
    
    // Only for county searches, not random searches
    if (searchLocation.type !== 'county') {
      return null;
    }
    
    // Find closest county to search location
    let closestCounty = null;
    let minDistance = Infinity;

    counties.forEach(county => {
      const coords = COUNTY_COORDINATES[county.county_name];
      if (coords) {
        const distance = Math.sqrt(
          Math.pow(coords.lat - searchLocation.lat, 2) + 
          Math.pow(coords.lng - searchLocation.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestCounty = county;
        }
      }
    });

    return closestCounty;
  };

  const searchedCounty = getSearchedCounty();

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <LeafletMapContainer
        center={MapService.DEFAULT_CENTER}
        zoom={MapService.DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        preferCanvas
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* County boundaries - always visible, with choropleth styling only when data layers are enabled */}
        {countyBoundaries && counties && counties.length > 0 && (
          <CountyLayer
            counties={filteredCounties}
            countyBoundaries={countyBoundaries}
            selectedCounty={selectedCounty}
            onCountySelect={onCountySelect}
            showPopulation={filters.showPopulation}
            showWaterQuality={filters.showWaterQuality}
          />
        )}

        {/* Info marker for searched county */}
        {searchedCounty && searchLocation && searchLocation.type === 'county' && (
          <InfoMarker
            county={searchedCounty}
            coordinates={{ lat: searchLocation.lat, lng: searchLocation.lng }}
            onCountySelect={onCountySelect}
          />
        )}

        {/* Address marker for user locations */}
        {searchLocation && searchLocation.type === 'address' && (
          <AddressMarker
            coordinates={{ lat: searchLocation.lat, lng: searchLocation.lng }}
            address={searchLocation.address}
          />
        )}

        {/* Treatment plants */}
        {filters.showTreatmentPlants && (
          <TreatmentPlantLayer
            treatmentPlants={filteredTreatmentPlants}
            selectedCounty={selectedCounty}
            searchLocation={searchLocation}
            plantDistance={filters.plantDistance}
          />
        )}

        {/* Map updater for search functionality */}
        <MapUpdater searchLocation={searchLocation} />
      </LeafletMapContainer>

      {/* Map legend */}
      <MapLegend
        showPopulation={filters.showPopulation}
        showWaterQuality={filters.showWaterQuality}
        showTreatmentPlants={filters.showTreatmentPlants}
        contaminant={filters.showWaterQuality ? 'lead' : undefined}
      />
    </div>
  );
};

export default MapContainer; 
