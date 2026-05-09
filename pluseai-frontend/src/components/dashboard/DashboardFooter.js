import React from 'react';
import { 
  Github, Twitter, Linkedin, 
  Activity, ShieldCheck, Database
} from 'lucide-react';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="dashboard-footer-v2">
      <div className="dash-footer-top">
        <div className="dash-footer-brand">
          <div className="brand-wrap">
            <div className="brand-dot-v2" />
            <h3>PulseAI</h3>
          </div>
          <p>Next-generation sentiment intelligence for the modern enterprise.</p>
        </div>
        
        <div className="dash-footer-status">
          <div className="status-item">
            <Activity size={16} className="green" />
            <span>AI Engine: Online</span>
          </div>
          <div className="status-item">
            <Database size={16} className="blue" />
            <span>API Status: 99.9% Uptime</span>
          </div>
          <div className="status-item">
            <ShieldCheck size={16} className="purple" />
            <span>Encrypted Processing</span>
          </div>
        </div>

        <div className="dash-footer-social">
          {/* <a href="/" className="dash-social-link"><Twitter size={18} /></a> */}
          {/* <a href="/" className="dash-social-link"><Github size={18} /></a> */}
          {/* <a href="/" className="dash-social-link"><Linkedin size={18} /></a> */}
        </div>
      </div>

      <div className="dash-footer-bottom">
        <p>{"\u00A9"} {currentYear} PulseAI Intelligence Platform. Built for the future of data.</p>
        <div className="dash-footer-legal">
          <a href="/">Privacy</a>
          <a href="/">Terms</a>
          <a href="/">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
