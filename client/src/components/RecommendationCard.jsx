import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Footprints, 
  Bike, 
  Activity, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Info
} from 'lucide-react';
import { fetchRecommendations } from '../services/api';

export default function RecommendationCard({ city, aqi }) {
  const [recData, setRecData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const loadRec = async () => {
      setLoading(true);
      try {
        const res = await fetchRecommendations(city);
        if (isSubscribed) setRecData(res);
      } catch (err) {
        console.error('[Recommendations] Error:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadRec();
    return () => { isSubscribed = false; };
  }, [city, aqi]);

  const getStatusBadge = (status) => {
    if (status === 'Recommended') {
      return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2, text: 'Recommended' };
    }
    if (status === 'Use Caution') {
      return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', icon: AlertTriangle, text: 'Use Caution' };
    }
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: XCircle, text: 'Not Advised' };
  };

  const activities = recData?.activities || {
    running: { status: 'Recommended', label: 'Running & Jogging' },
    walking: { status: 'Recommended', label: 'Walking & Strolling' },
    cycling: { status: 'Recommended', label: 'Biking & Cycling' },
    outdoorSports: { status: 'Recommended', label: 'Outdoor Sports' },
    ventilation: { status: 'Recommended', label: 'Natural Ventilation' }
  };

  return (
    <div className="card recommendation-card-section" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: '1.25rem' }}>
        <div className="metric-icon-title">
          <div className="metric-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <HeartHandshake size={22} />
          </div>
          <div>
            <h3 className="card-title">Activity & Environmental Health Guidance</h3>
            <p className="card-subtitle">
              EPA/WHO aligned outdoor activity guidelines for {city} (AQI: {aqi})
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Overview */}
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.6)', 
        padding: '1rem 1.25rem', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <span style={{ fontSize: '0.92rem', color: '#e2e8f0' }}>
            {recData?.overview || 'Standard atmospheric parameters permit general outdoor activity.'}
          </span>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Mask Advisory: <strong style={{ color: '#fff' }}>{recData?.maskAdvisory || 'Not required'}</strong>
        </div>
      </div>

      {/* Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        {Object.entries(activities).map(([key, act]) => {
          const badge = getStatusBadge(act.status);
          const Icon = badge.icon;

          return (
            <div 
              key={key} 
              style={{ 
                background: 'rgba(15, 23, 42, 0.4)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                {act.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={16} style={{ color: badge.color }} />
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: badge.color 
                }}>
                  {badge.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
        * General environmental advisories calculated dynamically from AQI & particulate levels. Not formal medical advice.
      </p>
    </div>
  );
}
