import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCheck, 
  Clock, 
  Filter, 
  RefreshCw,
  MapPin
} from 'lucide-react';
import { fetchAlerts, markAlertRead } from '../services/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [error, setError] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAlerts();
      setAlerts(res.alerts || []);
    } catch (err) {
      console.error('[Alerts] Error fetching alerts:', err);
      setError('Unable to retrieve alerts from system.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAlertRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('[Alerts] Could not mark read:', err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const getSeverityBadge = (severity) => {
    if (severity === 'CRITICAL') {
      return {
        icon: AlertOctagon,
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.4)'
      };
    }
    if (severity === 'WARNING') {
      return {
        icon: AlertTriangle,
        color: '#f97316',
        bg: 'rgba(249, 115, 22, 0.15)',
        border: 'rgba(249, 115, 22, 0.4)'
      };
    }
    return {
      icon: Info,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.4)'
    };
  };

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-group">
          <h1>
            <span>Smart Environmental</span>
            <span className="city-highlight"> Notification & Alerts</span>
          </h1>
          <p>
            Automated threshold surveillance for particulate spikes, AQI violations, and severe micro-climate events
          </p>
        </div>

        <button 
          onClick={loadAlerts}
          className="location-selector-container"
          style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: 'var(--bg-card)', color: '#fff' }}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Alert Configuration Console (Section 19) */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '1.5rem', 
          padding: '1.5rem',
          background: 'rgba(12, 24, 18, 0.85)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Personalized Alert Surveillance Thresholds
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
              Configure automatic push triggers for AQI excursions and particulate spikes
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            ● Active Real-Time Guard
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* AQI Threshold Slider */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
              <span>AQI Warning Limit:</span>
              <strong style={{ color: '#00f5a0' }}>150 AQI (Sensitive)</strong>
            </div>
            <input 
              type="range" 
              min="50" 
              max="300" 
              defaultValue="150" 
              style={{ width: '100%', accentColor: '#00f5a0' }} 
            />
          </div>

          {/* Preferred City */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Preferred Monitored Hub:</span>
            <select 
              defaultValue="Delhi" 
              style={{ width: '100%', background: '#0a140f', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', borderRadius: '6px', padding: '6px', fontSize: '0.85rem' }}
            >
              {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Pollutant Monitors */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Criteria Pollutants to Guard:</span>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#f8fafc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#00f5a0' }} /> PM2.5
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#00f5a0' }} /> PM10
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#00f5a0' }} /> Ozone
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Counter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={18} style={{ color: unreadCount > 0 ? '#ef4444' : '#10b981' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
              {unreadCount} Unresolved Alert{unreadCount === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`range-pill ${filterSeverity === sev ? 'active' : ''}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-box-warning" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 10px' }} />
            <span>Scanning alert feeds...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <CheckCheck size={40} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>No Alerts in Current Filter</h3>
            <p style={{ fontSize: '0.9rem' }}>All environmental parameters are currently within normal baseline thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const style = getSeverityBadge(alert.severity);
            const Icon = style.icon;
            const timeStr = alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Recent';

            return (
              <div 
                key={alert.id}
                className="card"
                style={{
                  padding: '1.15rem 1.4rem',
                  borderLeft: `4px solid ${style.color}`,
                  background: alert.is_read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.85)',
                  opacity: alert.is_read ? 0.75 : 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: style.bg,
                    border: `1px solid ${style.border}`,
                    color: style.color,
                    flexShrink: 0
                  }}>
                    <Icon size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} style={{ color: '#94a3b8' }} />
                        {alert.city}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {timeStr}
                      </span>
                    </div>

                    <p style={{ color: '#e2e8f0', fontSize: '0.92rem', margin: '4px 0 0', lineHeight: 1.4 }}>
                      {alert.message}
                    </p>

                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
                      Trigger: <strong style={{ color: '#f8fafc' }}>{alert.metric}</strong> &bull; Value: <span style={{ color: style.color, fontWeight: 700 }}>{alert.value}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {!alert.is_read ? (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        color: '#38bdf8',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCheck size={14} />
                      <span>Mark Read</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
