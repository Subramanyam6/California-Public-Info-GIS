import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import './AboutButton.css';

const AboutButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const openLicense = () => {
    const licenseWindow = window.open('', '_blank');
    if (licenseWindow) {
      licenseWindow.document.write(`
        <html>
          <head>
            <title>MIT License</title>
            <style>
              body { font-family: Inter, -apple-system, sans-serif; padding: 24px; line-height: 1.7; color: #1f3146; }
              pre { background: #eef4fb; padding: 16px; border-radius: 10px; border: 1px solid #c8d8ea; }
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
      <Button className="about-trigger-btn" onClick={() => setOpen(true)}>
        <i className="fas fa-circle-info"></i>
        Platform Brief
      </Button>

      <Modal show={open} onHide={() => setOpen(false)} size="lg" centered className="platform-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-shield-water me-2"></i>
            California Water Command Center
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="platform-brief-grid">
            <section>
              <h5>Purpose</h5>
              <p>
                This platform unifies county contaminant metrics, treatment
                infrastructure, and geospatial context so decision teams can
                investigate risk conditions quickly.
              </p>
            </section>
            <section>
              <h5>How To Operate</h5>
              <ol>
                <li>Target a county or search an address from the control tower.</li>
                <li>Activate map layers to compare population and contaminant signals.</li>
                <li>Apply thresholds to isolate high-exposure regions.</li>
                <li>Inspect county intelligence panels for response planning.</li>
              </ol>
            </section>
            <section>
              <h5>Dataset Context</h5>
              <p>
                The current environment uses representative test data structured
                like California public records for exploration and workflow testing.
              </p>
            </section>
            <section className="platform-meta">
              <small>
                Built by <strong>Bala Subramanyam Duggirala</strong>
              </small>
              <button className="license-inline-btn" onClick={openLicense}>
                MIT License
              </button>
            </section>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AboutButton;
