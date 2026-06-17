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


  return (
    <div className="landing-container">
      {/* 01. Hero Section */}
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

          {/* Quick Nav for 3D Landing Page */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="hero-quick-nav"
          >
            {[
              { id: 'engine', label: 'Pipeline', icon: <Cpu size={16} /> },
              { id: 'features', label: 'Features', icon: <Zap size={16} /> },
              { id: 'use-cases', label: 'Use Cases', icon: <Target size={16} /> }
            ].map((nav) => (
              <button 
                key={nav.id} 
                className="nav-jump-btn"
                onClick={() => document.getElementById(nav.id).scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="nav-jump-icon">{nav.icon}</span>
                <span className="nav-jump-label">{nav.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 02. The Intelligence Pipeline - Spatial Design */}
      <section id="engine" className="section engine-section">
        <div className="container">
          <div className="section-header-centered">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="section-badge"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Cpu size={16} />
              <span>The Architecture</span>
            </motion.div>
            <h2 className="section-title large">Intelligence <span className="highlight">Pipeline</span></h2>
            <p className="section-subtitle large">Our proprietary engine transforms raw social data into actionable brand strategy.</p>
          </div>
          
          <div className="pipeline-container">
            <div className="pipeline-connector"></div>
            <div className="engine-grid-spatial">
              <motion.div 
                whileHover={{ translateZ: 20, rotateX: -5, rotateY: 5 }}
                className="engine-step-spatial glass"
              >
                <div className="step-glow blue"></div>
                <div className="step-num-spatial">01</div>
                <div className="step-icon-wrap blue">
                  <Search size={32} />
                </div>
                <h3>Scrape & Aggregate</h3>
                <p>Distributed agents pull live data from Twitter, Reddit, and global news API endpoints simultaneously.</p>
              </motion.div>

              <motion.div 
                whileHover={{ translateZ: 20, rotateX: -5, rotateY: 5 }}
                className="engine-step-spatial glass"
              >
                <div className="step-glow purple"></div>
                <div className="step-num-spatial">02</div>
                <div className="step-icon-wrap purple">
                  <Cpu size={32} />
                </div>
                <h3>BERT Analysis</h3>
                <p>State-of-the-art RoBERTa models process batch text to decode sentiment and emotional triggers.</p>
              </motion.div>

              <motion.div 
                whileHover={{ translateZ: 20, rotateX: -5, rotateY: 5 }}
                className="engine-step-spatial glass"
              >
                <div className="step-glow green"></div>
                <div className="step-num-spatial">03</div>
                <div className="step-icon-wrap green">
                  <BarChart size={32} />
                </div>
                <h3>Visual Intel</h3>
                <p>Interactive heatmaps and radar charts provide a multi-dimensional view of public opinion.</p>
              </motion.div>

              <motion.div 
                whileHover={{ translateZ: 20, rotateX: -5, rotateY: 5 }}
                className="engine-step-spatial glass"
              >
                <div className="step-glow amber"></div>
                <div className="step-num-spatial">04</div>
                <div className="step-icon-wrap amber">
                  <FileText size={32} />
                </div>
                <h3>Strategic Export</h3>
                <p>Generate board-ready reports in PDF, CSV, or JSON for seamless stakeholder sharing.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Core Intelligence Features & Apps */}
      <DashboardFeatures />



      {/* 05. Final CTA */}
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
