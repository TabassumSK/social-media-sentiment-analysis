import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Globe, Cpu, BarChart, 
  Target, Rocket, TrendingUp, Layers
} from 'lucide-react';

const DashboardFeatures = () => {
  const features = [
    {
      icon: <Globe size={28} />,
      title: "Omni-Channel Aggregation",
      desc: "Instant data extraction from Twitter, Reddit, YouTube, HackerNews, and NewsAPI.",
      color: "blue"
    },
    {
      icon: <Cpu size={28} />,
      title: "Batch BERT Inference",
      desc: "Massive scale analysis using state-of-the-art RoBERTa models for 98% accuracy.",
      color: "purple"
    },
    {
      icon: <Layers size={28} />,
      title: "Aspect Intelligence",
      desc: "Go beyond 'Positive/Negative'. Analyze specific features like Value, Quality, and Service.",
      color: "green"
    },
    {
      icon: <BarChart size={28} />,
      title: "Advanced Data Export",
      desc: "Professional-grade reporting with PDF summaries and CSV data for deep analysis.",
      color: "amber"
    }
  ];

  const applications = [
    {
      icon: <Target size={32} />,
      title: "Brand Monitoring",
      usage: "Track corporate reputation and detect sentiment shifts before they become crises.",
      tag: "Enterprise"
    },
    {
      icon: <Rocket size={32} />,
      title: "Product Launches",
      usage: "Validate new features by listening to the real-world pulse of your target audience.",
      tag: "Marketing"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Market Analysis",
      usage: "Compare competitors side-by-side to identify market gaps and winning strategies.",
      tag: "Research"
    }
  ];

  return (
    <div className="features-showcase">
      {/* 03. Core Intelligence Features */}
      <section id="features" className="dashboard-section-modern">
        <div className="container">
          <div className="section-header-v2 center">
            <div className="header-label section-badge">
              <Zap size={20} className="highlight" />
              <span>Core Capabilities</span>
            </div>
            <h2 className="section-title large">Technical <span className="highlight">Excellence</span></h2>
          </div>
          
          <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5, scale: 1.01 }}
                className="feature-card-spatial glass"
                style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2.5rem' }}
              >
                <div className={`feature-icon-v2-spatial ${f.color}`} style={{ marginBottom: 0, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>{f.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Real World Applications */}
      <section id="use-cases" className="dashboard-section-modern apps-section">
        <div className="container">
          <div className="section-header-v2 center">
            <div className="header-label section-badge">
              <Shield size={20} className="highlight" />
              <span>Use Cases</span>
            </div>
            <h2 className="section-title large">Real-World <span className="highlight">Impact</span></h2>
          </div>

          <div className="apps-grid-v2">
            {applications.map((app, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                className="app-card-v2 glass"
              >
                <div className="app-card-top">
                  <div className="app-icon-large">{app.icon}</div>
                  <span className="app-tag">{app.tag}</span>
                </div>
                <div className="app-card-body">
                  <h4>{app.title}</h4>
                  <p>{app.usage}</p>
                </div>
                <div className="app-card-footer">
                  <span>Learn More</span>
                  <Rocket size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardFeatures;

