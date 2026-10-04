import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle,
  Building2,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { fetchCityLatest, fetchAnalytics, fetchAlerts } from '../services/api';
import { calculateEnvironmentalScore, getAqiCategory } from '../utils/calculations';

const CITIES = ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];

export default function ReportsPage({ defaultCity = 'Delhi' }) {
  const [city, setCity] = useState(defaultCity);
  const [range, setRange] = useState('24h');
  const [cityData, setCityData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const loadReportData = async () => {
      setLoading(true);
      try {
        const [latestRes, aqiAnalyticsRes, alertRes] = await Promise.all([
          fetchCityLatest(city),
          fetchAnalytics(city, 'aqi', range),
          fetchAlerts()
        ]);

        if (isSubscribed) {
          setCityData(latestRes);
          setAnalytics(aqiAnalyticsRes);
          const cityAlerts = (alertRes.alerts || []).filter(a => a.city.toLowerCase() === city.toLowerCase());
          setAlerts(cityAlerts);
        }
      } catch (err) {
        console.error('[Reports] Error loading data:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadReportData();
    return () => { isSubscribed = false; };
  }, [city, range]);

  const handlePrint = () => {
    window.print();
  };

  const aqiStats = analytics?.stats || { average: 75, minimum: 50, maximum: 120, percentageChange: 0 };
  const healthScore = cityData ? calculateEnvironmentalScore(cityData) : { score: 70, status: 'Favorable', color: '#10b981' };
  const { label: aqiStatusLabel, color: aqiColor } = getAqiCategory(cityData?.aqi || aqiStats.average);

  return (
    <div className="dashboard-container printable-report-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header and Print Control */}
      <div className="dashboard-header no-print">
        <div className="header-title-group">
          <h1>
            <span>Environmental</span>
            <span className="city-highlight"> Intelligence Report</span>
          </h1>
          <p>
            Official comprehensive environmental telemetry dossier and station audit summary
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* City Selector */}
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="location-selector"
          >
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Range Selector */}
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="location-selector"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Print/Export Button */}
          <button 
            onClick={handlePrint}
            className="location-selector-container"
            style={{ 
              cursor: 'pointer', 
              padding: '0.5rem 1.15rem', 
              background: 'var(--accent-blue)', 
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="card report-document" style={{ 
        padding: '2.5rem', 
        backgroundColor: '#0f172a',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Document Formal Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>🌿</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                ECOSENSE PLATFORM
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Intelligent Air Quality & Environmental Monitoring &bull; Academic Research Dossier
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '4px 10px', 
              borderRadius: '4px', 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '0.8rem',
              marginBottom: '4px'
            }}>
              OFFICIAL TELEMETRY AUDIT
            </span>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Station Target Info */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem',
          background: 'rgba(15, 23, 42, 0.5)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>Target City</span>
            <strong style={{ display: 'block', fontSize: '1.25rem', color: '#fff' }}>{city}</strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{cityData?.state || 'Metropolitan Territory'}</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>Audit Timeline</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#fff' }}>
              {range === '24h' ? '24 Hours Window' : range === '7d' ? '7 Days Window' : '30 Days Window'}
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Continuous sampling</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>Overall Rating</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: aqiColor }}>{aqiStatusLabel}</strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Current severity classification</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>EcoSense Health Score</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: healthScore.color }}>
              {healthScore.score} / 100 ({healthScore.status})
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Composite rule-based metric</span>
          </div>
        </div>

        {/* Section 1: Statistical Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', borderLeft: '3px solid #38bdf8', paddingLeft: '8px', marginBottom: '1rem' }}>
            1. Atmospheric & Pollutant Concentration Averages
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Average AQI</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>{aqiStats.average}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Min: {aqiStats.minimum} | Max: {aqiStats.maximum}</span>
            </div>

            <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>PM2.5 Average</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>
                {cityData?.pm25 || 34} <span style={{ fontSize: '0.8rem' }}>µg/m³</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fine inhalable particles</span>
            </div>

            <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>PM10 Average</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a855f7' }}>
                {cityData?.pm10 || 61} <span style={{ fontSize: '0.8rem' }}>µg/m³</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Coarse dust fraction</span>
            </div>

            <div className="card" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ambient Temp</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f97316' }}>
                {cityData?.temperature || 28}°C
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Humidity: {cityData?.humidity || 65}%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Alert Log */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', borderLeft: '3px solid #f97316', paddingLeft: '8px', marginBottom: '1rem' }}>
            2. Station Threshold Incidents ({alerts.length})
          </h3>

          {alerts.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
              No critical threshold violations logged for this station within the sampling period.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {alerts.map(a => (
                <div key={a.id} style={{ 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ color: a.severity === 'CRITICAL' ? '#ef4444' : '#f97316', marginRight: '8px' }}>
                      [{a.severity}]
                    </strong>
                    <span style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{a.message}</span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Summary Synthesis */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', borderLeft: '3px solid #10b981', paddingLeft: '8px', marginBottom: '1rem' }}>
            3. Environmental Diagnosis & Recommendations
          </h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Based on collected atmospheric telemetry, {city} exhibits an Air Quality Index of <strong>{cityData?.aqi}</strong> classified as <strong>{aqiStatusLabel}</strong>. 
            The calculated EcoSense Environmental Health Score stands at <strong>{healthScore.score}/100</strong>. 
            Outdoor activities should adhere to standard regional meteorological guidelines with consideration for sensitive demographics.
          </p>
        </div>

        {/* Formal Footer */}
        <div style={{ 
          marginTop: '2.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#64748b',
          fontSize: '0.8rem'
        }}>
          <div>EcoSense &bull; Intelligent Air Quality & Environmental Monitoring Platform</div>
          <div>Academic Full-Stack Engineering Showcase</div>
        </div>
      </div>
    </div>
  );
}
