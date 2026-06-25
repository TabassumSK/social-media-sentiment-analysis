import React from 'react';
import { motion } from 'framer-motion';
import ComparisonDetails from "../dashboard/ComparisonDetails";

export default function ComparePage({
  compareQ1, setCompareQ1,
  compareQ2, setCompareQ2,
  compareTopics, compareLoading, compareData
}) {
  const scoreColor = (pct) => pct >= 60 ? "#1D9E75" : pct >= 40 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="compare-wrap">
      <h2 className="section-title">Smart Comparison</h2>
      <div className="compare-inputs">
        <input className="search-input" value={compareQ1} onChange={(e) => setCompareQ1(e.target.value)} placeholder="Product 1..." />
        <span className="vs-badge">VS</span>
        <input className="search-input" value={compareQ2} onChange={(e) => setCompareQ2(e.target.value)} placeholder="Product 2..." />
        <button className="btn-primary" onClick={compareTopics} disabled={compareLoading}>
          {compareLoading ? <span className="spinner" /> : "Compare →"}
        </button>
      </div>

      {compareData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="compare-results" style={{ marginTop: '30px', marginBottom: '30px' }}>
            {[compareData.product1, compareData.product2].map((d, i) => (
              <div key={i} className="compare-card">
                <h3 className="compare-title">"{d.query}"</h3>
                <div className="compare-score" style={{ color: scoreColor(d.summary.pos_pct) }}>{d.summary.pos_pct}%</div>
                <p className="compare-label">Positive Reception</p>
                <div className="compare-bar">
                  <div className="compare-bar-fill" style={{ width: `${d.summary.pos_pct}%`, background: scoreColor(d.summary.pos_pct) }} />
                </div>
              </div>
            ))}
          </div>

          <ComparisonDetails
            verdict={compareData}
            product1={compareData.product1}
            product2={compareData.product2}
          />
        </motion.div>
      )}
    </div>
  );
}
