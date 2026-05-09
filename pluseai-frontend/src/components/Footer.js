import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-logo">
            <span className="dot"></span>
            <h2>PulseAI</h2>
          </div>
          <p>Decoding the digital pulse of the world with advanced AI sentiment intelligence.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h3>Product</h3>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="/analyze">Analyzer</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Resources</h3>
            <ul>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/api">API Reference</a></li>
              <li><a href="/support">Support</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="https://twitter.com" className="social-icon">𝕏</a>
              <a href="https://github.com" className="social-icon">GitHub</a>
              <a href="https://linkedin.com" className="social-icon">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PulseAI. All rights reserved.</p>
        <div className="footer-legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
