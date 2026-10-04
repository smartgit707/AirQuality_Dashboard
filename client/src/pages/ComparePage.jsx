import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Check, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { fetchMultiComparison } from '../services/api';
import { getAqiCategory, calculateEnvironmentalScore } from '../utils/calculations';

const ALL_CITIES = ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];
const CITY_COLORS = {
  Chennai: '#38bdf8',
  Hyderabad: '#34d399',
  Delhi: '#ef4444',
  Mumbai: '#fbbf24',
  Bengaluru: '#a855f7'
};

export default function ComparePage() {
  const [selectedCities, setSelectedCities] = useState(['Delhi', 'Bengaluru', 'Chennai']);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComparison = async (cities) => {
    if (cities.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMultiComparison(cities);
      setComparisonResult(res);
    } catch (err) {
      console.error('[Compare] Error:', err);
      setError('Unable to load comparative telemetry for the selected cities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison(selectedCities);
  }, [selectedCities]);

  const toggleCity = (city) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length <= 2) {
        alert('Please keep at least 2 cities for comparative analysis.');
        return;
      }
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      if (selectedCities.length >= 5) {
        alert('Maximum 5 cities can be compared simultaneously.');
        return;
      }
      setSelectedCities([...selectedCities, city]);
    }
  };

  const citiesData = comparisonResult?.cities || [];
  const highlights = comparisonResult?.highlights;
  const mergedTrend = comparisonResult?.mergedTrend || [];

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-group">
          <h1>
            <span>Multi-City</span>
            <span className="city-highlight"> Environmental Comparison</span>
          </h1>
          <p>
            Cross-station atmospheric benchmark across up to 5 metropolitan monitoring centres
          </p>
        </div>

        <button 
          onClick={() => loadComparison(selectedCities)}
          className="location-selector-container"
          style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: 'var(--bg-card)', color: '#fff' }}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* City Selector Pills */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Select Cities to Compare (2 to 5):
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {ALL_CITIES.map(c => {
              const isSelected = selectedCities.includes(c);
              const color = CITY_COLORS[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCity(c)}
                  className={`range-pill ${isSelected ? 'active' : ''}`}
                  style={{
                    borderColor: isSelected ? color : 'var(--border-color)',
                    backgroundColor: isSelected ? `${color}25` : 'transparent',
                    color: isSelected ? '#fff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                  <span>{c}</span>
                  {isSelected && <Check size={13} style={{ color }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-box-warning" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Automated Winners / Critical Highlights */}
      {highlights && (
        <div className="analytics-stats-grid" style={{ marginBottom: '1.5rem' }}>
          {/* Best Air Quality */}
          <div className="card stat-summary-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', marginBottom: '4px' }}>
              <Award size={18} />
              <span className="stat-summary-label" style={{ color: '#10b981', margin: 0 }}>Cleanest Air Quality</span>
            </div>
            <div className="stat-summary-value-row">
              <span className="stat-summary-num" style={{ color: '#10b981' }}>{highlights.bestAirQuality.city}</span>
            </div>
            <span className="stat-summary-sub">
              AQI {highlights.bestAirQuality.aqi} &bull; {highlights.bestAirQuality.status}
            </span>
          </div>

          {/* Highest Pollution */}
          <div className="card stat-summary-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', marginBottom: '4px' }}>
              <AlertTriangle size={18} />
              <span className="stat-summary-label" style={{ color: '#ef4444', margin: 0 }}>Highest Pollution</span>
            </div>
            <div className="stat-summary-value-row">
              <span className="stat-summary-num" style={{ color: '#ef4444' }}>{highlights.highestPollution.city}</span>
            </div>
            <span className="stat-summary-sub">
              AQI {highlights.highestPollution.aqi} &bull; {highlights.highestPollution.status}
            </span>
          </div>

          {/* Lowest PM2.5 */}
          <div className="card stat-summary-card" style={{ borderLeft: '4px solid #38bdf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', marginBottom: '4px' }}>
              <ShieldCheck size={18} />
              <span className="stat-summary-label" style={{ color: '#38bdf8', margin: 0 }}>Lowest PM2.5</span>
            </div>
            <div className="stat-summary-value-row">
              <span className="stat-summary-num" style={{ color: '#38bdf8' }}>{highlights.lowestPm25.city}</span>
            </div>
            <span className="stat-summary-sub">
              {highlights.lowestPm25.pm25} µg/m³
            </span>
          </div>

          {/* Highest PM2.5 */}
          <div className="card stat-summary-card" style={{ borderLeft: '4px solid #f97316' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', marginBottom: '4px' }}>
              <TrendingUp size={18} />
              <span className="stat-summary-label" style={{ color: '#f97316', margin: 0 }}>Highest PM2.5</span>
            </div>
            <div className="stat-summary-value-row">
              <span className="stat-summary-num" style={{ color: '#f97316' }}>{highlights.highestPm25.city}</span>
            </div>
            <span className="stat-summary-sub">
              {highlights.highestPm25.pm25} µg/m³
            </span>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="card" style={{ marginBottom: '1.5rem', overflowX: 'auto', padding: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>
          Comparative Environmental Matrix
        </h3>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 10px' }} />
            <span>Computing comparative matrix...</span>
          </div>
        ) : (
          <table className="comparison-matrix-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', fontSize: '0.85rem' }}>
                <th style={{ padding: '10px 14px' }}>Parameter</th>
                {citiesData.map(c => (
                  <th key={c.city} style={{ padding: '10px 14px', color: CITY_COLORS[c.city] || '#fff' }}>
                    {c.city}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* AQI */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Air Quality Index (AQI)</td>
                {citiesData.map(c => {
                  const { color, label } = getAqiCategory(c.aqi);
                  return (
                    <td key={c.city} style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color, marginRight: '6px' }}>{c.aqi}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: `${color}22`, color }}>
                        {label}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Health Score */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>EcoSense Health Score</td>
                {citiesData.map(c => {
                  const s = calculateEnvironmentalScore(c);
                  return (
                    <td key={c.city} style={{ padding: '12px 14px' }}>
                      <strong style={{ color: s.color, fontSize: '1.1rem' }}>{s.score}</strong>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>/100 ({s.status})</span>
                    </td>
                  );
                })}
              </tr>

              {/* PM2.5 */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>PM2.5 (Fine Particles)</td>
                {citiesData.map(c => (
                  <td key={c.city} style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                    {c.pm25} µg/m³
                  </td>
                ))}
              </tr>

              {/* PM10 */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>PM10 (Respirable Dust)</td>
                {citiesData.map(c => (
                  <td key={c.city} style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                    {c.pm10} µg/m³
                  </td>
                ))}
              </tr>

              {/* Temperature */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Ambient Temperature</td>
                {citiesData.map(c => (
                  <td key={c.city} style={{ padding: '12px 14px' }}>
                    {c.temperature}°C
                  </td>
                ))}
              </tr>

              {/* Humidity */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Relative Humidity</td>
                {citiesData.map(c => (
                  <td key={c.city} style={{ padding: '12px 14px' }}>
                    {c.humidity}%
                  </td>
                ))}
              </tr>

              {/* Carbon Monoxide */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Carbon Monoxide (CO)</td>
                {citiesData.map(c => (
                  <td key={c.city} style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                    {c.co} mg/m³
                  </td>
                ))}
              </tr>

              {/* Nitrogen Dioxide */}
              <tr>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>Nitrogen Dioxide (NO2)</td>
                {citiesData.map(c => (
                  <td key={c.city} style={{ padding: '12px 14px', fontFamily: 'monospace' }}>
                    {c.no2} µg/m³
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Multi-Series Overlaid Trend Chart */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
              Comparative 24-Hour AQI Trajectory
            </h3>
            <p className="card-subtitle">
              Simultaneous overlaid progression across selected monitoring regions
            </p>
          </div>
        </div>

        <div style={{ height: '380px', width: '100%' }}>
          {loading ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <div className="pulse-dot" style={{ marginRight: '10px' }} />
              <span>Rendering multi-series chart...</span>
            </div>
          ) : mergedTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedTrend} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
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
                />
                <Legend />
                {selectedCities.map(city => (
                  <Line
                    key={city}
                    type="monotone"
                    dataKey={city}
                    stroke={CITY_COLORS[city] || '#38bdf8'}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              No comparison records available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
