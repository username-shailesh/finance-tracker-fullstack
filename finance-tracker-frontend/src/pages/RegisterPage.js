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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
                required
              />
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
            </div>

            <button type="submit" className="btn btn-success" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
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
