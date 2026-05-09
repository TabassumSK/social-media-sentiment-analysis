import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, TrendingUp, Heart, AlertCircle, Zap, 
  ShieldCheck, Target, BarChart3, PieChart, Activity
} from 'lucide-react';

const ComparisonDetails = ({ verdict, product1, product2 }) => {
  if (!verdict) return null;

  const winnerData = verdict.winner === "Product 1" ? product1 : product2;
  const loserData = verdict.winner === "Product 1" ? product2 : product1;

  // Calculate platform wins
  const getPlatformWinner = (platform) => {
    const p1 = product1.platform_stats[platform];
    const p2 = product2.platform_stats[platform];
    if (!p1 || !p2) return null;
    return p1.positive > p2.positive ? "Product 1" : "Product 2";
  };

  const platforms = Array.from(new Set([
    ...Object.keys(product1.platform_stats),
    ...Object.keys(product2.platform_stats)
  ]));

  return (
    <div className="comparison-battle-report">
      {/* Visual VS Header */}
      <div className="battle-header">
        <div className={`combatant ${verdict.winner === "Product 1" ? "winner" : ""}`}>
          <div className="combatant-name">{product1.query}</div>
          <div className="combatant-score">{product1.summary.pos_pct}%</div>
        </div>
        <div className="vs-center">
          <div className="vs-circle">VS</div>
        </div>
        <div className={`combatant ${verdict.winner === "Product 2" ? "winner" : ""}`}>
          <div className="combatant-name">{product2.query}</div>
          <div className="combatant-score">{product2.summary.pos_pct}%</div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="verdict-banner-premium glass"
      >
        <div className="verdict-icon-wrap">
          <Trophy className="trophy-icon" size={48} />
        </div>
        <div className="verdict-info">
          <p className="verdict-label">AI VERDICT</p>
          <h2 className="verdict-title">{winnerData.query} dominates public sentiment</h2>
          <div className="verdict-basis-grid">
            {verdict.basis.map((point, i) => (
              <div key={i} className="basis-pill">
                <ShieldCheck size={14} className="blue" /> {point}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="battle-details-grid">
        {/* Emotional Strength */}
        <div className="battle-card glass">
          <div className="card-header-v2">
            <Heart size={18} className="red" />
            <h3>Emotional Resonance Battle</h3>
          </div>
          <div className="emotion-comparison-v2">
            {['Joy', 'Love', 'Surprise'].map(emo => (
              <div key={emo} className="emo-battle-row">
                <div className="emo-label-wrap">
                  <span className="emo-name">{emo}</span>
                  <span className="emo-diff">
                    {Math.round(((product1.summary.emotions[emo] || 0) / product1.total * 100) - ((product2.summary.emotions[emo] || 0) / product2.total * 100))}% diff
                  </span>
                </div>
                <div className="emo-comparison-bar">
                  <div 
                    className="emo-fill left" 
                    style={{ width: `${(product1.summary.emotions[emo] || 0) / product1.total * 100}%` }} 
                  />
                  <div 
                    className="emo-fill right" 
                    style={{ width: `${(product2.summary.emotions[emo] || 0) / product2.total * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="card-footer-text">Winner leads in positive emotional resonance across sources.</p>
        </div>

        {/* Platform Battle */}
        <div className="battle-card glass">
          <div className="card-header-v2">
            <BarChart3 size={18} className="blue" />
            <h3>Platform Dominance</h3>
          </div>
          <div className="platform-battle-list">
            {platforms.slice(0, 4).map(plat => {
              const win = getPlatformWinner(plat);
              return (
                <div key={plat} className="plat-battle-row">
                  <span className="plat-name">{plat.toUpperCase()}</span>
                  <div className="plat-win-badge">
                    {win === "Product 1" ? product1.query : product2.query} wins
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategic Advantage */}
        <div className="battle-card glass">
          <div className="card-header-v2">
            <Zap size={18} className="amber" />
            <h3>Critical Advantage</h3>
          </div>
          <div className="insight-content">
            <div className="advantage-item">
              <Target size={16} className="blue" />
              <p>
                <strong>{winnerData.query}</strong> excels in 
                <strong> {Object.entries(winnerData.aspects).length > 0 ? Object.entries(winnerData.aspects).sort((a,b) => b[1].pos_pct - a[1].pos_pct)[0][0] : "General Sentiment"}</strong>.
              </p>
            </div>
            <div className="advantage-item">
              <AlertCircle size={16} className="red" />
              <p>
                <strong>{loserData.query}</strong> struggles with 
                <strong> {Object.entries(loserData.aspects).length > 0 ? Object.entries(loserData.aspects).sort((a,b) => b[1].neg_pct - a[1].neg_pct)[0][0] : "Market Competition"}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="battle-card glass">
          <div className="card-header-v2">
            <Activity size={18} className="green" />
            <h3>Model Confidence</h3>
          </div>
          <div className="conf-comparison">
            <div className="conf-item">
              <span>{product1.query}</span>
              <div className="conf-val">{(product1.summary.avg_confidence * 100).toFixed(1)}%</div>
            </div>
            <div className="conf-item">
              <span>{product2.query}</span>
              <div className="conf-val">{(product2.summary.avg_confidence * 100).toFixed(1)}%</div>
            </div>
          </div>
          <p className="card-footer-text">Higher confidence indicates more stable public opinion.</p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonDetails;
