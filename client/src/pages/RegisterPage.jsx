import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wind,
  UserPlus,
  User,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Activity,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide your email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      onNavigate('user-dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-container">
        {/* ============================================================
            LEFT PANEL: ATMOSPHERIC ENVIRONMENTAL VISUAL
            ============================================================ */}
        <div
          className="auth-visual-panel"
          style={{
            backgroundImage: "url('/images/ecosense-login.jpg')"
          }}
          role="img"
          aria-label="EcoSense Atmospheric Smart City Environment"
        >
          {/* Top Brand Tag */}
          <div className="auth-visual-content">
            <div className="auth-brand-badge">
              <div className="auth-brand-icon-box">
                <Wind size={16} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                EcoSense <span style={{ color: '#10b981', fontWeight: 600 }}>Citizen Portal</span>
              </span>
            </div>
          </div>

          {/* Central Environmental Statement & Floating Glass Telemetry */}
          <div className="auth-visual-content" style={{ marginTop: 'auto', marginBottom: '12px' }}>
            <h1 className="auth-hero-title">
              Start understanding <span>your environment.</span>
            </h1>
            <p className="auth-hero-desc">
              Join observers, researchers, and citizens tracking real-time air quality, micro-climates, and pollution trends.
            </p>

            {/* Floating Glass Badges */}
            <div className="auth-telemetry-cluster">
              {/* Card 1: Citizen Observer Benefits */}
              <div className="auth-glass-card">
                <div className="auth-glass-metric-left">
                  <div className="auth-glass-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <ShieldCheck size={18} color="#34d399" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Personalized Protection
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                      Custom AQI Alert Thresholds
                    </div>
                  </div>
                </div>
                <CheckCircle2 size={16} color="#34d399" />
              </div>

              {/* Card 2: Favorite Stations */}
              <div className="auth-glass-card">
                <div className="auth-glass-metric-left">
                  <div className="auth-glass-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <Activity size={18} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Station Monitoring
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                      Pin Custom Cities & Trends
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                  5 CITIES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT PANEL: REGISTRATION FORM
            ============================================================ */}
        <div className="auth-form-panel">
          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-form-brand-row">
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(16, 185, 129, 0.2))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <UserPlus size={20} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                EcoSense
              </span>
            </div>

            <h2 className="auth-form-title">
              Create your account
            </h2>
            <p className="auth-form-subtitle">
              Join EcoSense to configure personal environmental alerts.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="auth-input-group">
              <label htmlFor="reg-name" className="auth-label">
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <User size={17} />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Samantha Rao"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="auth-input-group">
              <label htmlFor="reg-email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <Mail size={17} />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@ecosense.org"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <label htmlFor="reg-password" className="auth-label">
                Password (min. 6 characters)
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <Lock size={17} />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="auth-input-group">
              <label htmlFor="reg-confirm" className="auth-label">
                Confirm Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <ShieldCheck size={17} />
                </div>
                <input
                  id="reg-confirm"
                  type="password"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                boxShadow: '0 6px 20px -3px rgba(14, 165, 233, 0.35)'
              }}
            >
              {loading ? 'Creating Account...' : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Navigation to Login */}
          <div className="auth-bottom-nav">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="auth-switch-link"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
