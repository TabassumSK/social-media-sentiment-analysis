// ============================================================
// PulseAI — Fully Restored Modular Frontend
// ============================================================

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  Legend, AreaChart, Area, CartesianGrid, LineChart, Line
} from "recharts";
import {
  PieChart as PieIcon, LineChart as LineIcon,
  Hash, LayoutGrid, Thermometer, ShieldCheck, Zap, Mail, User, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

import "./App.css";
import LandingPage from "./components/LandingPage";
import SummaryPage from "./components/SummaryPage";

// Custom Charts
import SentimentHeatmap from "./components/charts/SentimentHeatmap";
import ConfidenceTrend from "./components/charts/ConfidenceTrend";
import ComparisonDetails from "./components/dashboard/ComparisonDetails";
import ReportCenter from "./components/dashboard/ReportCenter";
import DashboardFeatures from "./components/dashboard/DashboardFeatures";
import DashboardFooter from "./components/dashboard/DashboardFooter";
import AIAssistant from "./components/dashboard/AIAssistant";
import TechnicalAnalysis from "./components/dashboard/TechnicalAnalysis";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [compareQ1, setCompareQ1] = useState("");
  const [compareQ2, setCompareQ2] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const [singleText, setSingle] = useState("");
  const [singleResult, setSingleResult] = useState(null);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [abortController, setAbortController] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const downloadReport = async () => {
    const dashboard = document.getElementById('dashboard-to-print');
    if (!dashboard || !data) return;

    setLoading(true);
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
      pdf.save(`PulseAI_Report_${data.query.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auth State
  const [authPage, setAuthPage] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Contact State
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone_no: "", subject: "", message: "" });
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [technicalUrls, setTechnicalUrls] = useState({
    wc: null,
    hm: null,
    cm: null,
    tr: null,
    pie: null,
    stacked: null,
    loading: false,
    query: ""
  });

  const preFetchTechnicalData = async (queryToFetch) => {
    if (!queryToFetch) return;
    setTechnicalUrls(prev => ({ ...prev, loading: true, query: queryToFetch }));
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const fetchImage = async (endpoint) => {
        const res = await fetch(`${API}${endpoint}`, { headers });
        if (!res.ok) throw new Error("Failed to fetch image");
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      };

      const [wc, hm, cm, tr, pie, stacked] = await Promise.all([
        fetchImage(`/visualize/wordcloud?query=${encodeURIComponent(queryToFetch)}`),
        fetchImage(`/visualize/heatmap?query=${encodeURIComponent(queryToFetch)}`),
        fetchImage(`/visualize/confusion-matrix`),
        fetchImage(`/visualize/trend?query=${encodeURIComponent(queryToFetch)}`),
        fetchImage(`/visualize/pie?query=${encodeURIComponent(queryToFetch)}`),
        fetchImage(`/visualize/stacked-bar?query=${encodeURIComponent(queryToFetch)}`)
      ]);

      setTechnicalUrls({
        wc, hm, cm, tr, pie, stacked,
        loading: false,
        query: queryToFetch
      });
    } catch (err) {
      console.error("Failed to pre-fetch technical reports", err);
      setTechnicalUrls(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (data?.query) {
      preFetchTechnicalData(data.query);
    }
  }, [data?.query]);

  useEffect(() => {
    if (token) fetchUser();
    fetchTrending();
  }, [token]);

  useEffect(() => {
    if (token && location.pathname === "/history") {
      fetchHistory();
    }
  }, [location.pathname, token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/me`, { headers: authHeaders });
      setUser(res.data);
      fetchHistory();
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logout();
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/history`, { headers: authHeaders });
      setHistory(res.data);
    } catch { }
  };

  const handleDeleteHistory = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this history item?")) return;
    try {
      await axios.delete(`${API}/history/${id}`, { headers: authHeaders });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert("Failed to delete history item: " + (err.response?.data?.detail || err.message));
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await axios.get(`${API}/trending`);
      setTrending(res.data);
    } catch { }
  };

  const cancelAnalyze = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
    }
  };

  const analyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setData(null);
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const res = await axios.post(
        `${API}/analyze`, 
        { query, limit: 300, platform }, 
        { 
          headers: authHeaders,
          signal: controller.signal
        }
      );
      setData(res.data);
      if (token) fetchHistory();
    } catch (e) {
      if (axios.isCancel(e)) {
        console.log("Analysis cancelled by user");
      } else {
        alert("Error: " + (e.response?.data?.detail || e.message));
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const reAnalyze = async (searchQuery) => {
    setQuery(searchQuery);
    setPlatform("all");
    navigate("/analyze");
    setLoading(true);
    setData(null);
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const res = await axios.post(
        `${API}/analyze`, 
        { query: searchQuery, limit: 300, platform: "all" }, 
        { 
          headers: authHeaders,
          signal: controller.signal
        }
      );
      setData(res.data);
      if (token) fetchHistory();
    } catch (e) {
      if (axios.isCancel(e)) {
        console.log("Re-analysis cancelled by user");
      } else {
        alert("Error: " + (e.response?.data?.detail || e.message));
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const reCompare = async (q1, q2) => {
    setCompareQ1(q1);
    setCompareQ2(q2);
    navigate("/compare");
    setCompareLoading(true);
    setCompareData(null);
    try {
      const res = await axios.post(`${API}/compare`, { query1: q1, query2: q2 }, { headers: authHeaders });
      setCompareData(res.data);
      if (token) fetchHistory();
    } catch (e) {
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setCompareLoading(false);
  };

  const compareTopics = async () => {
    if (!compareQ1.trim() || !compareQ2.trim()) return;
    setCompareLoading(true);
    setCompareData(null);
    try {
      const res = await axios.post(`${API}/compare`, { query1: compareQ1, query2: compareQ2 }, { headers: authHeaders });
      setCompareData(res.data);
      if (token) fetchHistory();
    } catch (e) {
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setCompareLoading(false);
  };

  const predictSingle = async () => {
    if (!singleText.trim()) return;
    try {
      const res = await axios.post(`${API}/predict`, { text: singleText }, { headers: authHeaders });
      setSingleResult(res.data);
      if (token) fetchHistory();
    } catch (e) { alert("Error predicting"); }
  };

  const submitContact = async () => {
    setContactError("");
    setContactSuccess("");
    if (!contactForm.name || !contactForm.email || !contactForm.phone_no || !contactForm.subject || !contactForm.message) {
      setContactError("All fields are required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setContactError("Please enter a valid email address.");
      return;
    }
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(contactForm.phone_no)) {
      setContactError("Please enter a valid phone number.");
      return;
    }
    setContactLoading(true);
    try {
      await axios.post(`${API}/contact`, contactForm);
      setContactSuccess("Message sent successfully!");
      setContactForm({ name: "", email: "", phone_no: "", subject: "", message: "" });
    } catch (err) {
      setContactError(err.response?.data?.detail || "Failed to send message.");
    }
    setContactLoading(false);
  };

  const performLogin = async (username, password) => {
    setAuthError("");
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);
      const res = await axios.post(`${API}/login`, form);
      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
      navigate("/analyze");
    } catch { setAuthError("Invalid username or password"); }
  };

  const login = async () => {
    await performLogin(loginForm.username, loginForm.password);
  };

  const register = async () => {
    setAuthError("");
    if (registerForm.password !== registerForm.confirm) {
      setAuthError("Passwords do not match");
      return;
    }
    try {
      await axios.post(`${API}/register`, {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      });
      setAuthSuccess("Account created! Logging in...");
      setTimeout(() => {
        setLoginForm({ username: registerForm.username, password: registerForm.password });
        performLogin(registerForm.username, registerForm.password);
      }, 1000);
    } catch { setAuthError("Registration failed"); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  const scoreColor = (pct) => pct >= 60 ? "#1D9E75" : pct >= 40 ? "#EF9F27" : "#E24B4A";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const isoStr = dateStr.includes(" ") ? dateStr.replace(" ", "T") : dateStr;
      const d = new Date(isoStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const isHome = location.pathname === "/";

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage onStart={() => navigate("/analyze")} />} />
          <Route path="/*" element={
            <>
              <header className="header">
                <div className="container header-inner">
                  <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <span className="brand-dot" />
                    <h1 className="brand-name">PulseAI</h1>
                    <span className="brand-tag">Intelligence Platform</span>
                  </div>
                  <nav className="nav">
                    {[
                      { name: "analyze", path: "/analyze" },
                      { name: "technical", path: "/technical" },
                      { name: "compare", path: "/compare" },
                      { name: "predict", path: "/predict" },
                      { name: "history", path: "/history" },
                      { name: "contact", path: "/contact" }
                    ].map((t) => (
                      <Link
                        key={t.name}
                        to={t.path}
                        className={`nav-btn ${location.pathname === t.path ? "active" : ""}`}
                      >
                        {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
                      </Link>
                    ))}
                  </nav>
                  <div className="auth-area">
                    {user ? (
                      <div className="profile-dropdown-container" ref={profileRef}>
                        <div className="profile-trigger" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                          <div className="user-icon-avatar">
                            <User size={14} />
                          </div>
                          <span className="username">@{user.username}</span>
                        </div>
                        
                        {showProfileDropdown && (
                          <div className="profile-menu glass">
                            <div className="profile-menu-header">
                              <p className="profile-display-name">{user.username}</p>
                              <p className="profile-display-email">{user.email || ""}</p>
                            </div>
                            <div className="profile-menu-divider" />
                            <button className="profile-menu-item logout" onClick={() => {
                              setShowProfileDropdown(false);
                              logout();
                            }}>
                              Logout
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button className="btn-primary" onClick={() => navigate("/auth")}>Login</button>
                    )}
                  </div>
                </div>
              </header>

              <main className="container main">
                <Routes>
                  <Route path="/analyze" element={
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
                  } />

                  <Route path="/summary/:type" element={<SummaryPage data={data} />} />

                  <Route path="/compare" element={
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
                  } />

                  <Route path="/predict" element={
                    <div className="predict-wrap">
                      <h2 className="section-title">AI Text Predictor</h2>
                      <textarea className="text-area" rows={5} value={singleText} onChange={(e) => setSingle(e.target.value)} placeholder="Paste review text here..." />
                      <button className="btn-primary" onClick={predictSingle}>Predict Sentiment →</button>
                      {singleResult && (
                        <div className={`result-box ${singleResult.label.toLowerCase()}`}>
                          <h3>Result: {singleResult.label}</h3>
                          <p>Confidence: {(singleResult.confidence * 100).toFixed(1)}%</p>
                          <p>Emotion detected: {singleResult.emotion}</p>
                        </div>
                      )}
                    </div>
                  } />

                  <Route path="/technical" element={<TechnicalAnalysis data={data} token={token} preFetched={technicalUrls} refetch={preFetchTechnicalData} />} />

                  <Route path="/history" element={
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
                  } />

                  <Route path="/contact" element={
                    <div className="contact-wrap">
                      <h2 className="section-title">Contact Support</h2>
                      <div className="auth-card" style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
                        {contactError && <p className="auth-error">{contactError}</p>}
                        {contactSuccess && <p className="auth-success">{contactSuccess}</p>}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input className="form-input" placeholder="Name *" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} />
                          <input className="form-input" type="email" placeholder="Email *" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <input className="form-input" type="tel" placeholder="Phone Number *" value={contactForm.phone_no} onChange={e => setContactForm({ ...contactForm, phone_no: e.target.value })} />
                          <input className="form-input" placeholder="Subject *" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} />
                        </div>
                        <textarea className="text-area" placeholder="Message *" rows={5} value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} />
                        <button className="btn-primary" onClick={submitContact} disabled={contactLoading}>Send Message</button>
                      </div>
                    </div>
                  } />

                  <Route path="/auth" element={
                    <div className="auth-wrap">
                      <div className="auth-card">
                        {authError && <p className="auth-error">{authError}</p>}
                        {authSuccess && <p className="auth-success">{authSuccess}</p>}

                        {authPage === "login" ? (
                          <>
                            <h3>Login</h3>
                            <input className="form-input" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
                            <input className="form-input" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                            <button className="btn-primary" onClick={login}>Sign In</button>
                            <p onClick={() => setAuthPage("register")} style={{ cursor: 'pointer', textAlign: 'center' }}>Need an account? <span style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'underline' }}>Register</span></p>
                          </>
                        ) : (
                          <>
                            <h3>Register</h3>
                            <input className="form-input" placeholder="Username" value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
                            <input className="form-input" placeholder="Email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                            <input className="form-input" type="password" placeholder="Password" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                            <input className="form-input" type="password" placeholder="Confirm Password" value={registerForm.confirm} onChange={e => setRegisterForm({ ...registerForm, confirm: e.target.value })} />
                            <button className="btn-primary" onClick={register}>Create Account</button>
                            <p onClick={() => setAuthPage("login")} style={{ cursor: 'pointer', textAlign: 'center' }}>Already have an account? <span style={{ color: 'var(--blue)', fontWeight: '600', textDecoration: 'underline' }}>Login</span></p>
                          </>
                        )}
                      </div>
                    </div>
                  } />
                </Routes>
              </main>
              <DashboardFooter />
            </>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
