import React from 'react';
import TiltCard3D from './TiltCard3D';

export default function MetricCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  accentColor = '#06b6d4', 
  subtitle 
}) {
  return (
    <TiltCard3D maxTilt={12} scale={1.025}>
      <div 
        className="metric-card"
        style={{
          borderTop: `3px solid ${accentColor}`,
          position: 'relative',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        {/* Subtle corner light */}
        <div 
          style={{
            position: 'absolute',
            top: '-25px',
            right: '-25px',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: `${accentColor}18`,
            filter: 'blur(15px)',
            pointerEvents: 'none'
          }}
        />

        <div className="card-top">
          <span className="card-label" style={{ letterSpacing: '0.04em' }}>{label}</span>
          <div 
            className="card-icon-chip"
            style={{ 
              color: accentColor, 
              backgroundColor: `${accentColor}18`,
              border: `1px solid ${accentColor}33`,
              boxShadow: `0 0 10px ${accentColor}22`
            }}
          >
            {Icon && <Icon size={18} />}
          </div>
        </div>

        <div className="card-value-group" style={{ margin: '0.85rem 0 0.35rem' }}>
          <span className="card-numeric-value" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {value}
          </span>
          <span className="card-unit" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '4px' }}>
            {unit}
          </span>
        </div>

        {subtitle && (
          <div className="card-footer-info" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>{subtitle}</span>
          </div>
        )}
      </div>
    </TiltCard3D>
  );
}
