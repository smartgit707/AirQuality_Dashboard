import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wind,
  LogIn,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Activity,
  Droplets,
  Thermometer,
  Shield,
  User,
  Sparkles
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdminDemo, setShowAdminDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.user.role === 'ADMIN') {
        onNavigate('admin');
      } else {
        onNavigate('user-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    setError(null);
    if (role === 'admin') {
      setEmail('admin@ecosense.gov');
      setPassword('admin123');
    } else {
      setEmail('user@ecosense.org');
      setPassword('user123');
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
                EcoSense <span style={{ color: '#10b981', fontWeight: 600 }}>Intelligence</span>
              </span>
            </div>
          </div>

          {/* Central Environmental Statement & Floating Glass Telemetry */}
          <div className="auth-visual-content" style={{ marginTop: 'auto', marginBottom: '12px' }}>
            <h1 className="auth-hero-title">
              Understand the air <span>around you.</span>
            </h1>
            <p className="auth-hero-desc">
              Monitor air quality, environmental trends, pollution patterns, and real-time conditions across urban corridors.
            </p>

            {/* Floating Glass Telemetry Badges */}
            <div className="auth-telemetry-cluster">
              {/* Card 1: Live Composite AQI */}
              <div className="auth-glass-card">
                <div className="auth-glass-metric-left">
                  <div className="auth-glass-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                    <Activity size={18} color="#facc15" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Atmospheric Index
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      AQI 72
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: 'rgba(234, 179, 8, 0.18)',
                  color: '#facc15',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}>
                  MODERATE
                </span>
              </div>

              {/* Card 2: Fine Particulate Matter */}
              <div className="auth-glass-card">
                <div className="auth-glass-metric-left">
                  <div className="auth-glass-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <Wind size={18} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Particulate Matter
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      PM2.5 31 <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>µg/m³</span>
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  CLEAN BURDEN
                </span>
              </div>

              {/* Card 3: Ambient Weather Factors */}
              <div className="auth-glass-card">
                <div className="auth-glass-metric-left">
                  <div className="auth-glass-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Thermometer size={18} color="#34d399" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Micro-Climate
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      28°C <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#94a3b8' }}>• 64% Humidity</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '0.75rem' }}>
                  <Droplets size={13} /> Stable
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT PANEL: ACCESSIBLE AUTHENTICATION FORM
            ============================================================ */}
        <div className="auth-form-panel">
          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-form-brand-row">
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.2))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <LogIn size={20} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                EcoSense
              </span>
            </div>

            <h2 className="auth-form-title">
              Welcome back
            </h2>
            <p className="auth-form-subtitle">
              Sign in to continue monitoring your environment.
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
            {/* Email Field */}
            <div className="auth-input-group">
              <label htmlFor="login-email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <Mail size={17} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@ecosense.gov"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <label htmlFor="login-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <Lock size={17} />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Subtle Demo Quick Fill Bar & Admin Access Trigger */}
          <div className="auth-subtle-tools">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} color="#f59e0b" /> Academic Quick Fill:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('user')}
                className="auth-subtle-link"
                title="Pre-fill Citizen Observer credentials"
              >
                <User size={12} /> Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="auth-subtle-link"
                title="Pre-fill Administrator credentials"
              >
                <Shield size={12} /> Admin
              </button>
            </div>
          </div>

          {/* Navigation to Register */}
          <div className="auth-bottom-nav">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="auth-switch-link"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
