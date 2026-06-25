import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const ConfidenceTrend = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  const data = posts.map((p, i) => ({
    index: i,
    confidence: Math.round(p.confidence * 100),
    // Fix: use p.label (guaranteed to exist) instead of p.score (may be undefined)
    sentiment: p.label === 'Positive' ? 100 : p.label === 'Negative' ? 0 : 50
  }));

  return (
    <div className="full-width-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Global Sentiment & Confidence Flow</h3>
        <p className="chart-subtitle">Real-time model certainty analysis</p>
      </div>
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2f" vertical={false} opacity={0.5} />
            <XAxis dataKey="index" hide />
            <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              itemStyle={{ fontSize: '12px', fontWeight: '600' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area 
              type="monotone" 
              dataKey="confidence" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorConf)" 
              strokeWidth={3}
              name="AI Confidence %"
            />
            <Area 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorSent)" 
              strokeWidth={3}
              name="Sentiment Impact"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConfidenceTrend;
