import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { authService } from '../services/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState('REQUEST'); // 'REQUEST' | 'RESET'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const passwordRules = [
    { label: 'Minimum 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
    { label: 'One number', test: (pw) => /\d/.test(pw) },
    { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  ];
  const isPasswordValid = passwordRules.every(rule => rule.test(newPassword));

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setStep('RESET');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    if (!isPasswordValid) {
      setError('New password does not meet complexity requirements.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-panel" style={{ width: '100%', maxWidth: '550px', margin: '0 auto', background: 'transparent' }}>
        <div className="auth-card" style={{ background: 'var(--bg-primary)', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontWeight: '500' }}>
            <FiArrowLeft /> Back to Login
          </Link>

          <div className="auth-header" style={{ marginBottom: '24px' }}>
            <h1>{step === 'REQUEST' ? 'Forgot Password? 🔒' : 'Reset Password ✨'}</h1>
            <p>{step === 'REQUEST' ? "Enter your email and we'll send you a reset code." : "Enter the code sent to your email and choose a new password."}</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '12px', borderRadius: '10px' }}>✅ {success}</div>}

          {step === 'REQUEST' ? (
            <form onSubmit={handleRequestReset} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading || !email}>
                {loading ? '⏳ Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form" style={{ animation: 'fade-in-right 0.4s ease-out' }}>
              <div className="form-group">
                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Enter 6-Digit Code</label>
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

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
                
                {newPassword.length > 0 && (
                  <div className="password-rules" style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {passwordRules.map((rule, idx) => {
                      const isValid = rule.test(newPassword);
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
                disabled={loading || otp.length !== 6 || !isPasswordValid}
                style={{ opacity: (!isPasswordValid && !loading) ? 0.6 : 1 }}
              >
                {loading ? '⏳ Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
