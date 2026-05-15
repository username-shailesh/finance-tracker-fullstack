// Register Page Component
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    isSignup: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordRules = [
    { label: 'Minimum 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'One number', test: (pw) => /\d/.test(pw) },
    { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  ];

  const isPasswordValid = passwordRules.every(rule => rule.test(formData.password));
  const isFormValid = 
    formData.firstName.trim().length >= 2 &&
    formData.lastName.trim().length >= 2 &&
    formData.username.trim().length >= 3 &&
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
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* ── Left Hero Panel ── */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <span className="auth-hero-logo">🚀</span>
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
          <div className="auth-header">
            <h1>Create Account ✨</h1>
            <p>Fill in your details to get started</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

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
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Doe"
                  minLength="2"
                  required
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
                minLength="3"
                required
              />
              {formData.username && formData.username.length < 3 && (
                <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>Username must be at least 3 characters</small>
              )}
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

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
