import React, { useState, useRef } from 'react';
import { 
  Activity, 
  RotateCw, 
  ShieldAlert, 
  ShieldCheck, 
  Wind, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';
import { getAQIStatus } from '../data/mockData';

export default function AQICard({ aqi }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const status = getAQIStatus(aqi);
  const meterPercentage = Math.min(100, Math.max(5, Math.round((aqi / 300) * 100)));

  // Mouse tilt tracking
  const handleMouseMove = (e) => {
    if (isFlipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xRatio = (x / rect.width) - 0.5;
    const yRatio = (y / rect.height) - 0.5;

    setTilt({
      rx: -yRatio * 16,
      ry: xRatio * 16,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.22
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
        perspective: '1200px',
        width: '100%',
        minHeight: '340px'
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
          minHeight: '340px',
          transformStyle: 'preserve-3d',
          transition: isFlipped
            ? 'transform 0.75s cubic-bezier(0.4, 0.2, 0.2, 1)'
            : isHovered
              ? 'transform 0.12s ease-out'
              : 'transform 0.5s ease-out',
          transform: isFlipped
            ? 'rotateY(180deg)'
            : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(8px)`
        }}
      >
        {/* ============================================================
            FRONT FACE OF THE 3D CARD
            ============================================================ */}
        <div
          className="aqi-hero-card"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            '--aqi-color': status.color,
            borderColor: status.badgeBorder,
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(0, 245, 160, 0.05)'
          }}
        >
          {/* Ambient background glow */}
          <div 
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${status.color}33 0%, transparent 70%)`,
              filter: 'blur(40px)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* Dynamic 3D Glare */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.3) 0%, rgba(0, 245, 160, 0.1) 40%, transparent 70%)`,
              opacity: tilt.opacity,
              transition: 'opacity 0.2s',
              zIndex: 10
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="aqi-header-status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}` }} />
                <span className="card-label">Air Quality Index</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                {/* 3D Flip Trigger Button */}
                <button
                  onClick={toggleFlip}
                  title="3D Flip for WHO Clinical Guidelines & Sensor Specs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    transition: 'all 0.2s'
                  }}
                >
                  <RotateCw size={12} />
                  <span>3D Flip</span>
                </button>
              </div>
            </div>

            <div className="aqi-main-score" style={{ margin: '1rem 0 0.5rem' }}>
              <span className="aqi-big-number" style={{ color: status.color, textShadow: `0 0 35px ${status.color}55` }}>
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

          <div style={{ position: 'relative', zIndex: 1, marginTop: '1.5rem' }}>
            <div className="aqi-meter-bar" style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div 
                className="aqi-meter-fill" 
                style={{ 
                  width: `${meterPercentage}%`, 
                  backgroundColor: status.color,
                  boxShadow: `0 0 14px ${status.color}`
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem' }}>
              <div className="card-footer-info" style={{ color: status.color, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                <Activity size={14} />
                <span>{status.healthAdvice}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', cursor: 'pointer' }} onClick={toggleFlip}>
                Click 3D Flip ↗
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================
            BACK FACE OF THE 3D CARD (WHO & CLINICAL METRICS)
            ============================================================ */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #06231c 0%, #031410 50%, #020b08 100%)',
            border: `1px solid ${status.badgeBorder}`,
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: `0 20px 45px rgba(0, 0, 0, 0.7), inset 0 0 40px ${status.color}15`,
            color: '#f8fafc'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(0, 245, 160, 0.15)',
                  border: '1px solid rgba(0, 245, 160, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f5a0'
                }}>
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    Clinical & WHO Standards
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    Sensor Telemetry Deep Inspection
                  </span>
                </div>
              </div>

              <button
                onClick={toggleFlip}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00f5a0, #10b981)',
                  border: 'none',
                  color: '#052317',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                <RotateCw size={12} />
                <span>Return</span>
              </button>
            </div>

            {/* Structured Insights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>WHO 24h Threshold</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#00f5a0', marginTop: '2px' }}>
                  {aqi <= 50 ? 'Compliant (Safe)' : `${(aqi / 50).toFixed(1)}x Exceeded`}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Physiological Target</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  {aqi > 150 ? 'Lower Alveoli' : 'Upper Airway'}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Vulnerable Cohort</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fb923c', marginTop: '2px' }}>
                  Asthma & Elderly
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sensor Tech</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                  Laser Nephelometer
                </div>
              </div>
            </div>

            <div style={{ marginTop: '14px', background: 'rgba(0, 245, 160, 0.07)', border: '1px solid rgba(0, 245, 160, 0.2)', borderRadius: '12px', padding: '10px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#00f5a0', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} />
                <span>Actionable Advisory</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {aqi <= 100 
                  ? 'Natural outdoor ventilation recommended. Optimal window for aerobic cardio.'
                  : 'Seal roadside windows during rush hour. Run HEPA filtration units indoors.'}
              </p>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '10px' }}>
            Calibrated with CPCB & Open-Meteo Environmental Array
          </div>
        </div>
      </div>
    </div>
  );
}
