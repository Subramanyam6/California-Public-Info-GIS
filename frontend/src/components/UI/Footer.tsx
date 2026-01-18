import React from 'react';
import { Container } from 'react-bootstrap';
import './Footer.css';

const Footer: React.FC = () => {
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
    <footer className="app-footer">
      <Container fluid>
        <div className="text-center">
          <p className="footer-text mb-0">
            © 2024-Present Made with <span className="fire-emoji">🔥</span> by <strong>Bala Subramanyam Duggirala</strong>
            <a 
              href="https://github.com/Subramanyam6/California-Public-Info-GIS.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link ms-2"
              title="View source code on GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
          </p>
          <button 
            className="license-link"
            onClick={openLicense}
            title="View MIT License"
          >
            MIT License
          </button>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 