import React, { useState } from 'react';
import EarthGlobe3D from '../components/EarthGlobe3D';
import { mockCityData } from '../data/mockData';
import { 
  Globe, 
  Wind, 
  RotateCw, 
  Activity, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Eye,
  Sliders
} from 'lucide-react';

const CITIES = ['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai'];

export default function GlobePage({ onSelectCityForDashboard }) {
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [showWind, setShowWind] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const cityData = mockCityData[selectedCity] || mockCityData['Hyderabad'];

  const getAqiBadgeStyle = (aqi) => {
    if (aqi <= 50) return { bg: 'rgba(0, 245, 160, 0.15)', text: '#00f5a0', border: 'rgba(0, 245, 160, 0.4)' };
    if (aqi <= 100) return { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.4)' };
    if (aqi <= 150) return { bg: 'rgba(250, 204, 21, 0.15)', text: '#facc15', border: 'rgba(250, 204, 21, 0.4)' };
    if (aqi <= 200) return { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.4)' };
    return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      {/* Studio Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid rgba(0, 245, 160, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f5a0'
            }}>
              <Globe size={22} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Atmospheric Digital Twin <span style={{ color: '#00f5a0', fontSize: '1rem', fontWeight: 600 }}>3D STUDIO</span>
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '640px' }}>
            Interactive 3D planetary projection visualizing real-time air quality telemetry, atmospheric wind vectors, and particulate dispersion across metropolitan corridors.
          </p>
        </div>

        {/* Studio Controls Header Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: autoRotate ? 'rgba(0, 245, 160, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${autoRotate ? 'rgba(0, 245, 160, 0.45)' : 'rgba(148, 163, 184, 0.2)'}`,
              color: autoRotate ? '#00f5a0' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCw size={14} />
            <span>Auto-Rotate: {autoRotate ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowWind(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: showWind ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${showWind ? 'rgba(56, 189, 248, 0.45)' : 'rgba(148, 163, 184, 0.2)'}`,
              color: showWind ? '#38bdf8' : '#94a3b8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Wind size={14} />
            <span>Wind Vectors: {showWind ? 'ACTIVE' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* City Quick-Lock Target Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {CITIES.map(city => {
          const isSelected = selectedCity === city;
          const data = mockCityData[city] || { aqi: 75 };
          const badge = getAqiBadgeStyle(data.aqi);

          return (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                borderRadius: '12px',
                background: isSelected ? 'rgba(0, 245, 160, 0.18)' : 'rgba(15, 23, 42, 0.75)',
                border: `1px solid ${isSelected ? '#00f5a0' : 'rgba(255, 255, 255, 0.08)'}`,
                color: isSelected ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 16px rgba(0, 245, 160, 0.3)' : 'none'
              }}
            >
              <Compass size={14} color={isSelected ? '#00f5a0' : '#64748b'} />
              <span>{city}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: badge.bg,
                  color: badge.text,
                  border: `1px solid ${badge.border}`
                }}
              >
                AQI {data.aqi}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 3D Canvas Area */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
        <EarthGlobe3D
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          showWindParticles={showWind}
          autoRotate={autoRotate}
          height="620px"
        />

        {/* Action Panel in Top Right of 3D Canvas */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(5, 26, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 245, 160, 0.35)',
            borderRadius: '16px',
            padding: '16px 20px',
            color: '#f8fafc',
            maxWidth: '280px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Target Lock
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00f5a0', marginBottom: '8px' }}>
            {selectedCity} Corridor
          </div>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4', margin: '0 0 14px 0' }}>
            Current atmospheric burden indicates an AQI of <strong>{cityData.aqi}</strong> with fine PM2.5 levels at <strong>{cityData.pm25} µg/m³</strong>.
          </p>

          <button
            onClick={() => onSelectCityForDashboard && onSelectCityForDashboard(selectedCity)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f5a0, #10b981)',
              border: 'none',
              color: '#052317',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <span>Open Dashboard</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Bottom Sensor Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f5a0', marginBottom: '8px' }}>
            <Activity size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Telemetry Ground Stations</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
            5 Nodes Active
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Delhi, Hyderabad, Mumbai, Bengaluru, Chennai
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
            <Wind size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Atmospheric Simulation</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
            900 Flow Vectors
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Tropospheric particle dispersion model active
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '8px' }}>
            <ShieldCheck size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Optimal Clean Hub</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
            Bengaluru (AQI 42)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Green vegetation canopy providing natural filtration
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Critical Advisory Hub</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>
            Delhi (AQI 215)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            High particulate burden, N95 advisory active
          </div>
        </div>
      </div>
    </div>
  );
}
