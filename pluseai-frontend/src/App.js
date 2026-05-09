// ============================================================
// PulseAI — Fully Restored Modular Frontend
// ============================================================

import { useState, useEffect } from "react";
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
  Hash, LayoutGrid, Thermometer, ShieldCheck, Zap, Mail, User
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
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactMsg, setContactMsg] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (token) fetchUser();
    fetchTrending();
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/me`, { headers: authHeaders });
      setUser(res.data);
      fetchHistory();
    } catch { logout(); }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/history`, { headers: authHeaders });
      setHistory(res.data);
    } catch { }
  };

  const fetchTrending = async () => {
    try {
      const res = await axios.get(`${API}/trending`);
      setTrending(res.data);
    } catch { }
  };

  const analyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const res = await axios.post(`${API}/analyze`, { query, limit: 300, platform }, { headers: authHeaders });
      setData(res.data);
      if (token) fetchHistory();
    } catch (e) {
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const compareTopics = async () => {
    if (!compareQ1.trim() || !compareQ2.trim()) return;
    setCompareLoading(true);
    setCompareData(null);
    try {
      const res = await axios.post(`${API}/compare`, { query1: compareQ1, query2: compareQ2 }, { headers: authHeaders });
      setCompareData(res.data);
    } catch (e) {
      alert("Error: " + (e.response?.data?.detail || e.message));
    }
    setCompareLoading(false);
  };

  const predictSingle = async () => {
    if (!singleText.trim()) return;
    try {
      const res = await axios.post(`${API}/predict`, { text: singleText });
      setSingleResult(res.data);
    } catch (e) { alert("Error predicting"); }
  };

  const submitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactLoading(true);
    try {
      await axios.post(`${API}/contact`, contactForm);
      setContactMsg("Message sent successfully!");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch { setContactMsg("Failed to send message."); }
    setContactLoading(false);
  };

  const login = async () => {
    setAuthError("");
    try {
      const form = new URLSearchParams();
      form.append("username", loginForm.username);
      form.append("password", loginForm.password);
      const res = await axios.post(`${API}/login`, form);
      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
      navigate("/analyze");
    } catch { setAuthError("Invalid username or password"); }
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
        login();
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
                      <div className="user-info">
                        <span className="username">@{user.username}</span>
                        <button className="btn-ghost" onClick={logout}>Logout</button>
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
                          <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search brand or product...' onKeyDown={(e) => e.key === "Enter" && analyze()} />
                          <button className="btn-primary large" onClick={analyze} disabled={loading}>
                            {loading ? <span className="spinner" /> : "Analyze →"}
                          </button>
                        </div>
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
                              <p className="stat-label">Total Analyzed</p>
                              <p className="stat-val">{data.total}</p>
                            </div>
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
                          </div>

                          <div className="full-width-section">
                            <h2 className="section-title">Sentiment Velocity</h2>
                            <div className="charts-grid-enhanced" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                              <div className="chart-card-premium clickable" onClick={() => navigate('/summary/platform')}>
                                <div className="chart-header">
                                  <div className="chart-title-wrap">
                                    <LayoutGrid className="chart-icon" size={18} />
                                    <h3 className="chart-title">Platform Distribution</h3>
                                  </div>
                                </div>
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart data={Object.entries(data.platform_stats).map(([k,v]) => ({ name: k, pos: v.positive, neg: v.negative }))}>
                                    <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f' }} />
                                    <Bar dataKey="pos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="neg" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="chart-card-premium">
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
                                    <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <ConfidenceTrend posts={data.posts} />
                          </div>

                          <div className="dashboard-grid-v2">
                            <div className="chart-card-premium clickable" onClick={() => navigate('/summary/sentiment')}>
                              <div className="chart-header">
                                <PieIcon size={18} className="chart-icon" />
                                <h3 className="chart-title">Global Sentiment</h3>
                              </div>
                              <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                  <Pie data={[
                                    { name: 'Pos', value: data.summary.positive },
                                    { name: 'Neg', value: data.summary.negative },
                                    { name: 'Neu', value: data.summary.neutral }
                                  ]} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                    <Cell fill="#1D9E75" /><Cell fill="#E24B4A" /><Cell fill="#EF9F27" />
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="chart-footer">Click for detailed breakdown →</div>
                            </div>

                            <div className="chart-card-premium clickable" onClick={() => navigate('/summary/platform')}>
                              <div className="chart-header">
                                <Thermometer size={18} className="chart-icon" />
                                <h3 className="chart-title">Platform Intensity</h3>
                              </div>
                              <SentimentHeatmap data={data.platform_stats || {}} />
                              <div className="chart-footer">Click for platform analysis →</div>
                            </div>

                            <div className="chart-card-premium clickable" onClick={() => navigate('/summary/aspects')}>
                              <div className="chart-header">
                                <LayoutGrid size={18} className="chart-icon" />
                                <h3 className="chart-title">Aspect Distribution</h3>
                              </div>
                              <ResponsiveContainer width="100%" height={220}>
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={Object.entries(data.aspects).map(([k,v]) => ({ aspect: k, val: v.pos_pct }))}>
                                  <PolarGrid stroke="#2a2a2f" />
                                  <PolarAngleAxis dataKey="aspect" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                                  <Radar name="Positive%" dataKey="val" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                  <Tooltip 
                                    contentStyle={{ background: '#16161a', border: '1px solid #2a2a2f', borderRadius: '8px', fontSize: '12px' }}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                              <div className="chart-footer">Click for aspect details →</div>
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
                          <ComparisonDetails 
                            verdict={compareData.verdict} 
                            product1={compareData.product1} 
                            product2={compareData.product2} 
                          />
                          
                          <div className="compare-results" style={{ marginTop: '30px' }}>
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

                  <Route path="/history" element={
                    <div className="history-wrap">
                      <h2 className="section-title">Search History</h2>
                      {history.length === 0 ? <p>No history found.</p> : (
                        <div className="history-list">
                          {history.map((h, i) => (
                            <div key={i} className="history-item">
                              <span>{h.query}</span>
                              <span>{h.pos_pct}% Positive</span>
                              <span>{new Date(h.created_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  } />

                  <Route path="/contact" element={
                    <div className="contact-wrap">
                      <h2 className="section-title">Contact Support</h2>
                      <div className="auth-card" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        {contactMsg && <p className="auth-success">{contactMsg}</p>}
                        <input className="form-input" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                        <input className="form-input" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                        <textarea className="text-area" placeholder="Message" rows={5} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
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
                            <input className="form-input" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
                            <input className="form-input" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                            <button className="btn-primary" onClick={login}>Sign In</button>
                            <p onClick={() => setAuthPage("register")} style={{ cursor: 'pointer', textAlign: 'center' }}>Need an account? Register</p>
                          </>
                        ) : (
                          <>
                            <h3>Register</h3>
                            <input className="form-input" placeholder="Username" value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value})} />
                            <input className="form-input" placeholder="Email" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} />
                            <input className="form-input" type="password" placeholder="Password" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} />
                            <input className="form-input" type="password" placeholder="Confirm Password" value={registerForm.confirm} onChange={e => setRegisterForm({...registerForm, confirm: e.target.value})} />
                            <button className="btn-primary" onClick={register}>Create Account</button>
                            <p onClick={() => setAuthPage("login")} style={{ cursor: 'pointer', textAlign: 'center' }}>Already have an account? Login</p>
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
