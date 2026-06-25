import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line
} from "recharts";
import {
  PieChart as PieIcon, LineChart as LineIcon,
  LayoutGrid, Thermometer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import SentimentHeatmap from "../charts/SentimentHeatmap";
import ConfidenceTrend from "../charts/ConfidenceTrend";
import ReportCenter from "../dashboard/ReportCenter";
import AIAssistant from "../dashboard/AIAssistant";

export default function AnalyzePage({
  platform, setPlatform,
  query, setQuery,
  loading, cancelAnalyze, analyze, reAnalyze,
  trending, data, setLoading
}) {
  const navigate = useNavigate();
  const scoreColor = (pct) => pct >= 60 ? "#1D9E75" : pct >= 40 ? "#EF9F27" : "#E24B4A";

  return (
    <>
      <div className="hero">
        <h2 className="hero-title">AI-Powered <span className="highlight">Sentiment Insights</span></h2>
        <p className="hero-sub">Fast, Batch-processed BERT analysis across multiple sources</p>
        <div className="search-wrap">
          <select className="platform-select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="all">All Platforms</option>
            <option value="twitter">Twitter/X</option>
            <option value="reddit">Reddit</option>
            <option value="youtube">YouTube</option>
            <option value="hackernews">HackerNews</option>
            <option value="news">NewsAPI</option>
          </select>
          <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search brand or product...' onKeyDown={(e) => e.key === "Enter" && (loading ? cancelAnalyze() : analyze())} />
          <button className={`btn-primary large ${loading ? "btn-stop" : ""}`} onClick={loading ? cancelAnalyze : analyze}>
            {loading ? "Stop" : "Analyze →"}
          </button>
        </div>
        {trending.length > 0 && !loading && (
          <div className="trending">
            <span className="trending-label">Trending Search:</span>
            {trending.slice(0, 5).map((t, idx) => (
              <button 
                key={idx} 
                className="trend-chip" 
                onClick={() => reAnalyze(t.query)}
              >
                {t.query}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="analysis-loader-container">
            <div className="spinner-large" />
            <p className="loading-text">Analyzing "{query}" across platforms... please wait</p>
          </div>
        )}
      </div>

      {data && (
        <motion.div id="dashboard-to-print" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-v2" style={{ padding: '20px', background: '#0d0d0f' }}>
          <div className="score-banner">
            <div className="score-left">
              <p className="score-query">"{data.query}"</p>
              <p className="score-sub">{data.total} data points batch-processed</p>
            </div>
            <div className="score-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="score-circle" style={{ borderColor: scoreColor(data.summary.pos_pct) }}>
                <span className="score-num" style={{ color: scoreColor(data.summary.pos_pct) }}>{data.summary.pos_pct}</span>
                <span className="score-label">Pulse Score</span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Positive</p>
              <p className="stat-val green">{data.summary.pos_pct}%</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Neutral</p>
              <p className="stat-val">{data.summary.neutral_pct || 0}%</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Negative</p>
              <p className="stat-val red">{data.summary.neg_pct}%</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Analyzed</p>
              <p className="stat-val">{data.total}</p>
            </div>
          </div>

          <div className="full-width-section">
            <h2 className="section-title">Sentiment Velocity</h2>
            <div className="charts-grid-enhanced">
              <div className="chart-card-premium clickable platform-distribution-card" onClick={() => navigate('/summary/platform')} style={{ cursor: 'pointer' }}>
                <div className="chart-header">
                  <div className="chart-title-wrap">
                    <LayoutGrid className="chart-icon" size={18} />
                    <h3 className="chart-title">Platform Distribution</h3>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(data.platform_stats).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), pos: v.positive, neu: v.neutral || 0, neg: v.negative }))}>
                    <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f' }} />
                    <Bar dataKey="pos" name="Positive" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="neu" name="Neutral" fill="#EF9F27" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="neg" name="Negative" fill="#E24B4A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-footer">Click for detailed platform breakdown →</div>
              </div>
              <div className="chart-card-premium clickable confidence-flow-card" onClick={() => navigate('/summary/confidence')} style={{ cursor: 'pointer' }}>
                <div className="chart-header">
                  <div className="chart-title-wrap">
                    <LineIcon className="chart-icon" size={18} />
                    <h3 className="chart-title">Confidence Flow</h3>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.posts.slice(-30).map((p, i) => ({ index: i, val: Math.round(p.confidence * 100) }))}>
                    <XAxis dataKey="index" hide />
                    <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f' }} />
                    <Line type="monotone" dataKey="val" name="Confidence" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="chart-footer">Click for dynamic AI certainty logs →</div>
              </div>
            </div>
            <ConfidenceTrend posts={data.posts} />
          </div>

          <div className="dashboard-grid-v2">
            <div className="chart-card-premium clickable global-sentiment-card" onClick={() => navigate('/summary/sentiment')} style={{ cursor: 'pointer' }}>
              <div className="chart-header">
                <PieIcon size={18} className="chart-icon" />
                <h3 className="chart-title">Global Sentiment</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pos', value: data.summary.positive },
                      { name: 'Neg', value: data.summary.negative },
                      { name: 'Neu', value: data.summary.neutral }
                    ]}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1.5 }}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 15;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      const colors = { Pos: '#1D9E75', Neg: '#E24B4A', Neu: '#EF9F27' };
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
                    <Cell fill="#1D9E75" /><Cell fill="#E24B4A" /><Cell fill="#EF9F27" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-footer">Click for detailed breakdown →</div>
            </div>

            <div className="chart-card-premium clickable platform-intensity-card" onClick={() => navigate('/summary/intensity')} style={{ cursor: 'pointer' }}>
              <div className="chart-header">
                <Thermometer size={18} className="chart-icon" />
                <h3 className="chart-title">Platform Intensity</h3>
              </div>
              <SentimentHeatmap data={data} />
              <div className="chart-footer">Click for platform activity map →</div>
            </div>

            <div className="chart-card-premium clickable aspect-distribution-card" onClick={() => navigate('/summary/aspects')} style={{ cursor: 'pointer' }}>
              <div className="chart-header">
                <LayoutGrid size={18} className="chart-icon" />
                <h3 className="chart-title">Aspect Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={Object.entries(data.aspects).map(([k, v]) => ({ aspect: k, val: v.pos_pct }))}>
                  <PolarGrid stroke="#2a2a2f" />
                  <PolarAngleAxis dataKey="aspect" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                  <Radar name="Positive%" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Tooltip
                    contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '8px', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="chart-footer">Click for aspect priority details →</div>
            </div>
          </div>
          <ReportCenter data={data} onLoading={setLoading} />
        </motion.div>
      )}

      <AIAssistant contextData={data} />
    </>
  );
}
