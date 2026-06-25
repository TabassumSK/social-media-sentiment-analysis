import React from 'react';
import { Download, FileText, Table, FileJson } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportCenter = ({ data, onLoading }) => {
  if (!data) return null;

  const downloadPDF = async () => {
    const dashboard = document.getElementById('dashboard-to-print');
    if (!dashboard) return;
    
    onLoading(true);
    try {
      const canvas = await html2canvas(dashboard, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d0d0f',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PulseAI_Executive_Report_${data.query.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      onLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data.posts) return;
    
    const headers = ['Platform', 'Text', 'Sentiment', 'Confidence', 'Emotion', 'Source URL'];
    const rows = data.posts.map(p => [
      p.platform,
      `"${p.text.replace(/"/g, '""')}"`, // Escape quotes
      p.label,
      p.confidence.toFixed(4),
      p.emotion || 'N/A',
      p.url || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `PulseAI_Data_Export_${data.query.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Fix: release memory
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PulseAI_Analysis_Raw_${data.query.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url); // Fix: release memory
  };

  return (
    <div className="report-center-v2">
      <div className="report-center-header">
        <Download size={20} className="highlight" />
        <h3 className="report-title">Analysis Export Center</h3>
        <p className="report-subtitle">Select a format for deep-dive analysis</p>
      </div>
      
      <div className="report-grid">
        <div className="report-action-card" onClick={downloadPDF}>
          <div className="action-icon pdf"><FileText size={24} /></div>
          <div className="action-info">
            <h4>Executive PDF</h4>
            <p>Visual summary for stakeholders</p>
          </div>
          <button className="btn-action-sm">Generate</button>
        </div>

        <div className="report-action-card" onClick={downloadCSV}>
          <div className="action-icon csv"><Table size={24} /></div>
          <div className="action-info">
            <h4>Raw Data (CSV)</h4>
            <p>Best for Excel / BI Analysis</p>
          </div>
          <button className="btn-action-sm">Export</button>
        </div>

        <div className="report-action-card" onClick={downloadJSON}>
          <div className="action-icon json"><FileJson size={24} /></div>
          <div className="action-info">
            <h4>System JSON</h4>
            <p>Raw data for developer use</p>
          </div>
          <button className="btn-action-sm">Fetch</button>
        </div>
      </div>
    </div>
  );
};

export default ReportCenter;
