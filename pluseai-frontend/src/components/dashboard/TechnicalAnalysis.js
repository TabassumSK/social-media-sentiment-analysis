import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Wind, Grid, Activity, Info, PieChart, BarChart as BarChartIcon, Download, Database, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const TechnicalAnalysis = ({ data, token, preFetched, refetch }) => {
  const query = data?.query;
  const [wcUrl, setWcUrl] = useState(null);
  const [hmUrl, setHmUrl] = useState(null);
  const [cmUrl, setCmUrl] = useState(null);
  const [trUrl, setTrUrl] = useState(null);
  const [pieUrl, setPieUrl] = useState(null);
  const [stackedUrl, setStackedUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      if (preFetched && preFetched.query === query) {
        if (preFetched.loading) {
          setLoading(true);
        } else if (preFetched.wc) {
          setWcUrl(preFetched.wc);
          setHmUrl(preFetched.hm);
          setCmUrl(preFetched.cm);
          setTrUrl(preFetched.tr);
          setPieUrl(preFetched.pie);
          setStackedUrl(preFetched.stacked);
          setLoading(false);
        } else {
          fetchReports();
        }
      } else {
        fetchReports();
      }
    }
  }, [query, preFetched]);

  const fetchReports = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const fetchImage = async (endpoint) => {
        const res = await fetch(`${API}${endpoint}`, { headers });
        if (!res.ok) throw new Error("Failed to fetch image");
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      };

      const [wc, hm, cm, tr, pie, stacked] = await Promise.all([
        fetchImage(`/visualize/wordcloud?query=${encodeURIComponent(query)}`),
        fetchImage(`/visualize/heatmap?query=${encodeURIComponent(query)}`),
        fetchImage(`/visualize/confusion-matrix`),
        fetchImage(`/visualize/trend?query=${encodeURIComponent(query)}`),
        fetchImage(`/visualize/pie?query=${encodeURIComponent(query)}`),
        fetchImage(`/visualize/stacked-bar?query=${encodeURIComponent(query)}`)
      ]);

      setWcUrl(wc);
      setHmUrl(hm);
      setCmUrl(cm);
      setTrUrl(tr);
      setPieUrl(pie);
      setStackedUrl(stacked);

    } catch (err) {
      console.error("Failed to fetch technical reports", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `PulseAI_${name}_${query.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFullReportPDF = () => {
    if (!data) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    
    // Page Header
    pdf.setFillColor(15, 23, 42); // slate-900 background for top banner
    pdf.rect(0, 0, width, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("PulseAI - Technical Performance Report", 15, 20);
    
    // Sub-info
    pdf.setTextColor(71, 85, 105); // slate-600
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Query Target: "${data.query}"`, 15, 38);
    pdf.text(`Generated On: ${new Date().toLocaleString()}`, 15, 44);
    pdf.text(`Total Aggregated Samples: ${data.total}`, 15, 50);
    
    // Horizontal Line
    pdf.setDrawColor(226, 232, 240); // border-slate-200
    pdf.line(15, 54, width - 15, 54);
    
    let y = 62;
    
    // Section 1: Executive Summary Values
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("1. Executive Summary Statistics", 15, y);
    
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    
    pdf.text(`Positive Sentiment:  ${data.summary.pos_pct}% (${data.summary.positive} mentions)`, 20, y);
    pdf.text(`Neutral Sentiment:   ${data.summary.neutral_pct || 0}% (${data.summary.neutral || 0} mentions)`, 20, y + 6);
    pdf.text(`Negative Sentiment:  ${data.summary.neg_pct}% (${data.summary.negative} mentions)`, 20, y + 12);
    pdf.text(`Average NLP Model Confidence: ${(data.summary.avg_confidence * 100).toFixed(2)}%`, 20, y + 18);
    
    y += 28;
    
    // Section 2: Platform breakdown table
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("2. Platform Sentiment Distribution", 15, y);
    
    y += 8;
    // Draw Table Header
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(15, y, width - 30, 8, 'F');
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.rect(15, y, width - 30, 8, 'D');
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Platform", 18, y + 5.5);
    pdf.text("Total", 60, y + 5.5);
    pdf.text("Positive %", 90, y + 5.5);
    pdf.text("Neutral %", 125, y + 5.5);
    pdf.text("Negative %", 160, y + 5.5);
    
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    
    Object.entries(data.platform_stats || {}).forEach(([platformName, stats]) => {
      // Draw Row Border
      pdf.rect(15, y, width - 30, 8, 'D');
      
      const posPct = stats.total > 0 ? ((stats.positive / stats.total) * 100).toFixed(1) : "0.0";
      const neuPct = stats.total > 0 ? (((stats.neutral || 0) / stats.total) * 100).toFixed(1) : "0.0";
      const negPct = stats.total > 0 ? ((stats.negative / stats.total) * 100).toFixed(1) : "0.0";
      
      pdf.text(platformName.toUpperCase(), 18, y + 5.5);
      pdf.text(stats.total.toString(), 60, y + 5.5);
      pdf.text(`${posPct}%`, 90, y + 5.5);
      pdf.text(`${neuPct}%`, 125, y + 5.5);
      pdf.text(`${negPct}%`, 160, y + 5.5);
      
      y += 8;
    });
    
    y += 8;
    
    // Section 3: Aspect Sentiment analysis table
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("3. Aspect-Based Performance breakdown", 15, y);
    
    y += 8;
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, y, width - 30, 8, 'F');
    pdf.rect(15, y, width - 30, 8, 'D');
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Aspect Metric", 18, y + 5.5);
    pdf.text("Mentions", 60, y + 5.5);
    pdf.text("Positive Feedback %", 90, y + 5.5);
    pdf.text("Negative Feedback %", 145, y + 5.5);
    
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    
    Object.entries(data.aspects || {}).forEach(([aspectName, stats]) => {
      pdf.rect(15, y, width - 30, 8, 'D');
      pdf.text(aspectName, 18, y + 5.5);
      pdf.text(stats.total.toString(), 60, y + 5.5);
      pdf.text(`${stats.pos_pct}%`, 90, y + 5.5);
      pdf.text(`${stats.neg_pct}%`, 145, y + 5.5);
      y += 8;
    });
    
    // Add page 2 for Keywords & Sample Posts
    pdf.addPage();
    
    // Page 2 header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, width, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("PulseAI - Technical Performance Report (Cont.)", 15, 10);
    
    y = 28;
    
    // Section 4: Sentiment Drivers (Keywords)
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("4. Sentiment Driver Keywords", 15, y);
    
    y += 8;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Top Positive Drivers:", 20, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(29, 158, 117); // Green text
    const posKwList = (data.pos_keywords || []).slice(0, 8).map(k => `${k.word} (${k.count})`).join(', ');
    pdf.text(posKwList || 'None detected', 20, y + 5, { maxWidth: width - 35 });
    
    y += 18;
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.text("Top Negative Drivers:", 20, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(226, 75, 74); // Red text
    const negKwList = (data.neg_keywords || []).slice(0, 8).map(k => `${k.word} (${k.count})`).join(', ');
    pdf.text(negKwList || 'None detected', 20, y + 5, { maxWidth: width - 35 });
    
    y += 22;
    
    // Section 5: Labeled raw sample posts
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("5. Sample Analysis Log (Raw Post Extracts)", 15, y);
    
    y += 8;
    
    // Headers for logs
    pdf.setFillColor(241, 245, 249);
    pdf.rect(15, y, width - 30, 8, 'F');
    pdf.rect(15, y, width - 30, 8, 'D');
    
    pdf.setFontSize(9);
    pdf.text("Platform", 18, y + 5.5);
    pdf.text("Classification", 45, y + 5.5);
    pdf.text("Conf.", 75, y + 5.5);
    pdf.text("Sample Content Extract", 95, y + 5.5);
    
    y += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    
    (data.posts || []).slice(0, 15).forEach(post => {
      // check if we are going off-page
      if (y + 10 > height) {
        pdf.addPage();
        // Page background header
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, width, 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("PulseAI - Technical Performance Report (Cont.)", 15, 10);
        
        y = 25;
        
        // Redraw headers
        pdf.setFillColor(241, 245, 249);
        pdf.rect(15, y, width - 30, 8, 'F');
        pdf.rect(15, y, width - 30, 8, 'D');
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(9);
        pdf.text("Platform", 18, y + 5.5);
        pdf.text("Classification", 45, y + 5.5);
        pdf.text("Conf.", 75, y + 5.5);
        pdf.text("Sample Content Extract", 95, y + 5.5);
        
        y += 8;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
      }
      
      pdf.rect(15, y, width - 30, 8, 'D');
      
      const cleanTextStr = post.text.replace(/\s+/g, ' ').substring(0, 60) + '...';
      pdf.text(post.platform.toUpperCase(), 18, y + 5.5);
      
      // color code sentiment label
      if (post.label === 'Positive') pdf.setTextColor(29, 158, 117);
      else if (post.label === 'Negative') pdf.setTextColor(226, 75, 74);
      else pdf.setTextColor(150, 100, 30);
      
      pdf.text(post.label, 45, y + 5.5);
      
      pdf.setTextColor(71, 85, 105);
      pdf.text(`${(post.confidence * 100).toFixed(1)}%`, 75, y + 5.5);
      pdf.text(cleanTextStr, 95, y + 5.5);
      
      y += 8;
    });
    
    pdf.save(`PulseAI_Technical_Report_${data.query.replace(/\s+/g, '_')}.pdf`);
  };

  if (!query) {
    return (
      <div className="technical-empty">
        <Info size={48} className="muted-icon" />
        <h3>No Analysis Data</h3>
        <p>Please perform a search in the Analyze section first to generate technical reports.</p>
      </div>
    );
  }

  const reports = [
    { id: 'pie', title: 'Sentiment Distribution', icon: <PieChart size={20} />, url: pieUrl, desc: 'Overall percentage of Positive, Negative, and Neutral sentiment across the entire dataset.' },
    { id: 'stacked', title: 'Platform Breakdown', icon: <BarChartIcon size={20} />, url: stackedUrl, desc: 'Stacked bar chart showing volume and sentiment ratio per social platform.' },
    { id: 'wc', title: 'Word Cloud Analysis', icon: <Wind size={20} />, url: wcUrl, desc: 'Text density visualization representing the most frequent terms found across all analyzed posts.' },
    { id: 'hm', title: 'Platform Heatmap', icon: <Grid size={20} />, url: hmUrl, desc: 'Cross-platform sentiment distribution heatmap showing classification frequency.' },
    { id: 'tr', title: 'Confidence Trend', icon: <Activity size={20} />, url: trUrl, desc: 'Chronological distribution of model confidence across the analyzed sample set.' },
    { id: 'cm', title: 'Confusion Matrix', icon: <Activity size={20} />, url: cmUrl, desc: 'Evaluation matrix for the BERT sentiment classifier (Validation performance).' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="technical-analysis-container">
      <div className="technical-header">
        <div className="header-badge">Technical Report</div>
        <h2 className="technical-title">Model Output & Visualizations</h2>
        <p className="technical-subtitle">Raw analysis results for {query} generated by Matplotlib and Seaborn</p>
        
        <div style={{ marginTop: '24px' }}>
          <button 
            className="btn-download-full-report" 
            onClick={downloadFullReportPDF}
            disabled={loading}
          >
            <Download size={16} />
            <span>Download Full Technical Report (PDF)</span>
          </button>
        </div>
      </div>

      <div className="technical-content-grid">
        
        {/* Executive summary card grid */}
        <section className="tech-section-summary">
          <div className="tech-card card-kpi">
            <div className="card-kpi-icon total"><Database size={20} /></div>
            <div className="card-kpi-info">
              <span className="card-kpi-label">Aggregated Mentions</span>
              <span className="card-kpi-value">{data.total}</span>
              <span className="card-kpi-sub">Across all feeds</span>
            </div>
          </div>
          
          <div className="tech-card card-kpi">
            <div className="card-kpi-icon confidence"><ShieldCheck size={20} /></div>
            <div className="card-kpi-info">
              <span className="card-kpi-label">Avg NLP Confidence</span>
              <span className="card-kpi-value">{(data.summary.avg_confidence * 100).toFixed(1)}%</span>
              <span className="card-kpi-sub">Classifier certainty</span>
            </div>
          </div>

          <div className="tech-card card-kpi sentiment-pos">
            <div className="card-kpi-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-kpi-label">Positive</span>
                <span className="badge pos">{data.summary.pos_pct}%</span>
              </div>
              <span className="card-kpi-value positive">{data.summary.positive}</span>
              <span className="card-kpi-sub font-mono">{data.summary.pos_pct}% Ratio</span>
            </div>
          </div>

          <div className="tech-card card-kpi sentiment-neu">
            <div className="card-kpi-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-kpi-label">Neutral</span>
                <span className="badge neu">{data.summary.neutral_pct || 0}%</span>
              </div>
              <span className="card-kpi-value neutral">{data.summary.neutral || 0}</span>
              <span className="card-kpi-sub font-mono">{data.summary.neutral_pct || 0}% Ratio</span>
            </div>
          </div>

          <div className="tech-card card-kpi sentiment-neg">
            <div className="card-kpi-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-kpi-label">Negative</span>
                <span className="badge neg">{data.summary.neg_pct}%</span>
              </div>
              <span className="card-kpi-value negative">{data.summary.negative}</span>
              <span className="card-kpi-sub font-mono">{data.summary.neg_pct}% Ratio</span>
            </div>
          </div>
        </section>

      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Generating high-resolution reports...</p>
        </div>
      ) : (
        <div id="technical-report-to-print" className="reports-grid-raw" style={{ padding: '20px', background: '#0a0a0f' }}>
          {reports.map((report) => (
            <section key={report.id} className="report-section-raw">
              <div className="report-top-bar">
                <div className="report-label">
                  {report.icon}
                  <span>{report.title}</span>
                </div>
                <button 
                  className="btn-download-raw" 
                  onClick={() => downloadImage(report.url, report.title.replace(/\s+/g, '_'))}
                  title="Download Image"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>
              <div className="image-container-raw">
                {report.url ? <img src={report.url} alt={report.title} /> : <div className="img-placeholder">Generating...</div>}
              </div>
              <div className="report-desc">
                <p>{report.desc}</p>
              </div>
            </section>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .technical-analysis-container { padding: 40px 0; color: #e4e4e7; }
        .technical-header { margin-bottom: 40px; text-align: center; }
        .header-badge { display: inline-block; padding: 4px 12px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .technical-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 10px; }
        .technical-subtitle { color: #a1a1aa; font-size: 1.1rem; }
        .btn-download-full-report { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border: none; padding: 12px 28px; border-radius: 30px; cursor: pointer; font-size: 0.95rem; font-weight: 700; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25); transition: all 0.25s ease; }
        .btn-download-full-report:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(59, 130, 246, 0.35); }
        .btn-download-full-report:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .technical-content-grid {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding: 0 10px;
          margin-bottom: 40px;
        }
        .tech-section-summary {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          padding: 20px;
          background: #101014;
          border: 1px solid #2a2a2f;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        @media (max-width: 1024px) {
          .tech-section-summary {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .tech-section-summary {
            grid-template-columns: 1fr;
          }
        }
        .tech-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #2a2a2f;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: border-color 0.2s;
        }
        .tech-card:hover {
          border-color: #3b82f6;
        }
        .card-kpi-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .card-kpi-icon.total {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
        .card-kpi-icon.confidence {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }
        .card-kpi-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-kpi-label {
          font-size: 0.75rem;
          color: #a1a1aa;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .card-kpi-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
        }
        .card-kpi-value.positive { color: #1d9e75; }
        .card-kpi-value.neutral { color: #f59e0b; }
        .card-kpi-value.negative { color: #e24b4a; }
        .card-kpi-sub {
          font-size: 0.72rem;
          color: #71717a;
          margin-top: 4px;
        }
        .badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 12px;
        }
        .badge.pos { background: rgba(29, 158, 117, 0.15); color: #1d9e75; border: 1px solid rgba(29, 158, 117, 0.2); }
        .badge.neu { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge.neg { background: rgba(226, 75, 74, 0.15); color: #e24b4a; border: 1px solid rgba(226, 75, 74, 0.2); }
        .font-mono { font-family: 'DM Mono', monospace; }

        .reports-grid-raw { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; max-width: 1000px; margin: 0 auto; }
        @media (max-width: 768px) {
          .reports-grid-raw { grid-template-columns: 1fr; }
        }
        .report-section-raw { background: #16161a; border: 1px solid #2a2a2f; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: transform 0.3s ease; }
        .report-section-raw:hover { transform: translateY(-5px); border-color: #3b82f6; }
        .report-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .report-label { display: flex; align-items: center; gap: 10px; color: #3b82f6; font-weight: 600; font-size: 1.1rem; }
        .btn-download-raw { display: flex; align-items: center; gap: 8px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
        .btn-download-raw:hover { background: #3b82f6; color: white; }
        .image-container-raw { background: white; border-radius: 12px; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 250px; }
        .image-container-raw img { max-width: 100%; height: auto; }
        .img-placeholder { color: #52525b; font-style: italic; }
        .report-desc { margin-top: 15px; color: #a1a1aa; line-height: 1.5; font-size: 0.95rem; }
        .technical-empty { text-align: center; padding: 100px 0; color: #52525b; }
        .muted-icon { margin-bottom: 20px; opacity: 0.3; }
        .spinner-large { width: 50px; height: 50px; border: 4px solid rgba(59, 130, 246, 0.1); border-left-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-state { text-align: center; padding: 60px; }
      `}</style>
    </motion.div>
  );
};

export default TechnicalAnalysis;
