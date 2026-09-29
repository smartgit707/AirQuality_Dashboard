import React from 'react';

export default function MetricCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  accentColor = '#06b6d4', 
  subtitle 
}) {
  return (
    <div className="metric-card">
      <div className="card-top">
        <span className="card-label">{label}</span>
        <div 
          className="card-icon-chip"
          style={{ 
            color: accentColor, 
            backgroundColor: `${accentColor}18` 
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div className="card-value-group">
        <span className="card-numeric-value">{value}</span>
        <span className="card-unit">{unit}</span>
      </div>

      {subtitle && (
        <div className="card-footer-info">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
