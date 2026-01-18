import React from 'react';
import { Card } from 'react-bootstrap';

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
  contaminant
}) => {
  if (!showPopulation && !showWaterQuality && !showTreatmentPlants) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <Card className="map-legend">
        <Card.Body style={{ padding: '10px' }}>
          <h6 className="mb-2">Legend</h6>
          
          {showPopulation && (
            <div className="mb-2">
              <strong>Population</strong>
              <div className="d-flex align-items-center mt-1">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#8B0000', marginRight: '4px' }}></div>
                <small>&gt;1M</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#DC143C', marginRight: '4px' }}></div>
                <small>&gt;500K</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#FF6347', marginRight: '4px' }}></div>
                <small>&gt;200K</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#FFFF00', marginRight: '4px' }}></div>
                <small>&lt;50K</small>
              </div>
            </div>
          )}

          {showWaterQuality && contaminant && (
            <div className="mb-2">
              <strong>{contaminant.charAt(0).toUpperCase() + contaminant.slice(1)} Levels</strong>
              <div className="d-flex align-items-center mt-1">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#28a745', marginRight: '4px' }}></div>
                <small>Good</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ffc107', marginRight: '4px' }}></div>
                <small>Moderate</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '12px', height: '12px', backgroundColor: '#dc3545', marginRight: '4px' }}></div>
                <small>Poor</small>
              </div>
            </div>
          )}

          {showTreatmentPlants && (
            <div>
              <strong>Treatment Plants</strong>
              <div className="d-flex align-items-center mt-1">
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#007bff', 
                  borderRadius: '50%',
                  marginRight: '4px' 
                }}></div>
                <small>Public Access</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#6c757d', 
                  borderRadius: '50%',
                  marginRight: '4px' 
                }}></div>
                <small>Private</small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MapLegend; 