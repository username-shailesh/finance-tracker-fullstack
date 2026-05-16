// Login Page Component
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useDarkMode from '../hooks/useDarkMode';
import { FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import useCurrency from '../hooks/useCurrency';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { getCurrencyInfo } = useCurrency();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Theme Toggle for Auth Pages */}
      <button 
        className="auth-theme-toggle" 
        onClick={toggleDark}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <FiSun /> : <FiMoon />}
      </button>
      {/* ── Left Hero Panel ── */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-hero-logo-container">
            <div className="auth-hero-logo-pocket">💰</div>
            <div className="auth-hero-logo-dollar">{getCurrencyInfo().symbol}</div>
            <div className="auth-hero-logo-symbol">{getCurrencyInfo().symbol}</div>
          </div>
          <h2>Smart Finance Tracker</h2>
          <p>
            Take full control of your money. Track expenses, set budgets,
            and get AI-powered insights — all in one place.
          </p>

          <div className="auth-stats">
            <div className="auth-stat-card">
              <div className="auth-stat-icon">📊</div>
              <div className="auth-stat-info">
                <strong>Real-time Analytics</strong>
                <span>Live spending insights & charts</span>
                <div className="auth-stat-bar">
                  <div className="auth-stat-bar-fill" style={{ width: '82%', background: 'linear-gradient(90deg,#6366f1,#a78bfa)' }} />
                </div>
              </div>
            </div>

            <div className="auth-stat-card">
              <div className="auth-stat-icon">🤖</div>
              <div className="auth-stat-info">
                <strong>AI Insights</strong>
                <span>Personalised financial advice</span>
                <div className="auth-stat-bar">
                  <div className="auth-stat-bar-fill" style={{ width: '67%', background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                </div>
              </div>
            </div>

            <div className="auth-stat-card">
              <div className="auth-stat-icon">🔁</div>
              <div className="auth-stat-info">
                <strong>Auto Recurring</strong>
                <span>Never miss a subscription</span>
                <div className="auth-stat-bar">
                  <div className="auth-stat-bar-fill" style={{ width: '91%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome back 👋</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email or username"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <Link to="/forgot-password" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one free</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
