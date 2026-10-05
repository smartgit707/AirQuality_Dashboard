import React from 'react';
import { Cigarette, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CigaretteEquivalenceCard({ pm25 }) {
  const pmVal = Number(pm25) || 0;
  // Berkeley Earth formula: ~22 µg/m³ of PM2.5 inhaled continuously over 24 hours ≈ 1 cigarette
  const cigs = parseFloat((pmVal / 22).toFixed(1));

  let severityColor = '#10b981';
  let message = 'Minimal passive particulate burden';
  if (cigs >= 5) {
    severityColor = '#ef4444';
    message = 'Severe passive particulate deposit';
  } else if (cigs >= 2) {
    severityColor = '#f97316';
    message = 'Substantial atmospheric toxicity';
  } else if (cigs >= 1) {
    severityColor = '#fbbf24';
    message = 'Moderate involuntary inhalation';
  }

  return (
    <div 
      className="card"
      style={{
        padding: '1.25rem 1.5rem',
        borderLeft: `4px solid ${severityColor}`,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: `${severityColor}20`,
          border: `1px solid ${severityColor}40`,
          color: severityColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Cigarette size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Berkeley Earth Inhalation Equivalence
            </span>
            <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: `${severityColor}22`, color: severityColor, fontWeight: 700 }}>
              PM2.5: {pmVal} µg/m³
            </span>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
            Breathing today's ambient air continuously over 24 hours imparts a lung particulate burden roughly equal to passively smoking{' '}
            <strong style={{ color: severityColor, fontSize: '1.05rem' }}>~{cigs} cigarette{cigs === 1 ? '' : 's'}</strong>.
          </p>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '320px', textAlign: 'right' }}>
        * Based on published Berkeley Earth research (Muller & Rohde: 22 µg/m³ PM2.5 ≈ 1 cigarette/day). For academic environmental visualization.
      </div>
    </div>
  );
}
