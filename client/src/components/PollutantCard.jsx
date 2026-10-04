import React from 'react';
import { getPollutantStatus } from '../data/mockData';

export default function PollutantCard({ name, fullName, value, unit, typeKey }) {
  const status = getPollutantStatus(typeKey, value);

  // Reference thresholds for visual micro-bar fill
  let maxRef = 100;
  if (typeKey === 'pm25') maxRef = 120;
  if (typeKey === 'pm10') maxRef = 200;
  if (typeKey === 'co') maxRef = 3.0;
  if (typeKey === 'no2') maxRef = 100;
  if (typeKey === 'so2') maxRef = 60;
  if (typeKey === 'o3') maxRef = 120;

  const percentage = Math.min(100, Math.max(8, Math.round((value / maxRef) * 100)));

  return (
    <div className="pollutant-card" style={{ borderTop: `2px solid ${status.color}88` }}>
      <div>
        <div className="pollutant-top">
          <div>
            <div className="pollutant-name" style={{ fontSize: '1.05rem', fontWeight: 800 }}>{name}</div>
            <div className="pollutant-fullname" style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{fullName}</div>
          </div>
          <span 
            className="pollutant-badge"
            style={{ 
              backgroundColor: `${status.color}20`, 
              color: status.color,
              border: `1px solid ${status.color}50`,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px'
            }}
          >
            {status.label}
          </span>
        </div>

        <div className="pollutant-value-row" style={{ margin: '1rem 0 0.5rem' }}>
          <span className="pollutant-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {value}
          </span>
          <span className="pollutant-unit" style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '4px', fontWeight: 600 }}>
            {unit}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div className="pollutant-bar-bg" style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            className="pollutant-bar-fill" 
            style={{ 
              width: `${percentage}%`, 
              backgroundColor: status.color,
              boxShadow: `0 0 8px ${status.color}88`
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.68rem', color: '#64748b' }}>
          <span>Safe: 0</span>
          <span>Max: {maxRef} {unit}</span>
        </div>
      </div>
    </div>
  );
}
