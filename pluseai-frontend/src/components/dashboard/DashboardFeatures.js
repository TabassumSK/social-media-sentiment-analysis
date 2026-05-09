import React from 'react';
import { 
  Zap, Shield, Globe, Cpu, BarChart, Users, 
  Target, Rocket, TrendingUp, Layers
} from 'lucide-react';

const DashboardFeatures = () => {
  const features = [
    {
      icon: <Globe size={24} />,
      title: "Omni-Channel Aggregation",
      desc: "Instant data extraction from Twitter, Reddit, YouTube, HackerNews, and NewsAPI."
    },
    {
      icon: <Cpu size={24} />,
      title: "Batch BERT Inference",
      desc: "Massive scale analysis using state-of-the-art RoBERTa models for 98% accuracy."
    },
    {
      icon: <Layers size={24} />,
      title: "Aspect Intelligence",
      desc: "Go beyond 'Positive/Negative'. Analyze specific features like Value, Quality, and Service."
    },
    {
      icon: <BarChart size={24} />,
      title: "Advanced Data Export",
      desc: "Professional-grade reporting with PDF summaries and CSV data for deep analysis."
    }
  ];

  const applications = [
    {
      icon: <Target />,
      title: "Brand Monitoring",
      usage: "Track corporate reputation and detect sentiment shifts before they become crises."
    },
    {
      icon: <Rocket />,
      title: "Product Launches",
      usage: "Validate new features by listening to the real-world pulse of your target audience."
    },
    {
      icon: <TrendingUp />,
      title: "Market Analysis",
      usage: "Compare competitors side-by-side to identify market gaps and winning strategies."
    }
  ];

  return (
    <div className="dashboard-extras">
      <div className="container">
        {/* Features Section */}
        <section className="dashboard-section">
          <div className="section-header-v2">
            <Zap className="highlight" />
            <h2 className="section-title">Core Intelligence Features</h2>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card-v2 glass">
                <div className="feature-icon-v2">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Real World Applications */}
        <section className="dashboard-section">
          <div className="section-header-v2">
            <Shield className="highlight" />
            <h2 className="section-title">Real-World Applications</h2>
          </div>
          <div className="apps-container">
            {applications.map((app, i) => (
              <div key={i} className="app-row glass">
                <div className="app-icon-wrap">{app.icon}</div>
                <div className="app-details">
                  <h4>{app.title}</h4>
                  <p>{app.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Used By Section */}
      <section className="dashboard-section used-by-section">
        <div className="section-header-v2 center">
          <Users className="highlight" />
          <h2 className="section-title">Trusted By Digital Leaders</h2>
        </div>
        <div className="trust-badges">
          <div className="trust-badge">Fortune 500 Teams</div>
          <div className="trust-badge">Growth Marketers</div>
          <div className="trust-badge">Product Owners</div>
          <div className="trust-badge">Crypto Analysts</div>
          <div className="trust-badge">Journalists</div>
        </div>
      </section>
    </div>
  );
};

export default DashboardFeatures;
