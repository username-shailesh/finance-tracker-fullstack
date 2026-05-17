// Enhanced Navbar with dark mode toggle, notifications bell, and currency selector
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useDarkMode from '../hooks/useDarkMode';
import useCurrency, { CURRENCIES } from '../hooks/useCurrency';
import { notificationService, API_BASE_URL } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount]         = useState(0);
  const [showUserMenu, setShowUserMenu]       = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [avatarError, setAvatarError]         = useState(false);

  const userMenuRef     = useRef(null);
  const currencyMenuRef = useRef(null);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Normalize path by removing the duplicate/outdated '/api' prefix if present
    let cleanPath = path;
    if (cleanPath.startsWith('/api/')) {
      cleanPath = cleanPath.substring(4);
    }
    return API_BASE_URL + cleanPath;
  };

  // Fetch unread notifications
  useEffect(() => {
    const load = async () => {
      try {
        const res = await notificationService.getUnread();
        setUnreadCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch { setUnreadCount(0); }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(e.target)) setShowCurrencyMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('demoMode');
    logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { path: '/dashboard',  label: 'Dashboard',  icon: '📊' },
    { path: '/expenses',   label: 'Expenses',    icon: '💸' },
    { path: '/budget',     label: 'Budget',      icon: '🎯' },
    { path: '/insights',   label: 'Insights',    icon: '🤖' },
    { path: '/recurring',  label: 'Recurring',   icon: '🔁' },
    { path: '/reports',    label: 'Reports',     icon: '📄' },
  ];

  const isActive = (path) => location.pathname === path;

  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const getSmallSymbolStyle = (sym) => {
    if (sym.length > 2) return { fontSize: '8px' };
    if (sym.length > 1) return { fontSize: '10px' };
    return {};
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-brand-logo-container">
            <div className="shopping-bag-back-small">
              <span className="bag-currency-small" style={getSmallSymbolStyle(symbol)}>{symbol}</span>
            </div>
            <div className="shopping-bag-front-small">
              <span className="bag-currency-small" style={getSmallSymbolStyle(symbol)}>{symbol}</span>
              <span className="bag-brand-text-small-row1">Finance</span>
              <span className="bag-brand-text-small-row2">Tracker</span>
            </div>
          </div>
          <span className="brand-text">FinTracker</span>
          {localStorage.getItem('demoMode') === 'true' && (
            <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '10px', fontWeight: 'bold' }}>
              DEMO
            </span>
          )}
        </Link>

        {/* Quick Add Button */}
        <button 
          className="btn btn-primary btn-sm quick-add-btn" 
          onClick={() => navigate('/expenses', { state: { openForm: true } })}
          title="Quickly add an expense"
        >
          <span>+ Add</span>
        </button>

        {/* Desktop nav links */}
        <div className="navbar-links">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div className="navbar-actions">
          {/* Dark mode toggle */}
          <button
            className="action-btn"
            onClick={toggleDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Currency selector */}
          <div className="dropdown-wrap" ref={currencyMenuRef}>
            <button
              className="action-btn currency-btn"
              onClick={() => setShowCurrencyMenu(p => !p)}
              title="Change currency"
            >
              {currency}
            </button>
            {showCurrencyMenu && (
              <div className="dropdown-menu currency-menu">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    className={`dropdown-item ${currency === c.code ? 'active' : ''}`}
                    onClick={() => { setCurrency(c.code); setShowCurrencyMenu(false); }}
                  >
                    <span className="currency-symbol">{c.symbol}</span>
                    <span>{c.name}</span>
                    {currency === c.code && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Link to="/notifications" className="action-btn notification-btn" title="Notifications">
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Link>

          {/* User avatar menu */}
          <div className="dropdown-wrap" ref={userMenuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserMenu(p => !p)}
            >
              <div className="avatar">
                {user?.profilePicture && !avatarError ? (
                  <img 
                    src={getFullImageUrl(user.profilePicture)} 
                    className="avatar-img" 
                    alt="Avatar" 
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <span className="user-name">{user?.firstName || user?.username}</span>
              <span className="chevron">▾</span>
            </button>
            {showUserMenu && (
              <div className="dropdown-menu user-menu">
                <div className="user-menu-header">
                  <div className="avatar avatar-lg">
                    {user?.profilePicture && !avatarError ? (
                      <img 
                        src={getFullImageUrl(user.profilePicture)} 
                        className="avatar-img" 
                        alt="Avatar" 
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      user?.firstName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="user-full-name">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <hr className="menu-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  👤 Profile Settings
                </Link>
                <Link to="/reports" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  📄 Reports
                </Link>
                <hr className="menu-divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen(p => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {[
          { path: '/dashboard',  label: 'Dashboard',  icon: '📊' },
          { path: '/expenses',   label: 'Expenses',    icon: '💸' },
          { path: '/recurring',  label: 'Recurring',   icon: '🔁' },
          { path: '/budget',     label: 'Budget',      icon: '🎯' },
          { path: '/insights',   label: 'Insights',    icon: '🤖' },
          { path: '/profile',    label: 'Profile',     icon: '👤' }
        ].map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`mobile-bottom-link ${isActive(path) ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{icon}</span>
            <span className="bottom-nav-label">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
