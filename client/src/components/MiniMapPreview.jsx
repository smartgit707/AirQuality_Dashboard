import React from 'react';
import { MapPin, Navigation, ArrowRight, Layers, ShieldCheck, Compass, Radio } from 'lucide-react';
import { getAqiCategory } from '../utils/calculations';

// Key metropolitan hubs positioned on a normalized 0-100% geospatial canvas of India/Region
const REGIONAL_STATIONS = [
  { name: 'Delhi', aqi: 245, x: 40, y: 28 },
  { name: 'Jaipur', aqi: 128, x: 34, y: 34 },
  { name: 'Lucknow', aqi: 182, x: 50, y: 35 },
  { name: 'Patna', aqi: 198, x: 62, y: 38 },
  { name: 'Kolkata', aqi: 168, x: 74, y: 48 },
  { name: 'Ahmedabad', aqi: 154, x: 25, y: 46 },
  { name: 'Mumbai', aqi: 95, x: 28, y: 58 },
  { name: 'Pune', aqi: 88, x: 31, y: 63 },
  { name: 'Hyderabad', aqi: 112, x: 44, y: 64 },
  { name: 'Bengaluru', aqi: 62, x: 42, y: 78 },
  { name: 'Chennai', aqi: 78, x: 50, y: 79 },
  { name: 'Kochi', aqi: 54, x: 39, y: 88 }
];

export default function MiniMapPreview({ currentCity = 'Delhi', currentAqi = 150, onNavigate, onCityChange }) {
  return (
    <section 
      className="mini-map-preview-card"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Regional Air Quality Map Preview
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '4px 0 0' }}>
            Geospatial dispersion radar across metropolitan stations &bull; Click any hub to switch location
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('map')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)',
              border: 'none',
              color: '#022013',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 245, 160, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Navigation size={14} />
            <span>Open Full Interactive Map</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Interactive GIS Radar Map Canvas */}
      <div 
        style={{ 
          height: '260px', 
          width: '100%', 
          borderRadius: '14px', 
          overflow: 'hidden', 
          position: 'relative',
          background: 'radial-gradient(ellipse at center, rgba(12, 32, 22, 0.9) 0%, rgba(5, 13, 9, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}
      >
        {/* Radar Rings & Grid Lines */}
        <svg 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.2 }}
        >
          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#00f5a0" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#00f5a0" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50%" cy="50%" r="10%" fill="none" stroke="#00f5a0" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#00f5a0" strokeWidth="0.8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#00f5a0" strokeWidth="0.8" />
        </svg>

        {/* Ambient Topography Silhouettes */}
        <div style={{ position: 'absolute', top: '12px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem' }}>
          <Radio size={13} color="#00f5a0" />
          <span>Live Sensor Telemetry Ingestion</span>
        </div>

        {/* Interactive Station Markers */}
        {REGIONAL_STATIONS.map((station) => {
          const isSelected = station.name.toLowerCase() === currentCity.toLowerCase();
          const displayAqi = isSelected ? (currentAqi || station.aqi) : station.aqi;
          const { color } = getAqiCategory(displayAqi);

          return (
            <div
              key={station.name}
              onClick={() => onCityChange && onCityChange(station.name)}
              style={{
                position: 'absolute',
                left: `${station.x}%`,
                top: `${station.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 30 : 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.2s ease'
              }}
              title={`${station.name}: ${displayAqi} AQI (Click to inspect)`}
            >
              {/* AQI Pill */}
              <div
                style={{
                  background: color,
                  color: '#03150d',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: isSelected ? `0 0 16px ${color}, 0 0 24px rgba(0, 245, 160, 0.6)` : `0 0 8px ${color}88`,
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)'
                }}
              >
                <span>{displayAqi}</span>
              </div>

              {/* Station Label */}
              <span
                style={{
                  color: isSelected ? '#00f5a0' : '#cbd5e1',
                  fontSize: '0.68rem',
                  fontWeight: isSelected ? 800 : 600,
                  marginTop: '2px',
                  background: 'rgba(5, 12, 8, 0.75)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                }}
              >
                {station.name}
              </span>

              {/* Pulse Indicator for Active City */}
              {isSelected && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '4px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #00f5a0',
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    pointerEvents: 'none'
                  }} 
                />
              )}
            </div>
          );
        })}

        {/* Floating Bottom Status Bar */}
        <div 
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            zIndex: 40,
            background: 'rgba(5, 12, 8, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)'
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block' }} />
          <span>Active Hub: <strong style={{ color: 'var(--accent-cyan)' }}>{currentCity}</strong> ({currentAqi} AQI) &bull; Cleanest Corridor Navigation</span>
        </div>
      </div>

      {/* Bottom Color Scale Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px', fontSize: '0.74rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>AQI Scale:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'Good (0-50)', color: '#10b981' },
            { label: 'Moderate (51-100)', color: '#fbbf24' },
            { label: 'Poor (101-150)', color: '#f97316' },
            { label: 'Unhealthy (151-200)', color: '#ef4444' },
            { label: 'Hazardous (201+)', color: '#8b5cf6' }
          ].map(leg => (
            <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: leg.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{leg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
