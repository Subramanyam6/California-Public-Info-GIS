import React from 'react';
import { Modal, Button, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { County } from '../../services/api';

interface DataPanelProps {
  county: County;
  onClose: () => void;
}

const DataPanel: React.FC<DataPanelProps> = ({ county, onClose }) => {
  const getContaminantLevel = (value: number, contaminant: 'lead' | 'arsenic' | 'nitrate'): {
    level: 'good' | 'moderate' | 'poor';
    color: string;
    percentage: number;
  } => {
    const thresholds = {
      lead: { good: 5, moderate: 15, max: 30 },
      arsenic: { good: 5, moderate: 10, max: 20 },
      nitrate: { good: 5, moderate: 10, max: 20 }
    };

    const threshold = thresholds[contaminant];
    const percentage = Math.min((value / threshold.max) * 100, 100);

    if (value <= threshold.good) {
      return { level: 'good', color: 'success', percentage };
    } else if (value <= threshold.moderate) {
      return { level: 'moderate', color: 'warning', percentage };
    } else {
      return { level: 'poor', color: 'danger', percentage };
    }
  };

  const leadInfo = getContaminantLevel(county.lead_avg_ug_per_L, 'lead');
  const arsenicInfo = getContaminantLevel(county.arsenic_avg_ug_per_L, 'arsenic');
  const nitrateInfo = getContaminantLevel(county.nitrate_avg_mg_per_L, 'nitrate');

  const formatPopulation = (population: number): string => {
    if (population >= 1000000) {
      return (population / 1000000).toFixed(1) + ' Million';
    } else if (population >= 1000) {
      return (population / 1000).toFixed(0) + 'K';
    }
    return population.toString();
  };

  const getPopulationRank = (population: number): string => {
    if (population > 3000000) return 'Very High';
    if (population > 1000000) return 'High';
    if (population > 500000) return 'Medium';
    if (population > 100000) return 'Low';
    return 'Very Low';
  };

  const getHealthRecommendation = (contaminant: 'lead' | 'arsenic' | 'nitrate', level: 'good' | 'moderate' | 'poor'): string => {
    const recommendations = {
      lead: {
        good: 'Lead levels are within safe limits.',
        moderate: 'Consider water filtration and regular testing.',
        poor: 'High lead levels detected. Use filtered water for drinking and cooking.'
      },
      arsenic: {
        good: 'Arsenic levels are within safe limits.',
        moderate: 'Monitor arsenic levels and consider filtration.',
        poor: 'High arsenic levels. Use alternative water sources for drinking.'
      },
      nitrate: {
        good: 'Nitrate levels are within safe limits.',
        moderate: 'Elevated nitrate levels. Monitor water sources.',
        poor: 'High nitrate levels. Especially dangerous for infants and pregnant women.'
      }
    };

    return recommendations[contaminant][level];
  };

  return (
    <Modal show={true} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{county.county_name} County - Detailed Analysis</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          {/* Population Overview */}
          <Col md={4} className="mb-3">
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">Population Overview</h6>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h3 className="text-primary">{formatPopulation(county.total_population)}</h3>
                  <Badge bg="info">{getPopulationRank(county.total_population)} Density</Badge>
                </div>
                <hr />
                <small className="text-muted">
                  Total Population: {county.total_population.toLocaleString()}
                </small>
              </Card.Body>
            </Card>
          </Col>

          {/* Water Quality Summary */}
          <Col md={8} className="mb-3">
            <Card className="h-100">
              <Card.Header>
                <h6 className="mb-0">Water Quality Assessment</h6>
              </Card.Header>
              <Card.Body>
                {/* Lead */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold">Lead (Pb)</span>
                    <span>{county.lead_avg_ug_per_L.toFixed(2)} μg/L</span>
                  </div>
                  <ProgressBar 
                    variant={leadInfo.color} 
                    now={leadInfo.percentage} 
                    className="mb-1"
                    style={{ height: '8px' }}
                  />
                  <small className="text-muted">
                    {getHealthRecommendation('lead', leadInfo.level)}
                  </small>
                </div>

                {/* Arsenic */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold">Arsenic (As)</span>
                    <span>{county.arsenic_avg_ug_per_L.toFixed(2)} μg/L</span>
                  </div>
                  <ProgressBar 
                    variant={arsenicInfo.color} 
                    now={arsenicInfo.percentage} 
                    className="mb-1"
                    style={{ height: '8px' }}
                  />
                  <small className="text-muted">
                    {getHealthRecommendation('arsenic', arsenicInfo.level)}
                  </small>
                </div>

                {/* Nitrate */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold">Nitrate (NO₃)</span>
                    <span>{county.nitrate_avg_mg_per_L.toFixed(2)} mg/L</span>
                  </div>
                  <ProgressBar 
                    variant={nitrateInfo.color} 
                    now={nitrateInfo.percentage} 
                    className="mb-1"
                    style={{ height: '8px' }}
                  />
                  <small className="text-muted">
                    {getHealthRecommendation('nitrate', nitrateInfo.level)}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Health Advisory */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h6 className="mb-0">Health Advisory & Recommendations</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Overall Water Quality Status</h6>
                    <div className="d-flex gap-2 mb-3">
                      <Badge bg={leadInfo.color}>Lead: {leadInfo.level}</Badge>
                      <Badge bg={arsenicInfo.color}>Arsenic: {arsenicInfo.level}</Badge>
                      <Badge bg={nitrateInfo.color}>Nitrate: {nitrateInfo.level}</Badge>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6>General Recommendations</h6>
                    <ul className="small">
                      <li>Regular water testing recommended</li>
                      <li>Consider point-of-use filtration systems</li>
                      <li>Monitor local water quality reports</li>
                      <li>Consult healthcare providers for specific concerns</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DataPanel; 