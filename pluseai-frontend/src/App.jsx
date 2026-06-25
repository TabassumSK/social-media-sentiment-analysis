// ============================================================
// PulseAI — Fully Restored Modular Frontend
// ============================================================

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line
} from "recharts";
import {
  PieChart as PieIcon, LineChart as LineIcon,
  LayoutGrid, Thermometer, User, Trash2,
  Search, BarChart2, Scale, Brain, Clock, MessageSquare
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
import DashboardFooter from "./components/dashboard/DashboardFooter";
import AIAssistant from "./components/dashboard/AIAssistant";
import TechnicalAnalysis from "./components/dashboard/TechnicalAnalysis";
import Header from "./components/layout/Header";
import AnalyzePage from "./components/pages/AnalyzePage";
import ComparePage from "./components/pages/ComparePage";
import PredictPage from "./components/pages/PredictPage";
import HistoryPage from "./components/pages/HistoryPage";
import ContactPage from "./components/pages/ContactPage";
import AuthPage from "./components/pages/AuthPage";


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

  // Auth State
  const [searchParams] = useSearchParams();
  const [authPage, setAuthPage] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ token: "", new_password: "", confirm: "" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.query]);

  // Read reset token from URL params on /auth page
  useEffect(() => {
    const action = searchParams.get("action");
    const token = searchParams.get("token");
    if (action === "reset" && token) {
      setResetForm(prev => ({ ...prev, token }));
      setAuthPage("reset");
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) fetchUser();
    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token && location.pathname === "/history") {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      alert("Message sent successfully!");
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
    setAuthSuccess("");
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
      setAuthSuccess("Account created! A welcome email has been sent. Logging in...");
      setTimeout(() => {
        setLoginForm({ username: registerForm.username, password: registerForm.password });
        performLogin(registerForm.username, registerForm.password);
      }, 1500);
    } catch { setAuthError("Registration failed. Username or email may already be taken."); }
  };

  const forgotPassword = async () => {
    setAuthError("");
    setAuthSuccess("");
    if (!forgotForm.email) { setAuthError("Please enter your email address."); return; }
    try {
      await axios.post(`${API}/forgot-password`, { email: forgotForm.email });
      setAuthSuccess("If that email is registered, a password reset link has been sent. Check your inbox.");
      setForgotForm({ email: "" });
    } catch {
      setAuthError("Something went wrong. Please try again.");
    }
  };

  const resetPassword = async () => {
    setAuthError("");
    setAuthSuccess("");
    if (!resetForm.token) { setAuthError("Reset token is missing."); return; }
    if (!resetForm.new_password) { setAuthError("Please enter a new password."); return; }
    if (resetForm.new_password !== resetForm.confirm) { setAuthError("Passwords do not match."); return; }
    if (resetForm.new_password.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    try {
      await axios.post(`${API}/reset-password`, {
        token: resetForm.token,
        new_password: resetForm.new_password
      });
      setAuthSuccess("Password updated successfully! You can now log in.");
      setResetForm({ token: "", new_password: "", confirm: "" });
      setTimeout(() => setAuthPage("login"), 2000);
    } catch (err) {
      setAuthError(err.response?.data?.detail || "Invalid or expired reset token.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    // Clear all form fields so no credentials are shown to next user
    setLoginForm({ username: "", password: "" });
    setRegisterForm({ username: "", email: "", password: "", confirm: "" });
    setForgotForm({ email: "" });
    setResetForm({ token: "", new_password: "", confirm: "" });
    setAuthError("");
    setAuthSuccess("");
    
    // Clear application data
    setHistory([]);
    setTrending([]);
    setData(null);
    setCompareData(null);
    setSingleResult(null);

    setAuthPage("login");
    navigate("/");
  };

  const scoreColor = (pct) => pct >= 60 ? "#1D9E75" : pct >= 40 ? "#EF9F27" : "#E24B4A";




  return (
    <div className="app">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage onStart={() => navigate("/analyze")} />} />
          <Route path="/*" element={
            <>
              <Header user={user} logout={logout} />

              <main className="container main">
                <Routes>
                  <Route path="/analyze" element={
                    <AnalyzePage
                      platform={platform} setPlatform={setPlatform}
                      query={query} setQuery={setQuery}
                      loading={loading} cancelAnalyze={cancelAnalyze} analyze={analyze} reAnalyze={reAnalyze}
                      trending={trending} data={data} setLoading={setLoading}
                    />
                  } />

                  <Route path="/summary/:type" element={<SummaryPage data={data} />} />

                  <Route path="/compare" element={
                    <ComparePage
                      compareQ1={compareQ1} setCompareQ1={setCompareQ1}
                      compareQ2={compareQ2} setCompareQ2={setCompareQ2}
                      compareTopics={compareTopics} compareLoading={compareLoading} compareData={compareData}
                    />
                  } />

                  <Route path="/predict" element={
                    <PredictPage
                      singleText={singleText} setSingle={setSingle}
                      predictSingle={predictSingle} singleResult={singleResult}
                    />
                  } />

                  <Route path="/technical" element={<TechnicalAnalysis data={data} token={token} preFetched={technicalUrls} refetch={preFetchTechnicalData} />} />

                  <Route path="/history" element={
                    <HistoryPage
                      history={history}
                      selectedCategoryTab={selectedCategoryTab} setSelectedCategoryTab={setSelectedCategoryTab}
                      handleDeleteHistory={handleDeleteHistory}
                      reAnalyze={reAnalyze}
                      reCompare={reCompare}
                    />
                  } />

                  <Route path="/contact" element={
                    <ContactPage
                      contactError={contactError} contactSuccess={contactSuccess}
                      contactForm={contactForm} setContactForm={setContactForm}
                      submitContact={submitContact} contactLoading={contactLoading}
                    />
                  } />

                  <Route path="/auth" element={
                    <AuthPage
                      authError={authError} setAuthError={setAuthError}
                      authSuccess={authSuccess} setAuthSuccess={setAuthSuccess}
                      authPage={authPage} setAuthPage={setAuthPage}
                      loginForm={loginForm} setLoginForm={setLoginForm}
                      registerForm={registerForm} setRegisterForm={setRegisterForm}
                      forgotForm={forgotForm} setForgotForm={setForgotForm}
                      resetForm={resetForm} setResetForm={setResetForm}
                      login={login} register={register} forgotPassword={forgotPassword} resetPassword={resetPassword}
                    />
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
