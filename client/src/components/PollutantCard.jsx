import React, { useState, useRef } from 'react';
import { RotateCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPollutantStatus } from '../data/mockData';

const POLLUTANT_FACTS = {
  pm25: {
    formula: 'PM₂.₅',
    source: 'Vehicular emissions & industrial combustion',
    impact: 'Penetrates deep into alveolar air sacs and bloodstream',
    whoLimit: '15 µg/m³ (24h mean)'
  },
  pm10: {
    formula: 'PM₁₀',
    source: 'Construction dust, road dust & mechanical abrasion',
    impact: 'Irritates nasal passages, throat and upper bronchial tracts',
    whoLimit: '45 µg/m³ (24h mean)'
  },
  no2: {
    formula: 'NO₂',
    source: 'High-temperature diesel & gasoline engine combustion',
    impact: 'Causes airway inflammation and exacerbates asthma symptoms',
    whoLimit: '25 µg/m³ (24h mean)'
  },
  so2: {
    formula: 'SO₂',
    source: 'Thermal coal power plants & industrial fuel burning',
    impact: 'Bronchoconstriction and eye/mucous membrane irritation',
    whoLimit: '40 µg/m³ (24h mean)'
  },
  co: {
    formula: 'CO',
    source: 'Incomplete fossil fuel & biomass combustion',
    impact: 'Binds with hemoglobin reducing blood oxygen-carrying capacity',
    whoLimit: '4.0 mg/m³ (24h mean)'
  },
  o3: {
    formula: 'O₃',
    source: 'Photochemical smog reaction between NOx and VOCs under sunlight',
    impact: 'Powerful oxidant damaging lung epithelium and causing chest tightness',
    whoLimit: '100 µg/m³ (8h mean)'
  }
};

export default function PollutantCard({ name, fullName, value, unit, typeKey }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const status = getPollutantStatus(typeKey, value);
  const facts = POLLUTANT_FACTS[typeKey] || {
    formula: name,
    source: 'Ambient urban emissions',
    impact: 'General respiratory irritant',
    whoLimit: 'WHO Standard Range'
  };

  let maxRef = 100;
  if (typeKey === 'pm25') maxRef = 120;
  if (typeKey === 'pm10') maxRef = 200;
  if (typeKey === 'co') maxRef = 3.0;
  if (typeKey === 'no2') maxRef = 100;
  if (typeKey === 'so2') maxRef = 60;
  if (typeKey === 'o3') maxRef = 120;

  const percentage = Math.min(100, Math.max(8, Math.round((value / maxRef) * 100)));

  const handleMouseMove = (e) => {
    if (isFlipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xRatio = (x / rect.width) - 0.5;
    const yRatio = (y / rect.height) - 0.5;

    setTilt({
      rx: -yRatio * 18,
      ry: xRatio * 18,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.2
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  const toggleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(prev => !prev);
  };

  return (
    <div
      style={{
        perspective: '1000px',
        width: '100%',
        minHeight: '210px'
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: '210px',
          transformStyle: 'preserve-3d',
          transition: isFlipped
            ? 'transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1)'
            : isHovered
              ? 'transform 0.1s ease-out'
              : 'transform 0.45s ease-out',
          transform: isFlipped
            ? 'rotateY(180deg)'
            : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(6px)`
        }}
      >
        {/* FRONT FACE */}
        <div
          className="pollutant-card"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderTop: `2px solid ${status.color}88`,
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)'
          }}
        >
          {/* Specular glare */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.25) 0%, transparent 65%)`,
              opacity: tilt.opacity,
              transition: 'opacity 0.2s',
              zIndex: 10
            }}
          />

          <div>
            <div className="pollutant-top">
              <div>
                <div className="pollutant-name" style={{ fontSize: '1.05rem', fontWeight: 800 }}>{name}</div>
                <div className="pollutant-fullname" style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{fullName}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                <button
                  onClick={toggleFlip}
                  title="3D Flip for Chemical & Health Impact"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <RotateCw size={11} />
                </button>
              </div>
            </div>

            <div className="pollutant-value-row" style={{ margin: '0.85rem 0 0.4rem' }}>
              <span className="pollutant-value" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {value}
              </span>
              <span className="pollutant-unit" style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '4px', fontWeight: 600 }}>
                {unit}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '0.65rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.68rem', color: '#64748b' }}>
              <span>Safe: 0</span>
              <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={toggleFlip}>3D Flip ↗</span>
              <span>Max: {maxRef} {unit}</span>
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #071f18 0%, #031410 100%)',
            border: `1px solid ${status.color}55`,
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: `0 12px 30px rgba(0, 0, 0, 0.6), inset 0 0 25px ${status.color}15`,
            color: '#f8fafc'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Formula</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: status.color }}>
                  {facts.formula}
                </div>
              </div>
              <button
                onClick={toggleFlip}
                style={{
                  background: 'linear-gradient(135deg, #00f5a0, #10b981)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  color: '#052317',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Source: </span>
              {facts.source}
            </div>

            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Impact: </span>
              {facts.impact}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '0.68rem',
            color: '#34d399',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px'
          }}>
            <span>WHO Limit:</span>
            <span style={{ fontWeight: 700 }}>{facts.whoLimit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
