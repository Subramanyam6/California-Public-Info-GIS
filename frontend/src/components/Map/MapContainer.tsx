import React, { useEffect, useMemo } from 'react';
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  useMap,
  GeoJSON,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
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
  searchLocation: {
    lat: number;
    lng: number;
    zoom: number;
    address?: string;
    type?: string;
  } | null;
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

const createCountyMarkerIcon = () =>
  L.divIcon({
    className: 'county-command-marker',
    html: '<div class="command-marker command-marker-county"><i class="fas fa-chart-line"></i></div>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const createAddressIcon = () =>
  L.divIcon({
    className: 'address-command-marker',
    html: `
      <div class="command-marker command-marker-address">
        <span class="ring ring-a"></span>
        <span class="ring ring-b"></span>
        <span class="core"></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createTreatmentIcon = (isNearest = false) => {
  const size = isNearest ? 36 : 30;

  return L.divIcon({
    className: `plant-command-marker ${isNearest ? 'is-nearest' : ''}`,
    html: `
      <div class="command-marker command-marker-plant ${isNearest ? 'nearest' : ''}">
        <i class="fas fa-industry"></i>
        ${isNearest ? '<span class="nearest-tag">Nearest</span>' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const CountyLayer: React.FC<{
  counties: County[];
  countyBoundaries: any;
  selectedCounty: County | null;
  onCountySelect: (county: County | null) => void;
  showPopulation: boolean;
  showWaterQuality: boolean;
}> = ({
  counties,
  countyBoundaries,
  selectedCounty,
  onCountySelect,
  showPopulation,
  showWaterQuality,
}) => {
  const countyLookup = useMemo(() => {
    const map = new Map<string, County>();
    counties.forEach((county) => {
      map.set(county.county_name.toLowerCase().trim(), county);
    });
    return map;
  }, [counties]);

  if (!countyBoundaries || counties.length === 0) {
    return null;
  }

  const getTooltipContent = (county: County): string => {
    if (showPopulation) {
      return `
        <div class="county-hover-card">
          <strong>${county.county_name} County</strong>
          <span>Population ${county.total_population.toLocaleString()}</span>
        </div>
      `;
    }

    if (showWaterQuality) {
      return `
        <div class="county-hover-card">
          <strong>${county.county_name} County</strong>
          <span>Lead ${county.lead_avg_ug_per_L.toFixed(2)} μg/L</span>
          <span>Arsenic ${county.arsenic_avg_ug_per_L.toFixed(2)} μg/L</span>
          <span>Nitrate ${county.nitrate_avg_mg_per_L.toFixed(2)} mg/L</span>
        </div>
      `;
    }

    return `<div class="county-hover-card"><strong>${county.county_name} County</strong></div>`;
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const countyNameFromGeoJSON =
      feature.properties?.NAME ||
      feature.properties?.name ||
      feature.properties?.county_name;

    const normalizedGeoJSONName = countyNameFromGeoJSON
      ?.replace(/\s+County$/i, '')
      .toLowerCase()
      .trim();

    const county = normalizedGeoJSONName
      ? countyLookup.get(normalizedGeoJSONName)
      : undefined;

    if (!county) {
      return;
    }

    layer.on('click', (event: any) => {
      event.originalEvent.stopPropagation();

      const countyCoords = COUNTY_COORDINATES[county.county_name];
      if (countyCoords) {
        const map = event.target._map;
        map.setView([countyCoords.lat, countyCoords.lng], 9);
      }

      onCountySelect(county);
    });

    layer.on('mouseover', () => {
      if (layer instanceof L.Path) {
        layer.setStyle({ weight: 3.2 });
      }
    });

    layer.on('mouseout', () => {
      if (layer instanceof L.Path) {
        layer.setStyle({
          weight: selectedCounty?.county_name === county.county_name ? 3.2 : 2,
        });
      }
    });

    layer.bindTooltip(getTooltipContent(county), {
      permanent: false,
      direction: 'center',
      className: 'county-hover-tooltip',
    });
  };

  const getStyle = (feature: any) => {
    const countyNameFromGeoJSON =
      feature.properties?.NAME ||
      feature.properties?.name ||
      feature.properties?.county_name;

    const normalizedGeoJSONName = countyNameFromGeoJSON
      ?.replace(/\s+County$/i, '')
      .toLowerCase()
      .trim();

    const county = normalizedGeoJSONName
      ? countyLookup.get(normalizedGeoJSONName)
      : undefined;

    if (!county) {
      return {
        fillColor: 'transparent',
        weight: 1,
        opacity: 0.8,
        color: '#8ea2b4',
        dashArray: '3',
        fillOpacity: 0,
      };
    }

    const isSelected = selectedCounty?.county_name === county.county_name;

    if (showPopulation || showWaterQuality) {
      const style = MapService.createCountyStyle(county, {
        showPopulation,
        showWaterQuality,
        contaminant: 'lead',
      });

      return {
        ...style,
        color: isSelected ? '#17456c' : 'rgba(255,255,255,0.86)',
        weight: isSelected ? 3.2 : 2,
      };
    }

    return {
      fillColor: isSelected ? 'rgba(10,132,255,0.2)' : 'transparent',
      weight: isSelected ? 3.2 : 2,
      opacity: 1,
      color: isSelected ? '#23689f' : '#5f7488',
      dashArray: '',
      fillOpacity: isSelected ? 0.45 : 0,
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

const CountyMarker: React.FC<{
  county: County;
  coordinates: { lat: number; lng: number };
  onCountySelect: (county: County) => void;
}> = ({ county, coordinates, onCountySelect }) => (
  <Marker
    position={[coordinates.lat, coordinates.lng]}
    icon={createCountyMarkerIcon()}
    eventHandlers={{
      click: () => onCountySelect(county),
    }}
  >
    <Popup>
      <div className="marker-popup marker-popup-county">
        <strong>{county.county_name} County</strong>
        <small>Open county intelligence panel</small>
      </div>
    </Popup>
  </Marker>
);

const AddressMarker: React.FC<{
  coordinates: { lat: number; lng: number };
  address?: string;
}> = ({ coordinates, address }) => (
  <Marker position={[coordinates.lat, coordinates.lng]} icon={createAddressIcon()}>
    {address && (
      <Popup>
        <div className="marker-popup marker-popup-address">
          <strong>Searched Address</strong>
          <small>{address}</small>
        </div>
      </Popup>
    )}
  </Marker>
);

const TreatmentPlantLayer: React.FC<{
  treatmentPlants: TreatmentPlant[];
  searchLocation: {
    lat: number;
    lng: number;
    zoom: number;
    address?: string;
    type?: string;
  } | null;
  plantDistance: number;
}> = ({ treatmentPlants, searchLocation, plantDistance }) => {
  const map = useMap();

  useEffect(() => {
    if (!treatmentPlants) {
      return;
    }

    const markers: L.Marker[] = [];

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

    plantsToShow.forEach((plant) => {
      const isNearest = Boolean(
        nearestPlant &&
          plant.latitude === nearestPlant.latitude &&
          plant.longitude === nearestPlant.longitude
      );

      const plantWithDistance = plant as TreatmentPlant & { distance?: number };

      const marker = L.marker([plant.latitude, plant.longitude], {
        icon: createTreatmentIcon(isNearest),
        zIndexOffset: isNearest ? 1000 : 0,
      });

      const popupContent = `
        <div class="plant-intel-popup">
          ${
            isNearest
              ? '<div class="plant-intel-pill"><i class="fas fa-bolt"></i>Nearest to searched address</div>'
              : ''
          }
          <h6>${plant.facility_name}</h6>
          <div class="plant-intel-row"><span>ID</span><strong>${plant.facility_id}</strong></div>
          <div class="plant-intel-row"><span>County</span><strong>${plant.county}</strong></div>
          <div class="plant-intel-row"><span>Public Access</span><strong>${plant.public_access}</strong></div>
          ${
            plant.capacity_mgd
              ? `<div class="plant-intel-row"><span>Capacity</span><strong>${plant.capacity_mgd} MGD</strong></div>`
              : ''
          }
          ${
            plantWithDistance.distance !== undefined
              ? `<div class="plant-intel-distance"><i class="fas fa-route"></i>${DistanceService.formatDistance(
                  plantWithDistance.distance
                )} from address</div>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.bindTooltip(plant.facility_name, {
        direction: 'top',
        className: 'plant-hover-tooltip',
      });

      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach((marker) => map.removeLayer(marker));
    };
  }, [treatmentPlants, map, searchLocation, plantDistance]);

  return null;
};

const MapUpdater: React.FC<{
  searchLocation: {
    lat: number;
    lng: number;
    zoom: number;
    address?: string;
    type?: string;
  } | null;
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
  searchLocation,
}) => {
  const filteredCounties = useMemo(() => {
    if (!counties) {
      return [];
    }

    if (!filters.showWaterQuality) {
      return counties;
    }

    return counties.filter((county) => {
      const passLead = filters.maxLead === null || county.lead_avg_ug_per_L <= filters.maxLead;
      const passArsenic =
        filters.maxArsenic === null || county.arsenic_avg_ug_per_L <= filters.maxArsenic;
      const passNitrate =
        filters.maxNitrate === null || county.nitrate_avg_mg_per_L <= filters.maxNitrate;

      return passLead && passArsenic && passNitrate;
    });
  }, [counties, filters.maxLead, filters.maxArsenic, filters.maxNitrate, filters.showWaterQuality]);

  const filteredTreatmentPlants = useMemo(() => {
    if (!treatmentPlants || !filters.showTreatmentPlants) {
      return [];
    }

    return treatmentPlants;
  }, [treatmentPlants, filters.showTreatmentPlants]);

  const searchedCounty = useMemo(() => {
    if (!searchLocation || searchLocation.type !== 'county' || !counties) {
      return null;
    }

    let closestCounty: County | null = null;
    let minDistance = Infinity;

    counties.forEach((county) => {
      const coordinates = COUNTY_COORDINATES[county.county_name];
      if (!coordinates) {
        return;
      }

      const distance = Math.sqrt(
        Math.pow(coordinates.lat - searchLocation.lat, 2) +
          Math.pow(coordinates.lng - searchLocation.lng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestCounty = county;
      }
    });

    return closestCounty;
  }, [counties, searchLocation]);

  return (
    <div className="geo-map-stage">
      <LeafletMapContainer
        center={MapService.DEFAULT_CENTER}
        zoom={MapService.DEFAULT_ZOOM}
        className="geo-map-canvas"
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

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

        {searchedCounty && searchLocation?.type === 'county' && (
          <CountyMarker
            county={searchedCounty}
            coordinates={{ lat: searchLocation.lat, lng: searchLocation.lng }}
            onCountySelect={onCountySelect}
          />
        )}

        {searchLocation?.type === 'address' && (
          <AddressMarker
            coordinates={{ lat: searchLocation.lat, lng: searchLocation.lng }}
            address={searchLocation.address}
          />
        )}

        {filters.showTreatmentPlants && (
          <TreatmentPlantLayer
            treatmentPlants={filteredTreatmentPlants}
            searchLocation={searchLocation}
            plantDistance={filters.plantDistance}
          />
        )}

        <MapUpdater searchLocation={searchLocation} />
      </LeafletMapContainer>

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
