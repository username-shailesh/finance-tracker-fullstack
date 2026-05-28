// Register Page Component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import { FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import { CURRENCIES } from '../hooks/useCurrency';
import './AuthPages.css';

const COUNTRIES = [
  { name: 'Australia', code: 'AU', currency: 'AUD' },
  { name: 'Bangladesh', code: 'BD', currency: 'BDT' },
  { name: 'Brazil', code: 'BR', currency: 'BRL' },
  { name: 'Canada', code: 'CA', currency: 'CAD' },
  { name: 'China', code: 'CN', currency: 'CNY' },
  { name: 'European Union', code: 'EU', currency: 'EUR' },
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'Indonesia', code: 'ID', currency: 'IDR' },
  { name: 'Japan', code: 'JP', currency: 'JPY' },
  { name: 'Malaysia', code: 'MY', currency: 'MYR' },
  { name: 'Mexico', code: 'MX', currency: 'MXN' },
  { name: 'Nepal', code: 'NP', currency: 'NPR' },
  { name: 'Nigeria', code: 'NG', currency: 'NGN' },
  { name: 'Pakistan', code: 'PK', currency: 'PKR' },
  { name: 'Philippines', code: 'PH', currency: 'PHP' },
  { name: 'Russia', code: 'RU', currency: 'RUB' },
  { name: 'Saudi Arabia', code: 'SA', currency: 'SAR' },
  { name: 'Singapore', code: 'SG', currency: 'SGD' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR' },
  { name: 'South Korea', code: 'KR', currency: 'KRW' },
  { name: 'Sri Lanka', code: 'LK', currency: 'LKR' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF' },
  { name: 'Thailand', code: 'TH', currency: 'THB' },
  { name: 'Turkey', code: 'TR', currency: 'TRY' },
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
  { name: 'USA', code: 'US', currency: 'USD' },
  { name: 'Vietnam', code: 'VN', currency: 'VND' }
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'India',
    currency: 'INR',
    isSignup: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();
  
  // 'REGISTER' | 'VERIFY'
  const [step, setStep] = useState('REGISTER');
  const [otp, setOtp] = useState('');
  
  // Custom API call for OTP verification
  const { authService } = require('../services/api');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-map currency based on country
    if (name === 'country') {
      const selectedCountry = COUNTRIES.find(c => c.name === value);
      setFormData(prev => ({ 
        ...prev, 
        country: value,
        currency: selectedCountry ? selectedCountry.currency : 'USD'
      }));
    } else if (name === 'username') {
      // Username Policy: Convert to lowercase, remove all spaces instantly, and strip unsupported symbols
      const sanitized = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9._]/g, '');
      setFormData(prev => ({ ...prev, username: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const passwordRules = [
    { label: 'Minimum 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'One number', test: (pw) => /\d/.test(pw) },
    { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  ];

  const isUsernameValid = 
    formData.username.length >= 3 && 
    /^[a-z]/i.test(formData.username);

  const isPasswordValid = passwordRules.every(rule => rule.test(formData.password));
  const isFormValid = 
    formData.firstName.trim().length >= 2 &&
    isUsernameValid &&
    formData.email.includes('@') &&
    isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please ensure all fields are valid and password meets complexity rules.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.register(formData);
      setStep('VERIFY');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await authService.verifyEmail({ registrationData: formData, otp });
      // On success, the backend returns the token and user. We manually set them.
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Reload page or force navigate to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const [resendTimer, setResendTimer] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');

  // Timer logic
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setResendSuccess('');
    try {
      await authService.resendOtp({ email: formData.email, type: 'REGISTRATION' });
      setResendSuccess('Verification code resent successfully!');
      setResendTimer(60); // Start 60s timer
      setTimeout(() => setResendSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    }
  };

  // Helper to get current symbol safely
  const currentSymbol = CURRENCIES.find(c => c.code === formData.currency)?.symbol || '₹';
  const getSymbolStyle = (sym, isBack = false) => {
    if (sym.length > 2) return { fontSize: isBack ? '15px' : '20px' };
    if (sym.length > 1) return { fontSize: isBack ? '22px' : '26px' };
    return {};
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
          <div className="auth-hero-logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Back to Home">
            <div className="shopping-bag-back">
              <span className="bag-brand-text-back-top">FinTracker</span>
              <span className="bag-currency" style={getSymbolStyle(currentSymbol, true)}>{currentSymbol}</span>
            </div>
            <div className="shopping-bag-front">
              <span className="bag-currency" style={getSymbolStyle(currentSymbol, false)}>{currentSymbol}</span>
              <span className="bag-brand-text-row1">Finance</span>
              <span className="bag-brand-text-row2">Tracker</span>
            </div>
          </div>
          <h2>Start Your Financial Journey</h2>
          <p>
            Join thousands of users who are already saving smarter,
            spending wiser, and building wealth with AI-powered insights.
          </p>

          <div className="auth-stats">
            <div className="auth-stat-card">
              <div className="auth-stat-icon">📈</div>
              <div className="auth-stat-info">
                <strong>Budget Tracking</strong>
                <span>Set limits & track every rupee</span>
                <div className="auth-stat-bar">
                  <div className="auth-stat-bar-fill" style={{ width: '75%', background: 'linear-gradient(90deg,#6366f1,#a78bfa)' }} />
                </div>
              </div>
            </div>

            <div className="auth-stat-card">
              <div className="auth-stat-icon">📄</div>
              <div className="auth-stat-info">
                <strong>Export Reports</strong>
                <span>Download PDF & Excel reports</span>
                <div className="auth-stat-bar">
                  <div className="auth-stat-bar-fill" style={{ width: '88%', background: 'linear-gradient(90deg,#ec4899,#f472b6)' }} />
                </div>
              </div>
            </div>

            <div className="auth-stat-card">
              <div className="auth-stat-icon">🔒</div>
              <div className="auth-stat-info">
                <strong>Secure & Private</strong>
                <span>JWT encrypted, your data is safe</span>
                <div className="auth-stat-bar">
                  <div className="auth-stat-bar-fill" style={{ width: '95%', background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <Link to="/" className="auth-back-home">← Back to Home</Link>
          <div className="auth-header">
            <h1>Create Account ✨</h1>
            <p>Fill in your details to get started</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

          {step === 'REGISTER' ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John"
                    minLength="2"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.85em' }}>(Optional)</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {formData.username && formData.username.length < 3 && (
                    <small style={{ color: 'var(--danger)', display: 'block' }}>⚠️ Username must be at least 3 characters</small>
                  )}
                  {formData.username && !/^[a-z]/i.test(formData.username) && (
                    <small style={{ color: 'var(--danger)', display: 'block' }}>⚠️ Username must start with a letter (a-z)</small>
                  )}
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>
                    💡 Username rules: Spaces & special characters are automatically removed. Only letters, numbers, underscores, and dots are allowed.
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
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
                
                {formData.password.length > 0 && (
                  <div className="password-rules" style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {passwordRules.map((rule, idx) => {
                      const isValid = rule.test(formData.password);
                      return (
                        <div key={idx} style={{ 
                          color: isValid ? 'var(--success)' : 'var(--text-secondary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          transition: 'color 0.3s ease'
                        }}>
                          <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{isValid ? '✓' : '○'}</span> {rule.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={loading || !isFormValid} 
                style={{ width: '100%', marginTop: '8px', opacity: (!isFormValid && !loading) ? 0.6 : 1 }}
              >
                {loading ? '⏳ Creating Account...' : 'Create Account →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form" style={{ animation: 'fade-in-right 0.4s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '500' }}>We've sent a 6-digit code to</p>
                <strong style={{ color: '#6366f1', fontSize: '1.1rem' }}>{formData.email}</strong>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center' }}>Enter Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input"
                  placeholder="000000"
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', padding: '15px' }}
                  required
                />
              </div>

              {resendSuccess && <div className="alert alert-success" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>✅ {resendSuccess}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
                {loading ? '⏳ Verifying...' : 'Verify Email'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={resendTimer > 0}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--text-secondary)', 
                    textDecoration: resendTimer > 0 ? 'none' : 'underline', 
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive a code? Resend"}
                </button>
              </div>
            </form>
          )}

          {step === 'REGISTER' && (
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
