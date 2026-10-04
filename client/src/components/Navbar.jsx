import React from 'react';
import { 
  Wind, 
  Activity, 
  MapPin, 
  BarChart2, 
  ArrowLeftRight, 
  Sparkles, 
  Bell, 
  TrendingUp, 
  FileText, 
  Server, 
  RefreshCw,
  User,
  Shield,
  LogIn,
  LogOut,
  Sliders,
  Home,
  Bot
} from 'lucide-react';
import LocationSelector from './LocationSelector';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  currentCity, 
  onCityChange, 
  lastUpdated, 
  onRefresh, 
  loading,
  isApiConnected,
  viewMode = 'dashboard',
  onViewModeChange
}) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const baseNavItems = [
    { key: 'dashboard', label: 'Overview', icon: Activity },
    { key: 'copilot', label: 'AI Copilot', icon: Bot, copilotBadge: true },
    { key: 'map', label: 'Map', icon: MapPin },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
    { key: 'compare', label: 'Compare', icon: ArrowLeftRight },
    { key: 'forecast', label: 'Forecast', icon: Sparkles },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'reports', label: 'Reports', icon: FileText },
  ];

  // Role-aware custom tabs
  const navItems = [...baseNavItems];
  if (isAuthenticated) {
    if (isAdmin) {
      navItems.push({ key: 'admin', label: 'Admin Console', icon: Shield, adminBadge: true });
    } else {
      navItems.push({ key: 'user-dashboard', label: 'My Portal', icon: User });
      navItems.push({ key: 'my-environment', label: 'My Station', icon: Home });
    }
  }

  const showLocationSelector = ['dashboard', 'copilot', 'analytics', 'forecast', 'trends', 'reports'].includes(viewMode);

  const handleLogout = () => {
    logout();
    onViewModeChange('dashboard');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* EcoSense Logo & Tagline */}
        <div className="navbar-brand" onClick={() => onViewModeChange('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper" style={{ background: 'linear-gradient(135deg, #00f5a0 0%, #10b981 50%, #a3e635 100%)', boxShadow: '0 0 20px rgba(0, 245, 160, 0.45)' }}>
            <Wind size={22} style={{ color: '#052317' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 className="brand-title" style={{ letterSpacing: '0.02em', fontSize: '1.25rem', fontWeight: 800 }}>
                EcoSense
              </h1>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.15)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                INTELLIGENCE
              </span>
            </div>
            <p className="brand-subtitle" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Monitor. Analyze. Compare. Predict.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="navbar-nav-tabs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = viewMode === item.key || (item.key === 'admin' && viewMode.startsWith('admin-'));
            return (
              <button
                key={item.key}
                onClick={() => onViewModeChange && onViewModeChange(item.key)}
                className={`nav-tab-button ${isActive ? 'active' : ''}`}
                type="button"
                style={{
                  position: 'relative',
                  ...(item.adminBadge ? {
                    borderColor: isActive ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                    color: isActive ? '#818cf8' : '#a5b4fc',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
                  } : {})
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Actions Area */}
        <div className="navbar-actions">
          {/* Location Selector (when applicable) */}
          {showLocationSelector && (
            <LocationSelector 
              currentCity={currentCity} 
              onCityChange={onCityChange} 
              disabled={loading} 
            />
          )}

          {/* Last Updated Indicator */}
          <div className="last-updated-badge" title="Real-time data update status">
            <span className="pulse-dot"></span>
            <span>{lastUpdated || 'Just now'}</span>
          </div>

          {/* Refresh Action Button */}
          {showLocationSelector && (
            <button 
              onClick={onRefresh}
              className="location-selector-container refresh-action-btn"
              title="Force synchronize latest environmental telemetry"
              disabled={loading}
              aria-label="Refresh telemetry"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <RefreshCw 
                size={16} 
                className={loading ? 'spin' : ''} 
                style={{ color: loading ? 'var(--accent-blue)' : '#fff' }}
              />
              <span className="refresh-label">{loading ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          {/* Authentication & User Session Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
            {isAuthenticated ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 6px 4px 10px',
                borderRadius: '12px'
              }}>
                {/* User Info / Role chip */}
                <div
                  onClick={() => onViewModeChange(isAdmin ? 'admin' : 'user-dashboard')}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Open user portal"
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '8px',
                    background: isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #00f5a0, #10b981)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isAdmin ? <Shield size={13} color="#ffffff" /> : <User size={13} color="#ffffff" />}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isAdmin ? '#818cf8' : '#34d399'
                  }}>
                    {user?.role}
                  </span>
                </div>

                {/* Settings Gear */}
                <button
                  type="button"
                  onClick={() => onViewModeChange('settings')}
                  title="Settings & Preferences"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Sliders size={14} />
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out of EcoSense"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => onViewModeChange('login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f1f5f9',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <LogIn size={13} /> Sign In
                </button>

                <button
                  type="button"
                  onClick={() => onViewModeChange('register')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00f5a0, #059669)',
                    border: 'none',
                    color: '#052317',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(0, 245, 160, 0.35)',
                    cursor: 'pointer'
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
