import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
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
        <div className="score-loading-container">
          <div className="loading-spinner-small"></div>
          <span>Computing score...</span>
        </div>
      </div>
    );
  }

  const { score, status, color, description, breakdown } = calculateEnvironmentalScore(data);

  return (
    <div className="card environmental-score-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-header">
        <div className="metric-icon-title">
          <div className="metric-icon-box" style={{ background: `${color}22`, color: color }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="score-header-badge-row">
              <h3 className="card-title">Environmental Health Score</h3>
              <span className="score-status-badge" style={{ backgroundColor: `${color}25`, color: color, borderColor: `${color}55` }}>
                {status}
              </span>
            </div>
            <p className="card-subtitle">EcoSense composite quality index (0–100)</p>
          </div>
        </div>
      </div>

      <div className="score-body-grid">
        <div className="score-display-box">
          <div className="score-number-group">
            <span className="score-value" style={{ color }}>{score}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-progress-bar-bg">
            <div 
              className="score-progress-bar-fill" 
              style={{ width: `${score}%`, backgroundColor: color }}
            />
          </div>
          <p className="score-summary-desc">{description}</p>
        </div>

        {breakdown && (
          <div className="score-breakdown-box">
            <div className="breakdown-title-row">
              <Info size={14} className="text-secondary" />
              <span className="breakdown-title">Index Breakdown (Rule-Based)</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Air Quality Weight (60%)</span>
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
              Non-clinical estimation for environmental comparison and outdoor safety awareness.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
