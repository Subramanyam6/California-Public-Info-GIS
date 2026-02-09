import React from 'react';

interface MapLegendProps {
  showPopulation: boolean;
  showWaterQuality: boolean;
  showTreatmentPlants: boolean;
  contaminant?: 'lead' | 'arsenic' | 'nitrate';
}

const MapLegend: React.FC<MapLegendProps> = ({
  showPopulation,
  showWaterQuality,
  showTreatmentPlants,
  contaminant,
}) => {
  if (!showPopulation && !showWaterQuality && !showTreatmentPlants) {
    return null;
  }

  return (
    <div className="geo-legend-panel">
      <div className="geo-legend-head">
        <span>Signal Index</span>
      </div>

      {showPopulation && (
        <section className="geo-legend-group">
          <h6>Population Bands</h6>
          <div className="geo-legend-item">
            <span className="swatch population-1"></span>
            <small>&gt; 1M</small>
          </div>
          <div className="geo-legend-item">
            <span className="swatch population-2"></span>
            <small>&gt; 500K</small>
          </div>
          <div className="geo-legend-item">
            <span className="swatch population-3"></span>
            <small>&gt; 200K</small>
          </div>
          <div className="geo-legend-item">
            <span className="swatch population-4"></span>
            <small>&lt; 50K</small>
          </div>
        </section>
      )}

      {showWaterQuality && contaminant && (
        <section className="geo-legend-group">
          <h6>{contaminant.toUpperCase()} Risk</h6>
          <div className="geo-legend-item">
            <span className="swatch quality-good"></span>
            <small>Low</small>
          </div>
          <div className="geo-legend-item">
            <span className="swatch quality-moderate"></span>
            <small>Moderate</small>
          </div>
          <div className="geo-legend-item">
            <span className="swatch quality-poor"></span>
            <small>High</small>
          </div>
        </section>
      )}

      {showTreatmentPlants && (
        <section className="geo-legend-group geo-legend-group-last">
          <h6>Treatment Assets</h6>
          <div className="geo-legend-item">
            <span className="swatch swatch-plant"></span>
            <small>Facility node</small>
          </div>
          <div className="geo-legend-item">
            <span className="swatch swatch-nearest"></span>
            <small>Nearest facility</small>
          </div>
        </section>
      )}
    </div>
  );
};

export default MapLegend;
