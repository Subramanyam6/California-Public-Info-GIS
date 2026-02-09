import React from 'react';
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
    <footer className="enterprise-footer">
      <div className="footer-left">
        <span className="status-dot"></span>
        <span>Operational</span>
        <span className="divider"></span>
        <span>© 2024-Present Bala Subramanyam Duggirala</span>
      </div>

      <div className="footer-right">
        <button type="button" className="footer-action" onClick={openLicense}>
          MIT License
        </button>
        <a
          href="https://github.com/Subramanyam6/California-Public-Info-GIS.git"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-action"
        >
          <i className="fab fa-github"></i>
          Repository
        </a>
      </div>
    </footer>
  );
};

export default Footer;
