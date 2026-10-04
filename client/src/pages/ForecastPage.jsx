import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Compass, 
  ShieldAlert, 
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { fetchForecast } from '../services/api';
import { getAqiCategory } from '../utils/calculations';

const CITIES = ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];

export default function ForecastPage({ defaultCity = 'Delhi' }) {
  const [city, setCity] = useState(defaultCity);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const loadForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchForecast(city);
        if (isSubscribed) setForecastData(res);
      } catch (err) {
        if (isSubscribed) {
          console.error('[Forecast] Error:', err);
          setError('Failed to compute atmospheric projection for this city.');
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadForecast();
    return () => { isSubscribed = false; };
  }, [city]);

  const peak = forecastData?.expectedPeak;
  const lowest = forecastData?.expectedLowest;
  const hourly = forecastData?.hourlyForecast || [];

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-group">
          <h1>
            <span>Diurnal Atmospheric</span>
            <span className="city-highlight"> AQI Forecast (24h)</span>
          </h1>
          <p>
            Projected air quality trends and expected particulate dispersion over the coming 24-hour cycle
          </p>
        </div>

        {/* City Selector */}
        <div className="filter-group" style={{ minWidth: '200px' }}>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            className="location-selector"
          >
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Estimation Transparency Banner */}
      <div className="card" style={{ 
        background: 'rgba(56, 189, 248, 0.08)', 
        borderColor: 'rgba(56, 189, 248, 0.25)', 
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <Info size={20} style={{ color: '#38bdf8', flexShrink: 0 }} />
        <div style={{ fontSize: '0.88rem', color: '#e0f2fe' }}>
          <strong>Mathematical Estimation Model:</strong> Projections utilize weighted diurnal atmospheric decay curves. 
          Clearly distinguished as <em>Estimated AQI</em> for preview and academic evaluation (non-clinical).
        </div>
      </div>

      {error && (
        <div className="alert-box-warning" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="analytics-stats-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Expected Peak */}
        <div className="card stat-summary-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="stat-summary-label">Expected Peak AQI</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: '#ef4444' }}>
              {loading ? '...' : peak?.estimatedAqi}
            </span>
            <span className="stat-summary-unit">AQI</span>
          </div>
          <span className="stat-summary-sub">
            At {peak?.time} &bull; {peak?.status}
          </span>
        </div>

        {/* Expected Lowest */}
        <div className="card stat-summary-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="stat-summary-label">Expected Lowest AQI</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: '#10b981' }}>
              {loading ? '...' : lowest?.estimatedAqi}
            </span>
            <span className="stat-summary-unit">AQI</span>
          </div>
          <span className="stat-summary-sub">
            At {lowest?.time} &bull; {lowest?.status}
          </span>
        </div>

        {/* Model Baseline */}
        <div className="card stat-summary-card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <span className="stat-summary-label">Current Reference Baseline</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: '#38bdf8' }}>
              {loading ? '...' : forecastData?.baseAqi}
            </span>
            <span className="stat-summary-unit">AQI</span>
          </div>
          <span className="stat-summary-sub">Latest live synchronized point</span>
        </div>

        {/* Outlook */}
        <div className="card stat-summary-card" style={{ gridColumn: 'span 2', borderLeft: '4px solid #fbbf24' }}>
          <span className="stat-summary-label">Atmospheric Outlook</span>
          <p style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 500, margin: '6px 0 0' }}>
            {loading ? 'Analyzing atmospheric parameters...' : forecastData?.overallCondition}
          </p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
              Estimated 24-Hour AQI Progression Curve
            </h3>
            <p className="card-subtitle">
              Calculated diurnal progression adjusted for localized diurnal stagnation
            </p>
          </div>
          <div className="chart-legend-badge">
            <span className="pulse-dot-indicator" style={{ backgroundColor: '#38bdf8' }} />
            <span>Estimated AQI</span>
          </div>
        </div>

        <div style={{ height: '360px', width: '100%' }}>
          {loading ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <div className="pulse-dot" style={{ marginRight: '10px' }} />
              <span>Generating forecast trajectory...</span>
            </div>
          ) : hourly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} unit=" AQI" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(val, name, props) => [
                    `${val} AQI (${props.payload.status})`, 
                    'Estimated AQI'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="estimatedAqi" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#forecastGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              No forecast projection available.
            </div>
          )}
        </div>
      </div>

      {/* Hourly Timeline Cards */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1.25rem', fontSize: '1.15rem' }}>
          Expected Progression Intervals
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.85rem' }}>
          {hourly.map((h, i) => {
            const { color } = getAqiCategory(h.estimatedAqi);
            return (
              <div 
                key={i} 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  borderTop: `3px solid ${color}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{h.time}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Conf: {h.confidence}</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color }}>
                  {h.estimatedAqi} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>AQI</span>
                </div>
                <div style={{ fontSize: '0.75rem', color, marginTop: '2px', fontWeight: 600 }}>
                  {h.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
