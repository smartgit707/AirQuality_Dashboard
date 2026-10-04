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
  RefreshCw 
} from 'lucide-react';
import LocationSelector from './LocationSelector';

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
  const navItems = [
    { key: 'dashboard', label: 'Overview', icon: Activity },
    { key: 'map', label: 'Map', icon: MapPin },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
    { key: 'compare', label: 'Compare', icon: ArrowLeftRight },
    { key: 'forecast', label: 'Forecast', icon: Sparkles },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'system', label: 'System', icon: Server },
  ];

  const showLocationSelector = ['dashboard', 'analytics', 'forecast', 'trends', 'reports'].includes(viewMode);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* EcoSense Logo & Tagline */}
        <div className="navbar-brand" onClick={() => onViewModeChange('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)' }}>
            <Wind size={22} style={{ color: '#0b1120' }} />
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
            const isActive = viewMode === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onViewModeChange && onViewModeChange(item.key)}
                className={`nav-tab-button ${isActive ? 'active' : ''}`}
                type="button"
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
        </div>
      </div>
    </nav>
  );
}
