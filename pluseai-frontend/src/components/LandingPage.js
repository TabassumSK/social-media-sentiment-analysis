import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Globe, Cpu, BarChart, Users, 
  Target, Rocket, TrendingUp, Layers, CheckCircle, 
  ArrowRight, Search, Activity, PieChart, FileText
} from 'lucide-react';
import './LandingPage.css';
import DashboardFeatures from './dashboard/DashboardFeatures';
import ThreeScene from './ThreeScene';

const LandingPage = ({ onStart }) => {
  const features = [
    {
      icon: <Globe size={24} />,
      title: "Omni-Channel Scraper",
      desc: "Live extraction from Twitter, Reddit, YouTube, HackerNews, and global News outlets."
    },
    {
      icon: <Cpu size={24} />,
      title: "BERT-Powered Core",
      desc: "Advanced Transformer models decode complex emotional context with 98% accuracy."
    },
    {
      icon: <PieChart size={24} />,
      title: "Aspect Intelligence",
      desc: "Go beyond simple scores. Understand sentiment regarding Quality, Value, and Service."
    },
    {
      icon: <BarChart size={24} />,
      title: "Expert Reporting",
      desc: "Export findings into professional PDF, CSV, or JSON formats for business analysis."
    }
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-modern">
        <ThreeScene />
        <div className="hero-bg-glow"></div>
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge"
          >
            Powered by RoBERTa Transformer Models
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-title"
          >
            Understand the <span className="gradient-text">Pulse</span> of the Internet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-description"
          >
            Next-gen sentiment intelligence that aggregates and decodes public opinion across all major social channels in real-time.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hero-actions"
          >
            <button className="btn-get-started-v2" onClick={onStart}>
              Launch Dashboard <ArrowRight size={20} />
            </button>
            <button className="btn-demo-v2" onClick={() => document.getElementById('engine').scrollIntoView({ behavior: 'smooth' })}>
              How it Works
            </button>
          </motion.div>
        </div>
      </section>

      {/* How it Works - Pulse Engine */}
      <section id="engine" className="section engine-section">
        <div className="container">
          <div className="section-header-centered">
            <h2 className="section-title">The <span className="highlight">Intelligence</span> Loop</h2>
            <p className="section-subtitle">A seamless pipeline from raw noise to strategic clarity.</p>
          </div>
          
          <div className="engine-grid">
            <div className="engine-step glass">
              <div className="step-num">01</div>
              <Search size={32} className="step-icon blue" />
              <h3>Scrape & Aggregate</h3>
              <p>Our distributed scrapers pull live data from Twitter, Reddit, YouTube, and global news API endpoints simultaneously.</p>
            </div>
            <div className="engine-arrow"><ArrowRight /></div>
            <div className="engine-step glass">
              <div className="step-num">02</div>
              <Cpu size={32} className="step-icon purple" />
              <h3>BERT Analysis</h3>
              <p>The RoBERTa core processes batch text, assigning sentiment labels, confidence scores, and emotional triggers.</p>
            </div>
            <div className="engine-arrow"><ArrowRight /></div>
            <div className="engine-step glass">
              <div className="step-num">03</div>
              <BarChart size={32} className="step-icon green" />
              <h3>Visual Intelligence</h3>
              <p>Raw results are transformed into interactive heatmaps, radar charts, and professional exportable reports.</p>
            </div>
            <div className="engine-arrow"><ArrowRight /></div>
            <div className="engine-step glass">
              <div className="step-num">04</div>
              <FileText size={32} className="step-icon amber" />
              <h3>Strategic Export</h3>
              <p>Generate and download comprehensive reports in PDF, CSV, or JSON formats for seamless stakeholder sharing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Features Section */}
      <DashboardFeatures />

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-card glass">
          <h2>Ready to listen to the world?</h2>
          <p>Join 1,000+ analysts using PulseAI to stay ahead of the curve.</p>
          <button className="btn-get-started-v2 large" onClick={onStart}>
            Get Started Free <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
