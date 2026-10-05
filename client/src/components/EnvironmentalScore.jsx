import React from 'react';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';
import { calculateEnvironmentalScore } from '../utils/calculations';

export default function EnvironmentalScore({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="card environmental-score-card">
        <div className="card-header">
          <div className="metric-icon-title">
            <div className="metric-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="card-title">Environmental Health Score</h3>
              <p className="card-subtitle">Composite atmospheric wellness rating</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
          <span>Evaluating environmental quality index...</span>
        </div>
      </div>
    );
  }

  const { score, status, color, description, breakdown } = calculateEnvironmentalScore(data);

  // SVG Ring calculation: Radius = 48, Circumference = 2 * PI * 48 ≈ 301.6
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div 
      className="card environmental-score-card" 
      style={{ 
        borderLeft: `4px solid ${color}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient light */}
      <div 
        style={{
          position: 'absolute',
          top: '-30px',
          left: '10%',
          width: '250px',
          height: '150px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}1a 0%, transparent 70%)`,
          filter: 'blur(35px)',
          pointerEvents: 'none'
        }}
      />

      <div className="card-header" style={{ position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
        <div className="metric-icon-title">
          <div className="metric-icon-box" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40`, boxShadow: `0 0 12px ${color}30` }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="score-header-badge-row">
              <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>Environmental Health Score</h3>
              <span className="score-status-badge" style={{ backgroundColor: `${color}25`, color: color, borderColor: `${color}55` }}>
                {status}
              </span>
            </div>
            <p className="card-subtitle">EcoSense composite quality index (0–100)</p>
          </div>
        </div>
      </div>

      <div className="score-body-grid" style={{ position: 'relative', zIndex: 1 }}>
        {/* Left: SVG Ring & Description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="9"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/100</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color, marginBottom: '4px' }}>
              {status} Environmental Wellness
            </div>
            <p className="score-summary-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              {description}
            </p>
          </div>
        </div>

        {/* Right: Breakdown Pill Bars */}
        {breakdown && (
          <div className="score-breakdown-box">
            <div className="breakdown-title-row">
              <Info size={14} className="text-secondary" />
              <span className="breakdown-title">Index Weights (Explainable Formula)</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Air Quality Impact (60%)</span>
              <span className="breakdown-val font-mono">{breakdown.aqiContribution} / 60 pts</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Particulate Burden (25%)</span>
              <span className="breakdown-val font-mono">{breakdown.particulateContribution} / 25 pts</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Weather Comfort (15%)</span>
              <span className="breakdown-val font-mono">{breakdown.weatherContribution} / 15 pts</span>
            </div>
            <div className="breakdown-footer-note">
              Non-clinical estimation for environmental comparison and outdoor awareness.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
