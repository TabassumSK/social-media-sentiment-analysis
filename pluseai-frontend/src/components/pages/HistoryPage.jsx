import React from 'react';
import { Trash2 } from 'lucide-react';

export default function HistoryPage({
  history,
  selectedCategoryTab, setSelectedCategoryTab,
  handleDeleteHistory,
  reAnalyze,
  reCompare
}) {
  return (
    <div className="history-wrap">
      <h2 className="section-title">Search History</h2>

      <div className="history-tabs-container">
        {[
          { id: "all", label: "All Activity" },
          { id: "analysis", label: "Brand Analysis" },
          { id: "comparison", label: "Comparisons" },
          { id: "prediction", label: "Single Predictions" }
        ].map(tab => (
          <button
            key={tab.id}
            className={`history-tab-btn ${selectedCategoryTab === tab.id ? "active" : ""}`}
            onClick={() => setSelectedCategoryTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <p>No history found. Perform a search to see history here.</p>
        </div>
      ) : (() => {
        const filteredHistory = history.filter(h => {
          if (selectedCategoryTab === "all") return true;
          return h.category === selectedCategoryTab;
        });

        if (filteredHistory.length === 0) {
          return (
            <div className="empty-state">
              <p>No history found for this category.</p>
            </div>
          );
        }

        return (
          <div className="history-list">
            {filteredHistory.map((h, i) => {
              const posVal = h.pos_pct || 0;
              const negVal = h.neg_pct || 0;
              const neuVal = Math.max(0, 100 - posVal - negVal);
              const formattedDate = new Date(h.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const isComparison = h.category === 'comparison';
              const isPrediction = h.category === 'prediction';

              return (
                <div key={h.id || i} className="history-item-premium">
                  <div className="history-meta">
                    <span className={`activity-badge ${h.category || 'analysis'}`}>
                      {h.category ? h.category.charAt(0).toUpperCase() + h.category.slice(1) : 'Analysis'}
                    </span>
                    <div className="history-meta-right">
                      <span className="history-date">{formattedDate}</span>
                      <button
                        className="btn-delete-history"
                        onClick={(e) => handleDeleteHistory(h.id, e)}
                        title="Delete from history"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="history-content-main">
                    <div className="history-main-row">
                      <div className="history-query-info">
                        <h3 className="history-query-title" style={{ fontSize: isPrediction ? '15px' : '18px', fontStyle: isPrediction ? 'italic' : 'normal' }}>
                          {isPrediction ? `"${h.query}"` : h.query}
                        </h3>
                        <p className="history-volume-badge">
                          {isPrediction ? 'Single Prediction' : `${h.total || 0} Data Points`}
                        </p>
                      </div>
                      {!isPrediction && !isComparison && (
                        <button className="btn-reanalyze" onClick={() => reAnalyze(h.query)}>
                          Re-analyze →
                        </button>
                      )}
                      {isComparison && (
                        <button className="btn-reanalyze" onClick={() => {
                          const parts = h.query.split(" vs ");
                          if (parts.length === 2) {
                            reCompare(parts[0], parts[1]);
                          }
                        }}>
                          Re-compare →
                        </button>
                      )}
                    </div>

                    {isPrediction && (
                      <div className="history-sentiment-section" style={{ borderLeft: `4px solid ${posVal > 0 ? '#1D9E75' : '#E24B4A'}` }}>
                        <div className="history-sentiment-labels">
                          <span className={`sent-label ${posVal > 0 ? 'pos' : 'neg'}`} style={{ fontSize: '15px', fontWeight: 'bold' }}>
                            Result: {posVal > 0 ? 'Positive' : 'Negative'}
                          </span>
                        </div>
                      </div>
                    )}

                    {isComparison && (
                      <div className="history-sentiment-section">
                        {(() => {
                          const products = h.query.split(" vs ");
                          const p1Name = products[0] || "Product 1";
                          const p2Name = products[1] || "Product 2";
                          return (
                            <>
                              <div className="history-sentiment-labels">
                                <span className="sent-label pos">{p1Name}: {posVal}% Pos</span>
                                <span className="sent-label neg">{p2Name}: {negVal}% Pos</span>
                              </div>
                              <div className="sentiment-bar-mini" style={{ background: '#E24B4A' }}>
                                <div className="sentiment-bar-fill pos" style={{ width: `${(posVal / (posVal + negVal || 1)) * 100}%` }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {!isPrediction && !isComparison && (
                      <>
                        <div className="history-sentiment-section">
                          <div className="history-sentiment-labels">
                            <span className="sent-label pos">{posVal.toFixed(1)}% Positive</span>
                            <span className="sent-label neu">{neuVal.toFixed(1)}% Neutral</span>
                            <span className="sent-label neg">{negVal.toFixed(1)}% Negative</span>
                          </div>
                          <div className="sentiment-bar-mini">
                            <div className="sentiment-bar-fill pos" style={{ width: `${posVal}%` }} />
                            <div className="sentiment-bar-fill neu" style={{ width: `${neuVal}%` }} />
                            <div className="sentiment-bar-fill neg" style={{ width: `${negVal}%` }} />
                          </div>
                        </div>

                        <div className="history-keywords-grid">
                          <div className="history-keywords-column pos">
                            <h4 className="kw-column-title">Positive Driver Keywords</h4>
                            <div className="keyword-tag-cloud">
                              {h.pos_keywords && h.pos_keywords.length > 0 ? (
                                h.pos_keywords.slice(0, 6).map((kw, idx) => (
                                  <span key={idx} className="keyword-tag pos">
                                    {kw.word} <span className="kw-count">({kw.count})</span>
                                  </span>
                                ))
                              ) : (
                                <span className="no-keywords">No positive drivers cached</span>
                              )}
                            </div>
                          </div>

                          <div className="history-keywords-column neg">
                            <h4 className="kw-column-title">Negative Driver Keywords</h4>
                            <div className="keyword-tag-cloud">
                              {h.neg_keywords && h.neg_keywords.length > 0 ? (
                                h.neg_keywords.slice(0, 6).map((kw, idx) => (
                                  <span key={idx} className="keyword-tag neg">
                                    {kw.word} <span className="kw-count">({kw.count})</span>
                                  </span>
                                ))
                              ) : (
                                <span className="no-keywords">No negative drivers cached</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
