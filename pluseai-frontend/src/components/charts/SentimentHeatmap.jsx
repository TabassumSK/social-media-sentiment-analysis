import React from 'react';
import { motion } from 'framer-motion';

const SentimentHeatmap = ({ data, height = '25px' }) => {
  if (!data) return null;

  // Gracefully handle both the full data object and the sliced platform_stats object
  const isFullData = data.platform_stats !== undefined;
  const platformStats = isFullData ? (data.platform_stats || {}) : data;
  const posts = isFullData ? (data.posts || []) : [];

  const platforms = Object.keys(platformStats);
  const sentiments = ['positive', 'neutral', 'negative'];

  // Initialize heatmapData for each platform
  const heatmapData = {};
  platforms.forEach(plat => {
    heatmapData[plat] = {
      'positive': 0,
      'neutral': 0,
      'negative': 0,
      'total': 0
    };
  });

  // Bin each post based on label
  const extraPlatforms = [];
  posts.forEach(p => {
    const rawPlat = p.platform || p.type || 'unknown';
    // Match casing
    const platKey = platforms.find(k => k.toLowerCase() === rawPlat.toLowerCase()) || rawPlat;
    
    if (!heatmapData[platKey]) {
      heatmapData[platKey] = {
        'positive': 0,
        'neutral': 0,
        'negative': 0,
        'total': 0
      };
      // Fix: don't mutate platforms during iteration — collect extras separately
      if (!extraPlatforms.includes(platKey)) extraPlatforms.push(platKey);
    }

    heatmapData[platKey].total += 1;
    const label = p.label;

    if (label === 'Positive') {
      heatmapData[platKey]['positive'] += 1;
    } else if (label === 'Negative') {
      heatmapData[platKey]['negative'] += 1;
    } else {
      heatmapData[platKey]['neutral'] += 1;
    }
  });
  // Now safely add any new platforms found
  extraPlatforms.forEach(p => { if (!platforms.includes(p)) platforms.push(p); });

  // Mathematical distribution fallback for any platform with missing/empty post slices to guarantee no empty cells
  platforms.forEach(plat => {
    if (heatmapData[plat].total === 0 && platformStats[plat] && platformStats[plat].total > 0) {
      const stats = platformStats[plat];
      heatmapData[plat].total = stats.total;
      
      heatmapData[plat]['positive'] = stats.positive || 0;
      heatmapData[plat]['neutral'] = stats.neutral || 0;
      heatmapData[plat]['negative'] = stats.negative || 0;
    }
  });

  // Color gradient palette reflecting emotional intensity (scales opacity proportionally to the percentage)
  const getColor = (pct, type) => {
    if (pct === 0) return '#1a1a1e';
    const intensity = Math.min(0.1 + (pct / 100) * 0.9, 1);
    
    if (type === 'positive') return `rgba(29, 158, 117, ${intensity})`; // Emerald Green (#1D9E75)
    if (type === 'neutral') return `rgba(239, 159, 39, ${intensity})`; // Amber Orange (#EF9F27)
    return `rgba(226, 75, 74, ${intensity})`; // Coral Red (#E24B4A)
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid" style={{ display: 'flex', gap: '10px' }}>
        {/* Y Axis Labels (Platform Names vertically aligned) */}
        <div className="heatmap-labels-y" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          fontSize: '11px', 
          color: '#a1a1aa',
          fontWeight: '700',
          minWidth: '85px',
          textAlign: 'right'
        }}>
          {platforms.map(p => (
            <div key={p} style={{ 
              height: height, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: '4px',
              paddingRight: '8px'
            }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </div>
          ))}
        </div>
        
        {/* Heatmap Body */}
        <div className="heatmap-body" style={{ flex: 1 }}>
          {platforms.map(platform => (
            <div key={platform} className="heatmap-row" style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {sentiments.map(sentiment => {
                const count = heatmapData[platform][sentiment] || 0;
                const total = heatmapData[platform].total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <motion.div
                    key={`${platform}-${sentiment}`}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="heatmap-cell"
                    style={{ 
                      flex: 1, 
                      height: height,
                      borderRadius: '3px',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: getColor(pct, sentiment) 
                    }}
                  >
                    <div className="cell-tooltip">
                      <p style={{ fontWeight: '800', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px', marginBottom: '5px' }}>
                        {platform.toUpperCase()}
                      </p>
                      <p style={{ textTransform: 'capitalize', color: '#a1a1aa', margin: 0 }}>
                        <span style={{ 
                          color: sentiment.includes('positive') ? '#1D9E75' : sentiment.includes('negative') ? '#E24B4A' : '#EF9F27',
                          fontWeight: '700'
                        }}>
                          {sentiment}:
                        </span> {pct}% ({count} {count === 1 ? 'post' : 'posts'})
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          
          {/* X Axis Labels (Sentiments horizontally aligned) */}
          <div className="heatmap-labels-x" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>
            {sentiments.map(s => (
              <span key={s} className="x-label" style={{ flex: 1, textAlign: 'center' }}>
                {s.charAt(0).toUpperCase() + s.slice(1, 3)} {/* 'Pos', 'Neu', 'Neg' */}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentHeatmap;
