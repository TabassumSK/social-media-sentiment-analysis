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

  const API = "http://localhost:8000";
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Build context string from analysis data if available
      let contextStr = "";
      if (contextData) {
        contextStr = `Current Analysis: ${contextData.query}. Positive: ${contextData.summary.pos_pct}%, Negative: ${contextData.summary.neg_pct}%. Top Aspects: ${Object.keys(contextData.aspects).join(', ')}`;
      }

      const res = await axios.post(`${API}/chat`, 
        { message: userMsg, context: contextStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I encountered an error connecting to my core intelligence. Please check your API key configuration." }]);
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
