import React, { useState, useRef } from 'react';
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
  Sparkles,
  RotateCw,
  CheckCircle2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // 3D Mouse Parallax Tilt for the visual picture panel
  const visualRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleVisualMouseMove = (e) => {
    if (isFlipped || !visualRef.current) return;
    const rect = visualRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xRatio = (x / rect.width) - 0.5;
    const yRatio = (y / rect.height) - 0.5;

    setTilt({
      rx: -yRatio * 16,
      ry: xRatio * 16,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.25
    });
  };

  const handleVisualMouseEnter = () => setIsHovered(true);
  const handleVisualMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  const toggleFlip = (e) => {
    if (e) e.stopPropagation();
    setIsFlipped(prev => !prev);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      const role = (res.user?.role || '').toUpperCase();
      const isAdminUser = role === 'ADMIN' || (res.user?.email && res.user.email.toLowerCase().includes('admin'));
      if (isAdminUser) {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAndSubmit = async (role) => {
    setError(null);
    const targetEmail = role === 'admin' ? 'admin@ecosense.gov' : 'user@ecosense.org';
    const targetPassword = role === 'admin' ? 'admin123' : 'user123';
    setEmail(targetEmail);
    setPassword(targetPassword);

    try {
      setLoading(true);
      const res = await login(targetEmail, targetPassword);
      const userRole = (res.user?.role || '').toUpperCase();
      const isAdminUser = userRole === 'ADMIN' || (res.user?.email && res.user.email.toLowerCase().includes('admin'));
      if (isAdminUser) {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Quick login encountered an issue.');
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
            LEFT PANEL: 3D HOLOGRAPHIC FLIP PORTAL
            ============================================================ */}
        <div
          style={{
            perspective: '1400px',
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '640px'
          }}
        >
          <div
            ref={visualRef}
            onMouseMove={handleVisualMouseMove}
            onMouseEnter={handleVisualMouseEnter}
            onMouseLeave={handleVisualMouseLeave}
            onClick={toggleFlip}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: '640px',
              transformStyle: 'preserve-3d',
              transition: isFlipped
                ? 'transform 0.85s cubic-bezier(0.4, 0.2, 0.2, 1)'
                : isHovered
                  ? 'transform 0.12s ease-out'
                  : 'transform 0.5s ease-out',
              transform: isFlipped
                ? 'rotateY(180deg)'
                : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(10px)`,
              cursor: 'pointer'
            }}
          >
            {/* FRONT FACE: ATMOSPHERIC ENVIRONMENTAL VISUAL */}
            <div
              className="auth-visual-panel"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: "url('/images/ecosense-login.jpg')",
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                borderRadius: '28px 0 0 28px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '44px 40px'
              }}
              role="img"
              aria-label="EcoSense Atmospheric Smart City Environment"
            >
              {/* Specular 3D Hologram Glare */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(0, 245, 160, 0.12) 40%, transparent 70%)`,
                  opacity: tilt.opacity,
                  transition: 'opacity 0.2s',
                  zIndex: 2
                }}
              />

              {/* Top Brand Tag & Interactive Flip Pill */}
              <div className="auth-visual-content" style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="auth-brand-badge">
                  <div className="auth-brand-icon-box">
                    <Wind size={16} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
                    EcoSense <span style={{ color: '#10b981', fontWeight: 600 }}>Intelligence</span>
                  </span>
                </div>

                {/* Pulsing 3D Click Hint Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    background: 'rgba(5, 26, 20, 0.85)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 245, 160, 0.45)',
                    color: '#00f5a0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 0 16px rgba(0, 245, 160, 0.35)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <RotateCw size={13} />
                  <span>Click Picture to Flip 3D</span>
                </div>
              </div>

              {/* Central Environmental Statement & Floating Glass Telemetry */}
              <div className="auth-visual-content" style={{ marginTop: 'auto', marginBottom: '12px', position: 'relative', zIndex: 3 }}>
                <h1 className="auth-hero-title">
                  Understand the air <span>around you.</span>
                </h1>
                <p className="auth-hero-desc">
                  Monitor air quality, environmental trends, pollution patterns, and real-time conditions across urban corridors.
                </p>

                {/* Floating Glass Telemetry Badges with 3D Depth */}
                <div className="auth-telemetry-cluster" style={{ transform: isHovered ? 'translateZ(25px)' : 'none', transition: 'transform 0.3s' }}>
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
                      <div className="auth-glass-icon" style={{ background: 'rgba(0, 245, 160, 0.15)', border: '1px solid rgba(0, 245, 160, 0.35)' }}>
                        <Wind size={18} color="#00f5a0" />
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
                      background: 'rgba(0, 245, 160, 0.18)',
                      color: '#00f5a0',
                      fontSize: '0.72rem',
                      fontWeight: 800
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

            {/* BACK FACE: 3D HOLOGRAPHIC BIOMETRIC FAST-PASS CONSOLE */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'linear-gradient(145deg, #05261d 0%, #031813 50%, #010c09 100%)',
                borderRadius: '28px 0 0 28px',
                padding: '44px 40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(0, 245, 160, 0.35)',
                boxShadow: 'inset 0 0 50px rgba(0, 245, 160, 0.1)',
                color: '#f8fafc'
              }}
            >
              {/* Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'rgba(0, 245, 160, 0.15)',
                      border: '1px solid rgba(0, 245, 160, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#00f5a0'
                    }}>
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                        Biometric Quick Pass
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#00f5a0' }}>
                        ● Secure Portal Authenticated
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={toggleFlip}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    <RotateCw size={13} />
                    <span>Flip to Image</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '24px' }}>
                  Choose your authorized role below to instantly enter the platform, or enter manual credentials on the right.
                </p>

                {/* Instant 1-Click Role Login Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Option 1: Admin Fast Pass */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickFillAndSubmit('admin');
                    }}
                    style={{
                      background: 'rgba(0, 245, 160, 0.08)',
                      border: '1.5px solid rgba(0, 245, 160, 0.35)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00f5a0'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.35)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(0, 245, 160, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00f5a0'
                      }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                          Administrator Pass
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Full sensor telemetry, alert broadcasting & database control
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={18} color="#00f5a0" />
                  </div>

                  {/* Option 2: Citizen Fast Pass */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickFillAndSubmit('user');
                    }}
                    style={{
                      background: 'rgba(56, 189, 248, 0.08)',
                      border: '1.5px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                      }}>
                        <User size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                          Citizen Observer Pass
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Favorite cities, personalized alerts & clean routing
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={18} color="#38bdf8" />
                  </div>
                </div>
              </div>

              {/* Bottom Security Note */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.75rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={14} color="#00f5a0" />
                <span>3D Hologram Security Module active • Click anywhere to flip back</span>
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
                background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.25), rgba(16, 185, 129, 0.25))',
                border: '1px solid rgba(0, 245, 160, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f5a0'
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

          {/* Navigation to Register and Return to Dashboard */}
          <div className="auth-bottom-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="auth-switch-link"
              >
                Create account
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#00f5a0',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                &larr; Return to Live Air Quality Platform
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
