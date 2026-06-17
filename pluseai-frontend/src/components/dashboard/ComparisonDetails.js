import React from 'react';

const ComparisonDetails = ({ verdict, product1, product2 }) => {
  if (!verdict) return null;

  return (
    <div className="comparison-battle-report">
      {/* Dynamic Aspect-by-Aspect Comparison Table */}
      <div className="aspect-comparison-section" style={{ marginTop: '10px', marginBottom: '40px' }}>
        <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '25px', fontSize: '1.6rem', color: 'var(--text-secondary)' }}>
          Detailed Aspect Comparison (Dynamic Analysis)
        </h3>
        <div className="battle-card glass" style={{ padding: '25px', borderRadius: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
                <th style={{ padding: '12px', color: '#8b949e', fontWeight: '600' }}>ASPECT</th>
                <th style={{ padding: '12px', color: '#58a6ff', fontWeight: '600' }}>{product1.query.toUpperCase()}</th>
                <th style={{ padding: '12px', color: '#ab7eff', fontWeight: '600' }}>{product2.query.toUpperCase()}</th>
                <th style={{ padding: '12px', color: '#8b949e', fontWeight: '600', textAlign: 'center' }}>ADVANTAGE</th>
              </tr>
            </thead>
            <tbody>
              {['Quality', 'Value', 'Performance', 'Service', 'Innovation'].map((aspect, idx) => {
                const p1Val = product1.aspects && product1.aspects[aspect] ? product1.aspects[aspect].pos_pct : 0;
                const p2Val = product2.aspects && product2.aspects[aspect] ? product2.aspects[aspect].pos_pct : 0;
                
                let advantage = 'Tie';
                let advColor = '#8b949e';
                if (p1Val > p2Val) {
                  advantage = product1.query;
                  advColor = '#58a6ff';
                } else if (p2Val > p1Val) {
                  advantage = product2.query;
                  advColor = '#ab7eff';
                }

                return (
                  <tr key={aspect} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '15px 12px', fontWeight: '500', color: '#cbd5e1' }}>{aspect}</td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ minWidth: '40px', fontWeight: '600' }}>{p1Val}%</span>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                          <div style={{ width: `${p1Val}%`, background: '#58a6ff', height: '100%' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ minWidth: '40px', fontWeight: '600' }}>{p2Val}%</span>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                          <div style={{ width: `${p2Val}%`, background: '#ab7eff', height: '100%' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 12px', textAlign: 'center', fontWeight: '700', color: advColor }}>
                      {advantage}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-side Sample Data Consisted for Comparison */}
      <div className="posts-comparison-section" style={{ marginTop: '20px' }}>
        <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '25px', fontSize: '1.8rem' }}>
          Data Consisted for Comparison (Sample Reviews & Mentions)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {/* Product 1 Feed */}
          <div className="battle-card glass" style={{ padding: '25px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>
              {product1.query} Samples
            </h4>
            <div className="feed-list">
              {product1.posts && product1.posts.slice(0, 5).map((post, index) => (
                <div key={index} className="feed-item" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="source-badge">{post.source || post.platform || 'General'}</span>
                    <span className={`badge ${post.label.toLowerCase()}`}>{post.label}</span>
                  </div>
                  <p className="feed-title" style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                    {post.text}
                  </p>
                </div>
              ))}
              {(!product1.posts || product1.posts.length === 0) && (
                <p style={{ color: 'var(--text-tertiary)' }}>No posts available.</p>
              )}
            </div>
          </div>

          {/* Product 2 Feed */}
          <div className="battle-card glass" style={{ padding: '25px', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>
              {product2.query} Samples
            </h4>
            <div className="feed-list">
              {product2.posts && product2.posts.slice(0, 5).map((post, index) => (
                <div key={index} className="feed-item" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="source-badge">{post.source || post.platform || 'General'}</span>
                    <span className={`badge ${post.label.toLowerCase()}`}>{post.label}</span>
                  </div>
                  <p className="feed-title" style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                    {post.text}
                  </p>
                </div>
              ))}
              {(!product2.posts || product2.posts.length === 0) && (
                <p style={{ color: 'var(--text-tertiary)' }}>No posts available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonDetails;
