import React from 'react';
import { motion } from 'framer-motion';

const SentimentHeatmap = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return null;

  const platforms = Object.keys(data);
  const sentiments = ['positive', 'neutral', 'negative'];

  const getColor = (pct, type) => {
    if (pct === 0) return '#1a1a1e';
    const intensity = Math.min(0.1 + (pct / 100), 1);
    if (type === 'positive') return `rgba(16, 185, 129, ${intensity})`;
    if (type === 'neutral') return `rgba(245, 158, 11, ${intensity})`;
    return `rgba(239, 68, 68, ${intensity})`;
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        <div className="heatmap-labels-y">
          {sentiments.map(s => <span key={s} className="y-label">{s.charAt(0).toUpperCase() + s.slice(1, 3)}</span>)}
        </div>
        <div className="heatmap-body">
          {sentiments.map(sentiment => (
            <div key={sentiment} className="heatmap-row">
              {platforms.map(platform => {
                const count = data[platform][sentiment] || 0;
                const total = data[platform].total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <motion.div
                    key={`${platform}-${sentiment}`}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="heatmap-cell"
                    style={{ backgroundColor: getColor(pct, sentiment) }}
                  >
                    <div className="cell-tooltip">
                      <p>{platform.toUpperCase()}</p>
                      <p>{sentiment}: {pct}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div className="heatmap-labels-x">
            {platforms.map(p => <span key={p} className="x-label">{p.charAt(0).toUpperCase() + p.slice(1, 3)}</span>)}
          </div>
        </div>
      </div>
      <div className="heatmap-legend" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', fontSize: '10px', color: '#666' }}>
        <span>Low Intensity</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0.2, 0.4, 0.6, 0.8, 1].map(o => <div key={o} style={{ width: '12px', height: '12px', background: `rgba(59, 130, 246, ${o})`, borderRadius: '2px' }} />)}
        </div>
        <span>High Intensity</span>
      </div>
    </div>
  );
};

export default SentimentHeatmap;
