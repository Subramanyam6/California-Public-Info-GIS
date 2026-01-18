import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './AboutButton.css';

const AboutButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  useEffect(() => {
    // Check if user has clicked about button in this session
    const clickedInSession = sessionStorage.getItem('aboutButtonClicked');
    if (clickedInSession) {
      setHasBeenClicked(true);
    }
  }, []);

  const handleButtonClick = () => {
    setShowModal(true);
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      sessionStorage.setItem('aboutButtonClicked', 'true');
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const openLicense = () => {
    const licenseWindow = window.open('', '_blank');
    if (licenseWindow) {
      licenseWindow.document.write(`
        <html>
          <head>
            <title>MIT License</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <h1>MIT License</h1>
            <pre>
MIT License

Copyright (c) 2024 Bala Subramanyam Duggirala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
            </pre>
          </body>
        </html>
      `);
      licenseWindow.document.close();
    }
  };

  return (
    <>
      <Button
        variant="outline-info"
        size="sm"
        onClick={handleButtonClick}
        className={`about-button ${!hasBeenClicked ? 'buzzy' : 'clicked'}`}
      >
        <i className="fas fa-info-circle me-1"></i>
        About
      </Button>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-droplet text-primary me-2"></i>
            California Water Quality GIS
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="about-content">
            <h5>Project Overview</h5>
            <p>
              This interactive Geographic Information System (GIS) provides comprehensive insights into California's water quality and treatment infrastructure. Our platform combines real-time data visualization with user-friendly tools to help citizens, researchers, and policymakers understand water quality patterns across California counties.
            </p>

            <h5>Key Features</h5>
            <ul>
              <li><strong>Interactive Map:</strong> Explore California counties with detailed water quality data</li>
              <li><strong>Treatment Plant Locator:</strong> Find water treatment facilities near any address</li>
              <li><strong>Water Quality Metrics:</strong> View lead, arsenic, and nitrate contamination levels</li>
              <li><strong>Population Data:</strong> Understand demographic context for water quality issues</li>
              <li><strong>Advanced Filtering:</strong> Customize data views with contamination thresholds</li>
            </ul>

            <h5>User Guide</h5>
            <div className="user-guide">
              <div className="guide-step">
                <strong>1. Search for Locations:</strong>
                <p>Use the county search or enter your address to focus on specific areas. When you enter an address, you'll see nearby treatment plants highlighted on the map.</p>
              </div>
              
              <div className="guide-step">
                <strong>2. Toggle Map Layers:</strong>
                <p>Use the sidebar controls to switch between Population Data, Water Quality, and Treatment Plants views. Only one choropleth layer can be active at a time.</p>
              </div>
              
              <div className="guide-step">
                <strong>3. Filter Treatment Plants:</strong>
                <p>After entering an address, use the distance slider to find treatment plants within your preferred radius (1-500 miles).</p>
              </div>
              
              <div className="guide-step">
                <strong>4. Apply Water Quality Filters:</strong>
                <p>When viewing water quality data, set maximum contamination thresholds for lead, arsenic, and nitrate to identify areas of concern.</p>
              </div>
              
              <div className="guide-step">
                <strong>5. View County Details:</strong>
                <p>Click on any county or info marker to view detailed statistics in a popup window.</p>
              </div>
            </div>

            <h5>Data Sources</h5>
            <p>
              This application uses dummy data mimicking that of the California state environmental agencies, the US Census Bureau, and public water system records. All data is regularly updated to ensure accuracy and relevance.
            </p>

            <div className="mt-4 text-center">
              <small className="text-muted">
                Developed by <strong>Bala Subramanyam Duggirala</strong> | 
                <button 
                  className="btn btn-link btn-sm p-0 ms-1"
                  onClick={openLicense}
                  style={{ textDecoration: 'underline' }}
                >
                  MIT License
                </button>
              </small>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AboutButton; 