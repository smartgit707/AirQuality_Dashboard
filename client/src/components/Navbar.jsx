import React from 'react';
import { Wind, Activity, RefreshCw, ArrowLeftRight } from 'lucide-react';
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
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Wind size={24} />
          </div>
          <div>
            <h1 className="brand-title">Air Quality & Environment Monitor</h1>
            <p className="brand-subtitle">Smart Environmental Intelligence Dashboard</p>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          gap: '4px'
        }}>
          <button
            onClick={() => onViewModeChange && onViewModeChange('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              background: viewMode === 'dashboard' ? 'var(--accent-blue)' : 'transparent',
              color: viewMode === 'dashboard' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Activity size={15} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onViewModeChange && onViewModeChange('compare')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              background: viewMode === 'compare' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'compare' ? '#0b1120' : 'var(--text-secondary)'
            }}
          >
            <ArrowLeftRight size={15} />
            <span>Compare Cities</span>
          </button>
        </div>

        <div className="navbar-actions">
          {/* Location Selector (Only in single dashboard mode) */}
          {viewMode === 'dashboard' && (
            <LocationSelector 
              currentCity={currentCity} 
              onCityChange={onCityChange} 
              disabled={loading} 
            />
          )}

          {/* Last Updated Indicator */}
          <div className="last-updated-badge" title="Real-time data update status">
            <span className="pulse-dot"></span>
            <span>Updated: {lastUpdated || 'Just now'}</span>
          </div>

          {/* Refresh Action Button */}
          {viewMode === 'dashboard' && (
            <button 
              onClick={onRefresh}
              className="location-selector-container"
              style={{ cursor: 'pointer', background: 'transparent' }}
              title="Refresh current city data"
              disabled={loading}
            >
              <RefreshCw 
                size={16} 
                className={`location-icon ${loading ? 'spin-animation' : ''}`} 
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
              />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
