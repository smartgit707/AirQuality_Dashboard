import React from 'react';
import { Activity, ShieldAlert, ShieldCheck, Wind } from 'lucide-react';
import { getAQIStatus } from '../data/mockData';

export default function AQICard({ aqi }) {
  const status = getAQIStatus(aqi);
  
  // Percentage calculation for 0-300+ scale meter
  const meterPercentage = Math.min(100, Math.max(5, Math.round((aqi / 300) * 100)));

  return (
    <div 
      className="aqi-hero-card" 
      style={{ 
        '--aqi-color': status.color,
        borderColor: status.badgeBorder,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient background glow corresponding to current AQI severity */}
      <div 
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${status.color}33 0%, transparent 70%)`,
          filter: 'blur(35px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <div>
          <div className="aqi-header-status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}` }} />
              <span className="card-label">Air Quality Index</span>
            </div>
            <span 
              className="aqi-badge"
              style={{ 
                backgroundColor: status.badgeBg, 
                color: status.color,
                borderColor: status.badgeBorder,
                backdropFilter: 'blur(8px)'
              }}
            >
              {status.label}
            </span>
          </div>

          <div className="aqi-main-score" style={{ margin: '1rem 0 0.5rem' }}>
            <span className="aqi-big-number" style={{ color: status.color, textShadow: `0 0 30px ${status.color}44` }}>
              {aqi}
            </span>
            <span className="card-unit" style={{ marginLeft: '6px', fontSize: '1rem', fontWeight: 700, color: '#94a3b8' }}>
              AQI
            </span>
          </div>

          <div className="aqi-status-text" style={{ color: status.color, fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>
            {status.label} Air Quality
          </div>

          <p className="aqi-description" style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.45, margin: 0 }}>
            {status.description}
          </p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          {/* Visual gradient meter bar with smooth glow */}
          <div className="aqi-meter-bar" style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div 
              className="aqi-meter-fill" 
              style={{ 
                width: `${meterPercentage}%`, 
                backgroundColor: status.color,
                boxShadow: `0 0 12px ${status.color}`
              }}
            />
          </div>

          <div className="card-footer-info" style={{ marginTop: '0.65rem', color: status.color, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
            <Activity size={14} />
            <span>{status.healthAdvice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
