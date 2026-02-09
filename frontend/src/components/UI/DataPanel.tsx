import React from 'react';
import { Modal, Button, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { County } from '../../services/api';

interface DataPanelProps {
  county: County;
  onClose: () => void;
}

type Level = 'good' | 'moderate' | 'poor';

const DataPanel: React.FC<DataPanelProps> = ({ county, onClose }) => {
  const classify = (
    value: number,
    contaminant: 'lead' | 'arsenic' | 'nitrate'
  ): { level: Level; color: 'success' | 'warning' | 'danger'; score: number } => {
    const thresholds = {
      lead: { good: 5, moderate: 15, max: 30 },
      arsenic: { good: 5, moderate: 10, max: 20 },
      nitrate: { good: 5, moderate: 10, max: 20 },
    };

    const rules = thresholds[contaminant];
    const score = Math.min((value / rules.max) * 100, 100);

    if (value <= rules.good) {
      return { level: 'good', color: 'success', score };
    }

    if (value <= rules.moderate) {
      return { level: 'moderate', color: 'warning', score };
    }

    return { level: 'poor', color: 'danger', score };
  };

  const lead = classify(county.lead_avg_ug_per_L, 'lead');
  const arsenic = classify(county.arsenic_avg_ug_per_L, 'arsenic');
  const nitrate = classify(county.nitrate_avg_mg_per_L, 'nitrate');

  const levelOrder: Record<Level, number> = {
    good: 0,
    moderate: 1,
    poor: 2,
  };

  const overall = [lead.level, arsenic.level, nitrate.level].reduce((current, next) =>
    levelOrder[next] > levelOrder[current] ? next : current
  );

  const overallTone: Record<Level, 'success' | 'warning' | 'danger'> = {
    good: 'success',
    moderate: 'warning',
    poor: 'danger',
  };

  return (
    <Modal show={true} onHide={onClose} size="xl" centered className="county-intel-modal">
      <Modal.Header closeButton className="intel-header">
        <div className="intel-title-wrap">
          <Modal.Title>{county.county_name} County Intelligence</Modal.Title>
          <small>Operational contaminant profile and response guidance</small>
        </div>
        <Badge bg={overallTone[overall]} className="overall-status-badge">
          Overall {overall}
        </Badge>
      </Modal.Header>

      <Modal.Body className="intel-body">
        <Row className="g-3">
          <Col lg={3} md={6}>
            <Card className="intel-stat-card h-100">
              <Card.Body>
                <span>Population</span>
                <strong>{county.total_population.toLocaleString()}</strong>
                <small>Residents served</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="intel-stat-card h-100">
              <Card.Body>
                <span>Lead (Pb)</span>
                <strong>{county.lead_avg_ug_per_L.toFixed(2)} μg/L</strong>
                <small>EPA threshold watch</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="intel-stat-card h-100">
              <Card.Body>
                <span>Arsenic (As)</span>
                <strong>{county.arsenic_avg_ug_per_L.toFixed(2)} μg/L</strong>
                <small>Geo-source sensitivity</small>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="intel-stat-card h-100">
              <Card.Body>
                <span>Nitrate (NO₃)</span>
                <strong>{county.nitrate_avg_mg_per_L.toFixed(2)} mg/L</strong>
                <small>Agricultural impact</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col lg={8}>
            <Card className="intel-main-card">
              <Card.Header>
                <h6 className="mb-0">Contaminant Severity Matrix</h6>
              </Card.Header>
              <Card.Body>
                <div className="intel-meter-row">
                  <div className="intel-meter-head">
                    <span>Lead (Pb)</span>
                    <strong>{county.lead_avg_ug_per_L.toFixed(2)} μg/L</strong>
                  </div>
                  <ProgressBar now={lead.score} variant={lead.color} className="intel-progress" />
                  <small>Safe &lt; 5 | Moderate 5-15 | High &gt; 15</small>
                </div>

                <div className="intel-meter-row">
                  <div className="intel-meter-head">
                    <span>Arsenic (As)</span>
                    <strong>{county.arsenic_avg_ug_per_L.toFixed(2)} μg/L</strong>
                  </div>
                  <ProgressBar now={arsenic.score} variant={arsenic.color} className="intel-progress" />
                  <small>Safe &lt; 5 | Moderate 5-10 | High &gt; 10</small>
                </div>

                <div className="intel-meter-row mb-0">
                  <div className="intel-meter-head">
                    <span>Nitrate (NO₃)</span>
                    <strong>{county.nitrate_avg_mg_per_L.toFixed(2)} mg/L</strong>
                  </div>
                  <ProgressBar now={nitrate.score} variant={nitrate.color} className="intel-progress" />
                  <small>Safe &lt; 5 | Moderate 5-10 | High &gt; 10</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="intel-main-card h-100">
              <Card.Header>
                <h6 className="mb-0">Recommended Actions</h6>
              </Card.Header>
              <Card.Body>
                <div className="intel-action-badges">
                  <Badge bg={lead.color}>Lead: {lead.level}</Badge>
                  <Badge bg={arsenic.color}>Arsenic: {arsenic.level}</Badge>
                  <Badge bg={nitrate.color}>Nitrate: {nitrate.level}</Badge>
                </div>
                <ul className="intel-actions-list">
                  <li>Increase local sampling frequency for high-risk zones.</li>
                  <li>Prioritize treatment-plant outreach in vulnerable areas.</li>
                  <li>Issue public advisories for sensitive households when needed.</li>
                  <li>Coordinate with county health departments for mitigation campaigns.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="intel-footer">
        <Button variant="secondary" className="intel-close-btn" onClick={onClose}>
          Close Intelligence Panel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DataPanel;
