import L from 'leaflet';
import { County, TreatmentPlant } from './api';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export class MapService {
  // California bounds
  static readonly CALIFORNIA_BOUNDS: L.LatLngBoundsExpression = [
    [32.5, -124.4], // Southwest
    [42.0, -114.1]  // Northeast
  ];

  static readonly DEFAULT_CENTER: L.LatLngExpression = [37.0, -119.4];
  static readonly DEFAULT_ZOOM = 6;

  // Color schemes for water quality indicators
  static getWaterQualityColor(level: number, contaminant: 'lead' | 'arsenic' | 'nitrate'): string {
    const thresholds = {
      lead: { good: 5, moderate: 15 },      // μg/L
      arsenic: { good: 5, moderate: 10 },   // μg/L  
      nitrate: { good: 5, moderate: 10 }    // mg/L
    };

    const threshold = thresholds[contaminant];
    
    if (level <= threshold.good) return '#28a745'; // Green
    if (level <= threshold.moderate) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  }

  static getPopulationColor(population: number): string {
    if (population > 1000000) return '#8B0000'; // Dark red
    if (population > 500000) return '#DC143C';  // Crimson
    if (population > 200000) return '#FF6347';  // Tomato
    if (population > 100000) return '#FFA500';  // Orange
    if (population > 50000) return '#FFD700';   // Gold
    return '#FFFF00'; // Yellow
  }

  static createCountyStyle(county: County, options: {
    showPopulation?: boolean;
    showWaterQuality?: boolean;
    contaminant?: 'lead' | 'arsenic' | 'nitrate';
  } = {}): L.PathOptions {
    const { showPopulation = true, showWaterQuality = false, contaminant = 'lead' } = options;

    let fillColor = '#007bff'; // Default blue

    if (showWaterQuality && contaminant) {
      const contaminantValues = {
        lead: county.lead_avg_ug_per_L,
        arsenic: county.arsenic_avg_ug_per_L,
        nitrate: county.nitrate_avg_mg_per_L
      };
      fillColor = this.getWaterQualityColor(contaminantValues[contaminant], contaminant);
    } else if (showPopulation) {
      fillColor = this.getPopulationColor(county.total_population);
    }

    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  static createTreatmentPlantIcon(plant: TreatmentPlant): L.DivIcon {
    const isPublic = plant.public_access?.toLowerCase() === 'yes';
    
    return L.divIcon({
      className: 'treatment-plant-marker',
      html: `<div style="
        background: linear-gradient(135deg, ${isPublic ? '#00a8ff' : '#6c757d'}, ${isPublic ? '#0078d4' : '#495057'});
        border: 2px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <i class="material-icons" style="font-size: 16px;">water_drop</i>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  static formatCountyPopup(county: County): string {
    return `
      <div class="county-popup">
        <h6>${county.county_name} County</h6>
        <div class="metric">
          <span class="metric-label">Population:</span>
          <span class="metric-value">${county.total_population.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Lead:</span>
          <span class="metric-value">${county.lead_avg_ug_per_L.toFixed(2)} μg/L</span>
        </div>
        <div class="metric">
          <span class="metric-label">Arsenic:</span>
          <span class="metric-value">${county.arsenic_avg_ug_per_L.toFixed(2)} μg/L</span>
        </div>
        <div class="metric">
          <span class="metric-label">Nitrate:</span>
          <span class="metric-value">${county.nitrate_avg_mg_per_L.toFixed(2)} mg/L</span>
        </div>
      </div>
    `;
  }

  static formatTreatmentPlantPopup(plant: TreatmentPlant): string {
    return `
      <div class="treatment-plant-popup">
        <h6>${plant.facility_name}</h6>
        <div class="metric">
          <span class="metric-label">County:</span>
          <span class="metric-value">${plant.county}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Public Access:</span>
          <span class="metric-value">${plant.public_access}</span>
        </div>
        ${plant.capacity_mgd ? `
        <div class="metric">
          <span class="metric-label">Capacity:</span>
          <span class="metric-value">${plant.capacity_mgd} MGD</span>
        </div>
        ` : ''}
        <div class="metric">
          <span class="metric-label">Coordinates:</span>
          <span class="metric-value">${plant.latitude.toFixed(4)}, ${plant.longitude.toFixed(4)}</span>
        </div>
      </div>
    `;
  }

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static filterByBounds(
    items: { latitude: number; longitude: number }[],
    bounds: L.LatLngBounds
  ): typeof items {
    return items.filter(item => bounds.contains([item.latitude, item.longitude]));
  }

  static createLegendControl(options: {
    showPopulation: boolean;
    showWaterQuality: boolean;
    contaminant?: 'lead' | 'arsenic' | 'nitrate';
  }): L.Control {
    const control = new L.Control({ position: 'bottomright' });
    
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend');
      
      if (options.showWaterQuality && options.contaminant) {
        div.innerHTML = `
          <div><strong>${options.contaminant.charAt(0).toUpperCase() + options.contaminant.slice(1)} Levels</strong></div>
          <div><span style="background: #28a745; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> Good</div>
          <div><span style="background: #ffc107; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> Moderate</div>
          <div><span style="background: #dc3545; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> Poor</div>
        `;
      } else if (options.showPopulation) {
        div.innerHTML = `
          <div><strong>Population</strong></div>
          <div><span style="background: #8B0000; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> >1M</div>
          <div><span style="background: #DC143C; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> >500K</div>
          <div><span style="background: #FF6347; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> >200K</div>
          <div><span style="background: #FFA500; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> >100K</div>
          <div><span style="background: #FFD700; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> >50K</div>
          <div><span style="background: #FFFF00; width: 12px; height: 12px; display: inline-block; margin-right: 4px;"></span> <50K</div>
        `;
      }
      
      return div;
    };
    
    return control;
  }
}

export default MapService; 