import React from 'react';
import { getPollutantStatus } from '../data/mockData';

export default function PollutantCard({ name, fullName, value, unit, typeKey }) {
  const status = getPollutantStatus(typeKey, value);

  // Approximate relative indicator fill
  let maxRef = 100;
  if (typeKey === 'pm25') maxRef = 120;
  if (typeKey === 'pm10') maxRef = 200;
  if (typeKey === 'co') maxRef = 3.0;
  if (typeKey === 'no2') maxRef = 100;
  if (typeKey === 'so2') maxRef = 60;
  if (typeKey === 'o3') maxRef = 120;

  const percentage = Math.min(100, Math.max(10, Math.round((value / maxRef) * 100)));

  return (
    <div className="pollutant-card">
      <div>
        <div className="pollutant-top">
          <div>
            <div className="pollutant-name">{name}</div>
            <div className="pollutant-fullname">{fullName}</div>
          </div>
          <span 
            className="pollutant-badge"
            style={{ 
              backgroundColor: status.bg, 
              color: status.color,
              border: `1px solid ${status.color}40`
            }}
          >
            {status.label}
          </span>
        </div>

        <div className="pollutant-value-row">
          <span className="pollutant-value">{value}</span>
          <span className="pollutant-unit">{unit}</span>
        </div>
      </div>

      <div className="pollutant-bar-bg">
        <div 
          className="pollutant-bar-fill" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: status.color 
          }}
        />
      </div>
    </div>
  );
}
