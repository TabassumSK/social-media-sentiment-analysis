import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

const AIAssistant = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your PulseAI Assistant. How can I help you interpret your analysis results today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const latestToken = localStorage.getItem('token');
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Build rich context string from analysis data including platform stats if available
      let contextStr = "";
      if (contextData) {
        const platDetails = Object.entries(contextData.platform_stats || {})
          .map(([name, stats]) => `${name.toUpperCase()}: Total Mentions=${stats.total}, Positive=${stats.positive}, Neutral=${stats.neutral || 0}, Negative=${stats.negative}`)
          .join('; ');
          
        contextStr = `Current Analysis Query: ${contextData.query}.
Overall Sentiment Summary: Positive: ${contextData.summary.pos_pct}%, Negative: ${contextData.summary.neg_pct}%, Neutral: ${contextData.summary.neutral_pct}%.
Platform-specific Graph Data: ${platDetails}.
Top Aspects Analyzed: ${Object.keys(contextData.aspects).join(', ')}`;
      }

      const headers = latestToken ? { Authorization: `Bearer ${latestToken}` } : {};
      const res = await axios.post(`${API}/chat`, 
        { message: userMsg, context: contextStr },
        { headers }
      );

      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setMessages(prev => [...prev, { role: 'bot', text: "Your session has expired or is invalid. Please log in again." }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I encountered an error connecting to my core intelligence. Please check your API key configuration." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerQuickAction = async (promptText) => {
    if (loading) return;

    const latestToken = localStorage.getItem('token');
    setMessages(prev => [...prev, { role: 'user', text: promptText }]);
    setLoading(true);

    try {
      let contextStr = "";
      if (contextData) {
        const platDetails = Object.entries(contextData.platform_stats || {})
          .map(([name, stats]) => `${name.toUpperCase()}: Total Mentions=${stats.total}, Positive=${stats.positive}, Neutral=${stats.neutral || 0}, Negative=${stats.negative}`)
          .join('; ');
          
        contextStr = `Current Analysis Query: ${contextData.query}.
Overall Sentiment Summary: Positive: ${contextData.summary.pos_pct}%, Negative: ${contextData.summary.neg_pct}%, Neutral: ${contextData.summary.neutral_pct}%.
Platform-specific Graph Data: ${platDetails}.
Top Aspects Analyzed: ${Object.keys(contextData.aspects).join(', ')}`;
      }

      const headers = latestToken ? { Authorization: `Bearer ${latestToken}` } : {};
      const res = await axios.post(`${API}/chat`, 
        { message: promptText, context: contextStr },
        { headers }
      );

      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setMessages(prev => [...prev, { role: 'bot', text: "Your session has expired or is invalid. Please log in again." }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I encountered an error connecting to my core intelligence. Please check your API key configuration." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* Floating Toggle Button */}
      <motion.button 
        className="ai-toggle-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <MessageSquare />}
        <div className="btn-glow" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-chat-window glass"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="chat-header">
              <div className="header-info">
                <Bot size={20} className="purple" />
                <div>
                  <h4>PulseAI Expert</h4>
                  <span className="status-dot">Online</span>
                </div>
              </div>
              <Sparkles size={16} className="amber anim-pulse" />
            </div>

            <div className="chat-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  <div className="msg-avatar">
                    {m.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="msg-bubble">
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-row bot">
                  <div className="msg-avatar"><Bot size={14} /></div>
                  <div className="msg-bubble loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Suggestion Bar */}
            {contextData && (
              <div className="chat-suggestions" style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 15px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                background: 'rgba(0,0,0,0.15)'
              }}>
                <button 
                  onClick={() => triggerQuickAction("Summarize what the platform sentiment graph tells us about our brand.")}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#60a5fa',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                >
                  📊 Summarize Graph
                </button>
                <button 
                  onClick={() => triggerQuickAction("Suggest an action strategy based on our active platform distribution.")}
                  style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    color: '#c084fc',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
                >
                  💡 Action Strategy
                </button>
              </div>
            )}

            <div className="chat-input-area">
              <input 
                placeholder="Ask about your data..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={loading}>
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;
