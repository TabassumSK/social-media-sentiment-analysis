import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, PieChart as PieIcon, BarChart3 as BarIcon, 
  LayoutGrid as GridIcon, Activity, Thermometer, ShieldAlert, Sparkles, AlertCircle, Info, Landmark, HelpCircle, CheckCircle2, TrendingUp
} from 'lucide-react';
import {
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, CartesianGrid
} from "recharts";

import SentimentHeatmap from "./charts/SentimentHeatmap";
import ConfidenceTrend from "./charts/ConfidenceTrend";

const SummaryPage = ({ data }) => {
  const { type } = useParams();
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: '#e4e4e7' }}>
        <HelpCircle size={48} style={{ color: '#ef4444', marginBottom: '20px' }} />
        <h2>No analysis data found.</h2>
        <p style={{ color: '#a1a1aa', marginTop: '10px' }}>Please perform a search in the Analyze section first.</p>
        <button className="btn-primary" onClick={() => navigate('/analyze')} style={{ marginTop: '20px' }}>Go Back</button>
      </div>
    );
  }

  const renderSummary = () => {
    switch (type) {
      case 'sentiment': {
        const posVal = data.summary.positive;
        const negVal = data.summary.negative;
        const neuVal = data.summary.neutral || 0;
        const totalVal = posVal + negVal + neuVal;
        
        const posPct = data.summary.pos_pct;
        const negPct = data.summary.neg_pct;
        const neuPct = data.summary.neutral_pct || 0;

        const sentimentData = [
          { name: 'Positive', value: posVal, pct: posPct, color: '#1D9E75' },
          { name: 'Neutral', value: neuVal, pct: neuPct, color: '#EF9F27' },
          { name: 'Negative', value: negVal, pct: negPct, color: '#E24B4A' }
        ].filter(item => item.value > 0);

        return (
          <div className="premium-summary-layout">
            <div className="premium-summary-header">
              <div className="header-icon-wrap sentiment">
                <PieIcon size={24} />
              </div>
              <div>
                <h2>Global Sentiment Analysis</h2>
                <p className="subtitle">Overall emotional distribution for <strong>"{data.query}"</strong> across all monitored channels</p>
              </div>
            </div>

            <div className="premium-summary-grid">
              {/* Visual Card */}
              <div className="visual-card glass-panel">
                <h3 className="card-heading">Visual Chart</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1.5 }}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 15;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          const colors = { Positive: '#1D9E75', Negative: '#E24B4A', Neutral: '#EF9F27' };
                          return (
                            <text 
                              x={x} 
                              y={y} 
                              fill={colors[name] || '#a1a1aa'} 
                              textAnchor={x > cx ? 'start' : 'end'} 
                              dominantBaseline="central"
                              style={{ fontSize: '13px', fontWeight: '800' }}
                            >
                              {`${name} ${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '8px', color: '#fff' }}
                        formatter={(value, name, props) => [`${value} mentions (${props.payload.pct}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="legend-container">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: item.color }} />
                      <span className="legend-name">{item.name}</span>
                      <span className="legend-val">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights Card */}
              <div className="insights-card glass-panel">
                <h3 className="card-heading">PulseAI Smart Summary</h3>
                <div className="pulse-score-row">
                  <div className="pulse-score-val" style={{ color: posPct >= 60 ? '#1D9E75' : posPct >= 40 && posPct < 60 ? '#EF9F27' : '#E24B4A' }}>
                    {posPct}%
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Positive Pulse Score</h4>
                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.85rem' }}>Based on {totalVal} analyzed data points</p>
                  </div>
                </div>

                <div className="explanation-block">
                  <p>
                    The general perception of <strong>"{data.query}"</strong> is predominantly{' '}
                    <strong style={{ color: posPct > negPct ? '#1D9E75' : '#E24B4A' }}>
                      {posPct > negPct ? 'Positive' : 'Negative'}
                    </strong>
                    . Positive conversations represent {posPct}%, neutral remarks account for {neuPct}%, and negative sentiment sits at {negPct}%.
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    This sentiment analysis is processed using a multi-layered deep learning BERT model, ensuring an average model prediction confidence of{' '}
                    <strong>{(data.summary.avg_confidence * 100).toFixed(1)}%</strong>.
                  </p>
                </div>

                <div className="summary-stat-row">
                  <div className="mini-stat-card">
                    <span className="stat-num green">{posVal}</span>
                    <span className="stat-label">Positive</span>
                  </div>
                  <div className="mini-stat-card">
                    <span className="stat-num amber">{neuVal}</span>
                    <span className="stat-label">Neutral</span>
                  </div>
                  <div className="mini-stat-card">
                    <span className="stat-num red">{negVal}</span>
                    <span className="stat-label">Negative</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword block */}
            <div className="premium-summary-footer glass-panel">
              <div className="footer-header">
                <Sparkles size={20} className="highlight" />
                <h3>Keyword Associations & Action Guide</h3>
              </div>
              <p className="footer-desc">These are the top keywords that drive public emotional opinion inside the datasets.</p>
              
              <div className="keyword-split-grid">
                <div className="keyword-pill-box positive">
                  <h4>Praise & Strengths</h4>
                  <div className="keywords-wrap">
                    {data.pos_keywords && data.pos_keywords.length > 0 ? (
                      data.pos_keywords.slice(0, 10).map(k => (
                        <span key={k.word} className="k-pill pos">{k.word} <span className="k-count">{k.count}</span></span>
                      ))
                    ) : (
                      <span className="muted-text">No significant keywords</span>
                    )}
                  </div>
                </div>

                <div className="keyword-pill-box negative">
                  <h4>Complaints & Risks</h4>
                  <div className="keywords-wrap">
                    {data.neg_keywords && data.neg_keywords.length > 0 ? (
                      data.neg_keywords.slice(0, 10).map(k => (
                        <span key={k.word} className="k-pill neg">{k.word} <span className="k-count">{k.count}</span></span>
                      ))
                    ) : (
                      <span className="muted-text">No significant keywords</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'platform': {
        const platformData = Object.entries(data.platform_stats).map(([k, v]) => {
          const total = v.total || 1;
          return {
            name: k.charAt(0).toUpperCase() + k.slice(1),
            positive: v.positive,
            neutral: v.neutral || 0,
            negative: v.negative,
            total: v.total,
            posRatio: Math.round((v.positive / total) * 100),
            neuRatio: Math.round(((v.neutral || 0) / total) * 100),
            negRatio: Math.round((v.negative / total) * 100)
          };
        });

        // Color coding for each platform for design accents
        const platformColors = {
          Twitter: '#ffffff',
          Reddit: '#ff4500',
          Youtube: '#ff0000',
          Hackernews: '#ff6600',
          News: '#3b82f6'
        };

        return (
          <div className="premium-summary-layout">
            <div className="premium-summary-header">
              <div className="header-icon-wrap platform">
                <BarIcon size={24} />
              </div>
              <div>
                <h2>Platform Sentiment Distribution</h2>
                <p className="subtitle">Comparative sentiment breakdown and volume analytics across active channels</p>
              </div>
            </div>

            {/* Channel Analysis */}
            <div className="insights-card glass-panel" style={{ padding: '30px' }}>
              <h3 className="card-heading" style={{ marginBottom: '20px' }}>Channel Analysis & Platform Strategy</h3>
              
              <div className="platform-summary-list">
                {platformData.map((plat) => {
                  const colorAccent = platformColors[plat.name] || '#3b82f6';
                  
                  let diagnosis = "";
                  let action = "";
                  
                  if (plat.total === 0) {
                    diagnosis = `No mentions detected on ${plat.name} yet.`;
                    action = "Monitor this channel over the next few days as search volume expands to capture early discussions.";
                  } else {
                    if (plat.name === "Twitter") {
                      diagnosis = `Out of ${plat.total} real-time mentions on Twitter/X, sentiment stands at ${plat.posRatio}% Positive and ${plat.negRatio}% Negative. This channel drives viral brand discourse and immediate feedback loop.`;
                      action = plat.posRatio >= 55 
                        ? `Leverage Twitter's viral nature: Retweet and spotlight enthusiastic user praise, pin top product testimonials, and engage actively with influencers to maintain high momentum.`
                        : plat.negRatio >= 35
                        ? `Deploy support team immediately to address complaints under the negative threads. Fast response is key on Twitter to de-escalate public brand friction.`
                        : `Engage users with interactive content, run polls, and share feature updates to spark conversational growth and positive perception.`;
                    } else if (plat.name === "Reddit") {
                      diagnosis = `Mentions on Reddit (${plat.total} posts) reflect community-based conversations with ${plat.posRatio}% Positive and ${plat.negRatio}% Negative distributions. Discussions here tend to be deeply detailed and objective.`;
                      action = plat.posRatio >= 55
                        ? `Acknowledge detailed positive reviews in developer subreddits. Share detailed guides and participate in discussions to foster community trust.`
                        : plat.negRatio >= 35
                        ? `Address critical technical complaints or bugs in active subreddits transparently. Reddit users appreciate technical honesty and clear developer roadmaps.`
                        : `Host AMA (Ask Me Anything) sessions or share design considerations to convert objective community members into brand advocates.`;
                    } else if (plat.name === "Youtube") {
                      diagnosis = `YouTube comments (${plat.total} video comments) show an emotional distribution of ${plat.posRatio}% Positive and ${plat.negRatio}% Negative. These comments are heavily influenced by visual reviews and tutorials.`;
                      action = plat.posRatio >= 55
                        ? `Pin highly positive comments under main videos, collaborate with creators making positive reviews, and support video creators with affiliate links.`
                        : plat.negRatio >= 35
                        ? `Identify which product feature is receiving negative reviews in videos. Publish a clear video fix or response pinned at the top comment sections.`
                        : `Nurture watchers by answering product questions in the comments sections to shift neutral viewers into active users.`;
                    } else if (plat.name === "Hackernews") {
                      diagnosis = `Technical commentary on HackerNews (${plat.total} posts) displays ${plat.posRatio}% Positive and ${plat.negRatio}% Negative sentiment. The audience here is highly analytical and tech-focused.`;
                      action = plat.posRatio >= 55
                        ? `Maintain developer goodwill. Respond to technical inquiries on threads and provide open-source repos or documentation links.`
                        : plat.negRatio >= 35
                        ? `HN users are sensitive to marketing fluff. Address criticism with solid technical explanations, and show concrete bug fixes or architectural updates.`
                        : `Provide clear technical API docs and share structural architecture stories to engage this developer-heavy audience.`;
                    } else {
                      diagnosis = `Mainstream news publications (${plat.total} articles) report on the topic with ${plat.posRatio}% Positive and ${plat.negRatio}% Negative sentiment. Editorial articles establish public brand authority.`;
                      action = plat.posRatio >= 55
                        ? `Distribute these highly positive press links across your marketing channels, website press pages, and social media platforms to reinforce credibility.`
                        : plat.negRatio >= 35
                        ? `Prepare public PR statements addressing editorial critiques. Reach out to journalists with updated facts or product rectifications.`
                        : `Draft media releases highlighting technical innovations to steer neutral reporting toward positive coverage.`;
                    }
                  }
                  
                  return (
                    <div 
                      key={plat.name} 
                      className="platform-summary-item-premium glass" 
                      style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        gap: '24px',
                        padding: '24px', 
                        borderRadius: '16px', 
                        marginBottom: '20px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {/* Left Part: Platform Label & Graph Bar stacked vertically */}
                      <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Name & Post Count on top */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="p-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colorAccent, boxShadow: `0 0 8px ${colorAccent}` }} />
                            <span className="p-name" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>{plat.name}</span>
                          </div>
                          <span className="p-count-total" style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '8px' }}>
                            {plat.total} posts
                          </span>
                        </div>

                        {/* Horizontal stacked bar representing Positive, Neutral, Negative */}
                        <div className="platform-bars-trio" style={{ 
                          display: 'flex', 
                          height: '24px', 
                          borderRadius: '0px', 
                          overflow: 'hidden', 
                          background: '#18181b', 
                          margin: '0px' 
                        }}>
                          {plat.total > 0 ? (
                            <>
                              <div className="p-bar-part pos" style={{ width: `${plat.posRatio}%`, backgroundColor: '#1D9E75' }} title={`Positive: ${plat.posRatio}%`} />
                              <div className="p-bar-part neu" style={{ width: `${plat.neuRatio}%`, backgroundColor: '#EF9F27' }} title={`Neutral: ${plat.neuRatio}%`} />
                              <div className="p-bar-part neg" style={{ width: `${plat.negRatio}%`, backgroundColor: '#E24B4A' }} title={`Negative: ${plat.negRatio}%`} />
                            </>
                          ) : (
                            <div style={{ width: '100%', backgroundColor: '#27272a' }} />
                          )}
                        </div>

                        {/* Percentages row */}
                        <div className="platform-pcts-row" style={{ fontSize: '0.88rem', display: 'flex', gap: '15px', color: '#cbd5e1', marginBottom: '4px' }}>
                          <span className="pct-part" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1D9E75' }} />
                            <strong>{plat.posRatio}%</strong> Positive
                          </span>
                          <span className="pct-part" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF9F27' }} />
                            <strong>{plat.neuRatio}%</strong> Neutral
                          </span>
                          <span className="pct-part" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E24B4A' }} />
                            <strong>{plat.negRatio}%</strong> Negative
                          </span>
                        </div>
                      </div>

                      {/* Right Part: Integrated Strategy Summary for this specific platform */}
                      <div style={{ flex: '1.4 1 380px' }}>
                        <div 
                          className="platform-insight-block glass" 
                          style={{ 
                            borderLeft: `4px solid ${colorAccent}`, 
                            background: 'rgba(255, 255, 255, 0.01)',
                            padding: '16px 20px',
                            borderRadius: '0 12px 12px 0',
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                            borderRight: '1px solid rgba(255,255,255,0.03)',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            margin: 0
                          }}
                        >
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 10px 0', color: '#cbd5e1' }}>
                            <strong>Diagnosis:</strong> {diagnosis}
                          </p>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0, color: '#94a3b8' }}>
                            <strong>Action Plan:</strong> {action}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'intensity': {
        const posts = data.posts || [];
        const totalPosts = posts.length || 1;
        
        let pos = 0, neu = 0, neg = 0;
        
        posts.forEach(p => {
          const label = p.label;
          if (label === 'Positive') {
            pos++;
          } else if (label === 'Negative') {
            neg++;
          } else {
            neu++;
          }
        });

        const posPct = Math.round((pos / totalPosts) * 100);
        const neuPct = Math.round((neu / totalPosts) * 100);
        const negPct = Math.round((neg / totalPosts) * 100);

        return (
          <div className="premium-summary-layout">
            <div className="premium-summary-header">
              <div className="header-icon-wrap intensity">
                <Thermometer size={24} />
              </div>
              <div>
                <h2>Platform Intensity Map</h2>
                <p className="subtitle">Sentiment concentration density across monitored network channels</p>
              </div>
            </div>

            {/* Visual Card (Side-by-side Activity & Intensity Heatmap + Info Panel) */}
            <div className="visual-card glass-panel" style={{ width: '100%', marginBottom: '30px' }}>
              <h3 className="card-heading">Activity & Intensity Heatmap</h3>
              <div className="heatmap-wrapper-grid">
                {/* Left Side: Heatmap Chart */}
                <div style={{ padding: '10px 0' }}>
                  <SentimentHeatmap data={data} height="45px" />
                </div>

                {/* Right Side: Heatmap Information & Legend */}
                <div className="heatmap-info-panel">
                  <h4 className="heatmap-info-title">Understanding the Intensity Map</h4>
                  <p className="heatmap-info-desc">
                    This heat map displays the concentration of sentiment across all monitored social channels. Each cell represents a specific platform and sentiment category.
                  </p>
                  
                  <div className="heatmap-legend-list">
                    <div className="heatmap-legend-item">
                      <span className="heatmap-legend-indicator pos" />
                      <div className="heatmap-legend-text">
                        <span className="heatmap-legend-label">Green (Positive) Intensity</span>
                        <p className="heatmap-legend-subtext">Brighter green highlights strong positive engagement and customer satisfaction on that channel.</p>
                      </div>
                    </div>
                    
                    <div className="heatmap-legend-item">
                      <span className="heatmap-legend-indicator neu" />
                      <div className="heatmap-legend-text">
                        <span className="heatmap-legend-label">Amber (Neutral) Intensity</span>
                        <p className="heatmap-legend-subtext">Brighter amber indicates informational posts, link shares, or balanced reviews on that channel.</p>
                      </div>
                    </div>

                    <div className="heatmap-legend-item">
                      <span className="heatmap-legend-indicator neg" />
                      <div className="heatmap-legend-text">
                        <span className="heatmap-legend-label">Red (Negative) Intensity</span>
                        <p className="heatmap-legend-subtext">Brighter red flags high concentration of friction, complaints, or public relations risks.</p>
                      </div>
                    </div>
                  </div>

                  <div className="heatmap-info-tip">
                    <strong>Interactive Tip:</strong> Hover over any block in the map to see the exact percentage and post volume details for that channel.
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Strategy Card */}
            <div className="premium-summary-footer glass-panel">
              <div className="footer-header">
                <ShieldAlert size={20} style={{ color: '#ef4444' }} />
                <h3>Crisis Prevention & Volume Optimization</h3>
              </div>
              <p className="footer-desc">Use the intensity heatmap to spot PR firestorms before they expand, or capitalize on highly positive hubs.</p>
              
              <div className="strategy-grid">
                <div className="strategy-item">
                  <div className="strategy-number red">1</div>
                  <div>
                    <h5>Spot Negative Hotspots (Negative Volume)</h5>
                    <p>If any cell in the "Neg" row is exceptionally bright, check that specific platform instantly. High density means complaints are replicating. Fast replies are required.</p>
                  </div>
                </div>

                <div className="strategy-item">
                  <div className="strategy-number green">2</div>
                  <div>
                    <h5>Leverage Positive Hotspots (Positive Volume)</h5>
                    <p>Bright cells in the "Pos" row show active product evangelists. Incentivize this channel with previews, exclusive AMAs, or referral rewards to scale word-of-mouth growth.</p>
                  </div>
                </div>

                <div className="strategy-item">
                  <div className="strategy-number amber">3</div>
                  <div>
                    <h5>Optimise Neutral Tiers (Neutral Volume)</h5>
                    <p>Neutral specification listings and objective link-sharing are highly convertable. Focus on standard critiques to transform neutral engagement into brand loyalists.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'aspects': {
        const aspectData = Object.entries(data.aspects).map(([k, v]) => ({
          aspect: k,
          val: v.pos_pct,
          total: v.total
        }));

        return (
          <div className="premium-summary-layout">
            <div className="premium-summary-header">
              <div className="header-icon-wrap aspects">
                <GridIcon size={24} />
              </div>
              <div>
                <h2>Feature Aspect Distribution</h2>
                <p className="subtitle">Sentiment rating breakdown across key product aspects (Value, Quality, Usability, Performance)</p>
              </div>
            </div>

            {/* Unified Aspect Distribution & Action Plan Container */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '35px', padding: '35px', width: '100%' }}>
              
              {/* Top Row: Score Info (Left) & Radar Graph (Right) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'stretch' }}>
                
                {/* Left Side: Score Info */}
                <div style={{ flex: '1.2 1 400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <h3 className="card-heading" style={{ margin: 0, paddingBottom: '10px' }}>Feature Performance Scores</h3>
                  <div className="explanation-block" style={{ margin: 0 }}>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e4e4e7' }}>
                      Rather than scoring the entire brand as a single entity, the AI segments feedback into specific product pillars. This pinpoints exactly where your quality shines and where user experience fails.
                    </p>
                  </div>
                  
                  <div className="aspect-summary-grid-in-page" style={{ marginTop: '10px' }}>
                    {aspectData.map((asp, idx) => {
                      const color = asp.val >= 60 ? '#1D9E75' : asp.val >= 40 ? '#EF9F27' : '#E24B4A';
                      const isLastAndOdd = aspectData.length % 2 !== 0 && idx === aspectData.length - 1;
                      return (
                        <div 
                          key={asp.aspect} 
                          className={`asp-item-page glass ${isLastAndOdd ? 'full-width' : ''}`}
                          style={{ 
                            padding: '15px',
                            gridColumn: isLastAndOdd ? 'span 2' : 'auto'
                          }}
                        >
                          <span className="asp-name" style={{ fontSize: '0.95rem' }}>{asp.aspect}</span>
                          <div className="asp-score-row-p">
                            <span className="asp-score-pct" style={{ color, fontSize: '1.5rem' }}>{asp.val}%</span>
                            <span className="asp-mentions">{asp.total} mentions</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Radar Chart */}
                <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '16px', padding: '20px', justifyContent: 'center' }}>
                  <h3 className="card-heading" style={{ margin: 0, paddingBottom: '10px' }}>Aspect Sentiment Radar</h3>
                  <div className="chart-wrapper" style={{ minHeight: '260px' }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={aspectData}>
                        <PolarGrid stroke="#2a2a2f" />
                        <PolarAngleAxis dataKey="aspect" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                        <Radar name="Positive Score" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '8px', color: '#fff' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Divider line */}
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

              {/* Bottom Row: Product Roadmap Priorities (Five Sections) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="footer-header" style={{ margin: 0 }}>
                  <TrendingUp size={20} className="highlight" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Product Roadmap Priorities</h3>
                </div>
                <p className="footer-desc" style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  We analyzed each mention to build a recommended priority list for your design and product roadmap.
                </p>
                
                <div className="aspect-priority-cards">
                  {aspectData.map((asp) => {
                    let priority = "Medium";
                    let recommendation = "";
                    let borderStyle = "1px solid #2a2a2f";

                    if (asp.val >= 70) {
                      priority = "Low Priority (Maintain)";
                      borderStyle = "1px solid rgba(29, 158, 117, 0.3)";
                      recommendation = `Users are highly satisfied with the product's ${asp.aspect}. Showcase this aspect in marketing materials and product brochures. Excellent job!`;
                    } else if (asp.val >= 45) {
                      priority = "Medium Priority (Refine)";
                      borderStyle = "1px solid rgba(239, 159, 39, 0.3)";
                      recommendation = `Satisfaction for ${asp.aspect} is moderate. Keep gathering qualitative comments to identify specific features to polish and improve.`;
                    } else {
                      priority = "HIGH PRIORITY (Rebuild)";
                      borderStyle = "1px solid rgba(226, 75, 74, 0.4)";
                      recommendation = `ALERT: Critical user frustration detected around ${asp.aspect}. This is driving the majority of negative brand discussions. Schedule immediate reviews.`;
                    }

                    return (
                      <div key={asp.aspect} className="asp-priority-card glass" style={{ border: borderStyle, padding: '20px' }}>
                        <div className="p-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>{asp.aspect}</h4>
                          <span className="p-badge" style={{ 
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            backgroundColor: asp.val >= 70 ? 'rgba(29, 158, 117, 0.15)' : asp.val >= 45 ? 'rgba(239, 159, 39, 0.15)' : 'rgba(226, 75, 74, 0.15)',
                            color: asp.val >= 70 ? '#1D9E75' : asp.val >= 45 ? '#EF9F27' : '#E24B4A',
                            display: 'inline-block'
                          }}>{priority}</span>
                        </div>
                        <p className="p-rec" style={{ margin: 0, fontSize: '0.88rem', color: '#a1a1aa', lineHeight: 1.4 }}>{recommendation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        );
      }

      case 'confidence': {
        const confidenceData = data.posts.slice(-30).map((p, i) => ({ 
          index: i + 1, 
          val: Math.round(p.confidence * 100),
          label: p.label
        }));
        
        const avgConf = Math.round(data.summary.avg_confidence * 100);

        return (
          <div className="premium-summary-layout">
            <div className="premium-summary-header">
              <div className="header-icon-wrap confidence">
                <Activity size={24} />
              </div>
              <div>
                <h2>AI Classification Confidence Flow</h2>
                <p className="subtitle">Tracks prediction accuracy levels and deep learning classification metrics over the timeline</p>
              </div>
            </div>

            <div className="premium-summary-grid">
              {/* Visual Card */}
              <div className="visual-card glass-panel">
                <h3 className="card-heading">Model Confidence Timeline (Last 30 Posts)</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={confidenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2f" />
                      <XAxis dataKey="index" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '8px', color: '#fff' }}
                        formatter={(value, name, props) => [`${value}% Confidence`, `Sentiment: ${props.payload.label}`]}
                      />
                      <Line type="monotone" dataKey="val" name="Confidence" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 3, fill: '#0d0d0f' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights Card */}
              <div className="insights-card glass-panel">
                <h3 className="card-heading">Confidence Overview</h3>
                
                <div className="pulse-score-row">
                  <div className="pulse-score-val" style={{ color: '#3b82f6' }}>
                    {avgConf}%
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Average AI Confidence</h4>
                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.85rem' }}>Classifier certainty rating</p>
                  </div>
                </div>

                <div className="explanation-block">
                  <p>
                    <strong>Confidence Flow</strong> indicates how sure the AI model is about its sentiment classification for each post.
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    <strong>Why AI confidence varies:</strong>
                  </p>
                  <ul style={{ paddingLeft: '20px', marginTop: '10px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                    <li style={{ marginBottom: '6px' }}><strong style={{ color: '#ffffff' }}>High Confidence (80% - 100%):</strong> Clear, objective, emotion-rich comments (e.g. "This product is absolutely amazing, best ever!").</li>
                    <li style={{ marginBottom: '6px' }}><strong style={{ color: '#ffffff' }}>Low Confidence (50% - 79%):</strong> Subtle phrasings, double meanings, mixed reviews ("It works okay but screen is dim"), or sarcastic remarks.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>
            <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '20px' }} />
            <h3>Summary Page not found</h3>
            <p>Please return to the dashboard and try again.</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="summary-page container"
      style={{ paddingBottom: '80px' }}
    >
      <div className="back-bar" style={{ margin: '30px 0 20px' }}>
        <button className="btn-back-premium" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
      
      <div className="premium-summary-container">
        {renderSummary()}
      </div>

      <style jsx>{`
        .heatmap-wrapper-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 30px;
          align-items: center;
        }

        .heatmap-info-panel {
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          padding-left: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .heatmap-info-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        .heatmap-info-desc {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #a1a1aa;
          margin: 0;
        }

        .heatmap-legend-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 10px 0;
        }

        .heatmap-legend-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .heatmap-legend-indicator {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          margin-top: 3px;
          flex-shrink: 0;
        }

        .heatmap-legend-indicator.pos {
          background-color: #1D9E75;
          box-shadow: 0 0 10px rgba(29, 158, 117, 0.4);
        }

        .heatmap-legend-indicator.neu {
          background-color: #EF9F27;
          box-shadow: 0 0 10px rgba(239, 159, 39, 0.4);
        }

        .heatmap-legend-indicator.neg {
          background-color: #E24B4A;
          box-shadow: 0 0 10px rgba(226, 75, 74, 0.4);
        }

        .heatmap-legend-text {
          display: flex;
          flex-direction: column;
        }

        .heatmap-legend-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: #e4e4e7;
        }

        .heatmap-legend-subtext {
          font-size: 0.80rem;
          color: #71717a;
          margin: 2px 0 0 0;
        }

        .heatmap-info-tip {
          font-size: 0.85rem;
          color: #a1a1aa;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
          margin-top: 5px;
        }

        @media (max-width: 900px) {
          .heatmap-wrapper-grid {
            grid-template-columns: 1fr;
          }
          .heatmap-info-panel {
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-left: 0;
            padding-top: 25px;
          }
        }

        .premium-summary-container {
          background: linear-gradient(145deg, #16161a 0%, #0d0d0f 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border-radius: 24px;
          padding: 40px;
          color: #e4e4e7;
        }

        .btn-back-premium {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #a1a1aa;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-back-premium:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #3b82f6;
          color: #fff;
          transform: translateX(-4px);
        }

        .premium-summary-layout {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .premium-summary-header {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 25px;
        }

        .header-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .header-icon-wrap.sentiment { background: linear-gradient(135deg, #10b981, #059669); }
        .header-icon-wrap.platform { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .header-icon-wrap.intensity { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .header-icon-wrap.aspects { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .header-icon-wrap.confidence { background: linear-gradient(135deg, #ec4899, #db2777); }

        .premium-summary-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .premium-summary-header .subtitle {
          color: #a1a1aa;
          font-size: 0.95rem;
          margin: 4px 0 0 0;
        }

        .premium-summary-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 30px;
        }

        @media (max-width: 900px) {
          .premium-summary-grid {
            grid-template-columns: 1fr;
          }
        }

        .glass-panel {
          background: rgba(22, 22, 26, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .card-heading {
          font-size: 1.1rem;
          font-weight: 600;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 20px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
        }

        .chart-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 260px;
        }

        .legend-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 15px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-name {
          color: #a1a1aa;
        }

        .legend-val {
          font-weight: 600;
          color: #fff;
        }

        .pulse-score-row {
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 15px 25px;
          border-radius: 16px;
          margin-bottom: 25px;
        }

        .pulse-score-val {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1;
        }

        .explanation-block {
          color: #d4d4d8;
          font-size: 1rem;
          line-height: 1.6;
        }

        .summary-stat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 25px;
        }

        .mini-stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 15px 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mini-stat-card .stat-num {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .mini-stat-card .stat-num.green { color: #1D9E75; }
        .mini-stat-card .stat-num.amber { color: #EF9F27; }
        .mini-stat-card .stat-num.red { color: #E24B4A; }

        .mini-stat-card .stat-label {
          font-size: 0.8rem;
          color: #a1a1aa;
          text-transform: uppercase;
        }

        .footer-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .footer-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .footer-desc {
          color: #a1a1aa;
          font-size: 0.95rem;
          margin: 0 0 25px 0;
        }

        .keyword-split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .keyword-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .keyword-pill-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 20px;
        }

        .keyword-pill-box h4 {
          margin: 0 0 15px 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .keyword-pill-box.positive h4 { color: #1D9E75; }
        .keyword-pill-box.negative h4 { color: #E24B4A; }

        .keywords-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .k-pill {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .k-pill.pos {
          background: rgba(29, 158, 117, 0.1);
          border: 1px solid rgba(29, 158, 117, 0.2);
          color: #55d6a2;
        }

        .k-pill.neg {
          background: rgba(226, 75, 74, 0.1);
          border: 1px solid rgba(226, 75, 74, 0.2);
          color: #fca5a5;
        }

        .k-count {
          opacity: 0.5;
          font-size: 0.75rem;
          font-family: 'DM Mono';
        }

        .actionable-guide {
          background: rgba(59, 130, 246, 0.03);
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 16px;
          padding: 25px;
        }

        .actionable-guide h4 {
          margin: 0 0 15px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #60a5fa;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .guide-list {
          padding-left: 20px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: #d4d4d8;
        }

        .green-text { color: #1D9E75; }
        .red-text { color: #E24B4A; }
        .amber-text { color: #EF9F27; }

        .platform-summary-item-premium {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 15px 0;
        }

        .platform-summary-item-premium:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .platform-meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .p-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .p-count-total {
          color: #a1a1aa;
          font-size: 0.85rem;
        }

        .platform-bars-trio {
          display: flex;
          height: 8px;
          border-radius: 0px;
          overflow: hidden;
          background: #111114;
          margin-bottom: 6px;
        }

        .p-bar-part {
          height: 100%;
          transition: width 0.3s ease;
        }

        .p-bar-part.pos { background-color: #1D9E75; }
        .p-bar-part.neu { background-color: #EF9F27; }
        .p-bar-part.neg { background-color: #E24B4A; }

        .platform-pcts-row {
          display: flex;
          gap: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .platform-insights-breakdown {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }

        .platform-insight-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 20px;
          border-radius: 16px;
        }

        .platform-block-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 6px;
        }

        .strategy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }

        .strategy-item {
          display: flex;
          gap: 15px;
          background: rgba(255, 255, 255, 0.02);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .strategy-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .strategy-number.red { background: rgba(226, 75, 74, 0.15); color: #E24B4A; border: 1px solid rgba(226, 75, 74, 0.3); }
        .strategy-number.green { background: rgba(29, 158, 117, 0.15); color: #1D9E75; border: 1px solid rgba(29, 158, 117, 0.3); }
        .strategy-number.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
        .strategy-number.amber { background: rgba(239, 159, 39, 0.15); color: #EF9F27; border: 1px solid rgba(239, 159, 39, 0.3); }

        .strategy-item h5 {
          margin: 0 0 6px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .strategy-item p {
          color: #a1a1aa;
          font-size: 0.88rem;
          line-height: 1.4;
          margin: 0;
        }

        .aspect-summary-grid-in-page {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 15px;
        }

        @media (max-width: 480px) {
          .aspect-summary-grid-in-page {
            grid-template-columns: 1fr;
          }
          .asp-item-page.full-width {
            grid-column: span 1 !important;
          }
        }

        .asp-item-page {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 20px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .asp-name {
          font-weight: 600;
          font-size: 1.05rem;
          color: #a1a1aa;
        }

        .asp-score-row-p {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .asp-score-pct {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .asp-mentions {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .aspect-priority-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .asp-priority-card {
          background: rgba(255, 255, 255, 0.02);
          padding: 20px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .asp-priority-card .p-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .asp-priority-card h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .asp-priority-card .p-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .asp-priority-card .p-rec {
          color: #a1a1aa;
          font-size: 0.88rem;
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
    </motion.div>
  );
};

export default SummaryPage;
