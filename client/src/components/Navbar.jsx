import React from 'react';
import { Wind, Activity, RefreshCw } from 'lucide-react';
import LocationSelector from './LocationSelector';

export default function Navbar({ 
  currentCity, 
  onCityChange, 
  lastUpdated, 
  onRefresh, 
  loading,
  isApiConnected 
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

        <div className="navbar-actions">
          {/* Location Selector Dropdown */}
          <LocationSelector 
            currentCity={currentCity} 
            onCityChange={onCityChange} 
            disabled={loading} 
          />

          {/* Last Updated Indicator */}
          <div className="last-updated-badge" title="Real-time data update status">
            <span className="pulse-dot"></span>
            <span>Updated: {lastUpdated || 'Just now'}</span>
          </div>

          {/* Refresh Action Button */}
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
        </div>
      </div>
    </nav>
  );
}
