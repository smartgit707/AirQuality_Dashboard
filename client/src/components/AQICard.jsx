import React from 'react';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { getAQIStatus } from '../data/mockData';

export default function AQICard({ aqi }) {
  const status = getAQIStatus(aqi);
  
  // Calculate percentage fill for 0-300+ scale meter
  const meterPercentage = Math.min(100, Math.round((aqi / 300) * 100));

  return (
    <div 
      className="aqi-hero-card" 
      style={{ 
        '--aqi-color': status.color,
        borderColor: status.badgeBorder
      }}
    >
      <div>
        <div className="aqi-header-status">
          <span className="card-label">Air Quality Index</span>
          <span 
            className="aqi-badge"
            style={{ 
              backgroundColor: status.badgeBg, 
              color: status.color,
              border: `1px solid ${status.badgeBorder}` 
            }}
          >
            {status.label}
          </span>
        </div>

        <div className="aqi-main-score">
          <span className="aqi-big-number" style={{ color: status.color }}>
            {aqi}
          </span>
          <span className="card-unit">AQI</span>
        </div>

        <div className="aqi-status-text" style={{ color: status.color }}>
          Status: {status.label}
        </div>

        <p className="aqi-description">
          {status.description}
        </p>
      </div>

      <div>
        {/* Dynamic Visual Scale Meter */}
        <div className="aqi-meter-bar">
          <div 
            className="aqi-meter-fill" 
            style={{ 
              width: `${meterPercentage}%`, 
              backgroundColor: status.color 
            }}
          />
        </div>
        <div className="card-footer-info" style={{ marginTop: '0.5rem', color: status.color }}>
          <Activity size={14} />
          <span>{status.healthAdvice}</span>
        </div>
      </div>
    </div>
  );
}
