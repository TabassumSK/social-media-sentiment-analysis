import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, PieChart, BarChart3, LayoutGrid } from 'lucide-react';

const SummaryPage = ({ data }) => {
  const { type } = useParams();
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>No analysis data found.</h2>
        <button className="btn-primary" onClick={() => navigate('/analyze')}>Go Back</button>
      </div>
    );
  }

  const renderSummary = () => {
    switch (type) {
      case 'sentiment':
        return (
          <div className="summary-content">
            <div className="summary-header">
              <PieChart size={32} className="highlight" />
              <h2>Sentiment Breakdown</h2>
            </div>
            <p>The sentiment analysis for <strong>"{data.query}"</strong> shows a predominantly {data.summary.pos_pct > 50 ? 'positive' : 'negative'} reception across all platforms.</p>
            <div className="summary-stats-box">
              <div className="summary-stat">
                <h3>{data.summary.positive}</h3>
                <p>Positive Mentions</p>
              </div>
              <div className="summary-stat">
                <h3>{data.summary.neutral}</h3>
                <p>Neutral Mentions</p>
              </div>
              <div className="summary-stat">
                <h3>{data.summary.negative}</h3>
                <p>Negative Mentions</p>
              </div>
            </div>
            <div className="summary-text-block">
              <h3>Detailed Insight</h3>
              <p>Our BERT model analyzed {data.total} unique data points. The average confidence score is {(data.summary.avg_confidence * 100).toFixed(1)}%, indicating a high level of certainty in these results.</p>
            </div>
            <div className="keyword-section">
              <div className="keyword-box pos">
                <h4>Top Positive Keywords</h4>
                <div className="keywords">
                  {data.pos_keywords.map(k => <span key={k.word} className="k-pill">{k.word}</span>)}
                </div>
              </div>
              <div className="keyword-box neg">
                <h4>Top Negative Keywords</h4>
                <div className="keywords">
                  {data.neg_keywords.map(k => <span key={k.word} className="k-pill">{k.word}</span>)}
                </div>
              </div>
            </div>
          </div>
        );
      case 'platform':
        return (
          <div className="summary-content">
            <div className="summary-header">
              <BarChart3 size={32} className="highlight" />
              <h2>Platform Intensity</h2>
            </div>
            <p>Distribution of sentiment across different social channels and news sources.</p>
            <div className="platform-summary-list">
              {Object.entries(data.platform_stats).map(([platform, stats]) => (
                <div key={platform} className="platform-summary-item glass">
                  <div className="platform-name">{platform.toUpperCase()}</div>
                  <div className="platform-bars">
                    <div className="p-bar pos" style={{ width: `${(stats.positive/stats.total)*100}%` }}></div>
                    <div className="p-bar neu" style={{ width: `${(stats.neutral/stats.total)*100}%` }}></div>
                    <div className="p-bar neg" style={{ width: `${(stats.negative/stats.total)*100}%` }}></div>
                  </div>
                  <div className="platform-pct">
                    {Math.round((stats.positive/stats.total)*100)}% Positive
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'aspects':
        return (
          <div className="summary-content">
            <div className="summary-header">
              <LayoutGrid size={32} className="highlight" />
              <h2>Aspect Distribution</h2>
            </div>
            <p>How specific categories like Quality, Performance, and Value are perceived.</p>
            <div className="aspect-summary-grid">
              {Object.entries(data.aspects).map(([aspect, stats]) => (
                <div key={aspect} className="aspect-summary-card glass">
                  <h3>{aspect}</h3>
                  <div className="aspect-score" style={{ color: stats.pos_pct > 60 ? '#1D9E75' : stats.pos_pct > 40 ? '#EF9F27' : '#E24B4A' }}>
                    {stats.pos_pct}%
                  </div>
                  <p>Sentiment Score</p>
                  <div className="aspect-mentions">{stats.total} mentions analyzed</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <h2>Summary not found</h2>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="summary-page container"
    >
      <button className="btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>
      
      <div className="summary-container glass">
        {renderSummary()}
      </div>
    </motion.div>
  );
};

export default SummaryPage;
