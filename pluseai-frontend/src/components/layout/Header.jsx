import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, BarChart2, Scale, Brain, Clock, MessageSquare, User } from 'lucide-react';

export default function Header({ user, logout }) {
  const navigate = useNavigate();
  const location = useLocation();
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

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span className="brand-dot" />
          <h1 className="brand-name">PulseAI</h1>
          <span className="brand-tag">Intelligence Platform</span>
        </div>
        <nav className="nav">
          {[
            { name: "analyze", path: "/analyze", icon: <Search size={16} /> },
            { name: "technical", path: "/technical", icon: <BarChart2 size={16} /> },
            { name: "compare", path: "/compare", icon: <Scale size={16} /> },
            { name: "predict", path: "/predict", icon: <Brain size={16} /> },
            { name: "history", path: "/history", icon: <Clock size={16} /> },
            { name: "contact", path: "/contact", icon: <MessageSquare size={16} /> }
          ].map((t) => (
            <Link
              key={t.name}
              to={t.path}
              className={`nav-btn ${location.pathname === t.path ? "active" : ""}`}
            >
              {t.icon}
              <span>{t.name.charAt(0).toUpperCase() + t.name.slice(1)}</span>
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
                <span className="username">{user.username}</span>
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
  );
}
