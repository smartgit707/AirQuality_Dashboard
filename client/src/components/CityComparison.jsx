import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeftRight, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Wind, 
  Thermometer, 
  Droplets, 
  Gauge,
  Sparkles,
  Layers,
  RefreshCw,
  AlertTriangle
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
import { fetchCityComparison } from '../services/api';
import { CITIES, getAQIStatus } from '../data/mockData';

// Custom Dual-City Chart Tooltip
function DualTooltip({ active, payload, label, city1Name, city2Name }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip" style={{ minWidth: '180px' }}>
        <div className="tooltip-time">{label} Observation</div>
        {payload.map((entry) => (
          <div 
            key={entry.dataKey}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              gap: '1rem',
              color: entry.color,
              fontWeight: 700,
              fontSize: '0.95rem',
              marginTop: '0.25rem'
            }}
          >
            <span>{entry.name}:</span>
            <span>{entry.value} AQI</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function CityComparison({ defaultCity1 = 'Delhi', defaultCity2 = 'Bengaluru' }) {
  const [city1, setCity1] = useState(defaultCity1);
  const [city2, setCity2] = useState(defaultCity2);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComparison = useCallback(async (c1, c2) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCityComparison(c1, c2);
      setComparisonData(data);
    } catch (err) {
      console.error('Error fetching comparison:', err);
      setError('Unable to compare the selected cities. Please check the network or server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComparison(city1, city2);
  }, [city1, city2, loadComparison]);

  const handleSwap = () => {
    const next1 = city2;
    const next2 = city1;
    setCity1(next1);
    setCity2(next2);
  };

  const handleRefresh = () => {
    loadComparison(city1, city2);
  };

  const d1 = comparisonData?.city1;
  const d2 = comparisonData?.city2;
  const comp = comparisonData?.comparison;
  const mergedTrend = comparisonData?.mergedTrend || [];

  const status1 = d1 ? getAQIStatus(d1.aqi) : null;
  const status2 = d2 ? getAQIStatus(d2.aqi) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Comparison Control Bar */}
      <section style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ArrowLeftRight size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>Dual City Comparison Mode</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Side-by-side atmospheric benchmark and synchronized 24h trend overlay
          </p>
        </div>

        {/* City Selectors & Swap Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* City 1 Selector */}
          <div className="location-selector-container">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>City A:</span>
            <select
              value={city1}
              onChange={(e) => setCity1(e.target.value)}
              disabled={loading}
              className="city-select"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} disabled={c === city2}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={loading}
            title="Swap cities"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <ArrowLeftRight size={18} />
          </button>

          {/* City 2 Selector */}
          <div className="location-selector-container">
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>City B:</span>
            <select
              value={city2}
              onChange={(e) => setCity2(e.target.value)}
              disabled={loading}
              className="city-select"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} disabled={c === city1}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh comparison"
            className="location-selector-container"
            style={{ cursor: 'pointer', background: 'transparent' }}
          >
            <RefreshCw 
              size={16} 
              className={`location-icon ${loading ? 'spin-animation' : ''}`} 
            />
          </button>
        </div>
      </section>

      {/* Error state if query fails */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fca5a5'
        }}>
          <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Executive Comparative Summary Banner */}
      {comp && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              borderRadius: 'var(--radius-md)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {comp.cleanerCity} is {comp.aqiPercentCleaner}% Cleaner than {comp.morePollutedCity}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {comp.summary}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="source-badge" style={{ borderColor: 'rgba(6, 182, 212, 0.3)', color: 'var(--accent-cyan)' }}>
              AQI Delta: {comp.aqiDiff} pts
            </span>
            <span className="source-badge" style={{ borderColor: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' }}>
              PM2.5 Delta: {Math.abs(comp.pm25Diff)} µg/m³
            </span>
          </div>
        </div>
      )}

      {/* 3. Side-by-Side Hero Score Cards */}
      {d1 && d2 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          {/* City 1 Hero */}
          <div className="aqi-hero-card" style={{ '--aqi-color': status1?.color, borderColor: status1?.badgeBorder }}>
            <div className="aqi-header-status">
              <span className="card-label" style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>
                {d1.city} ({d1.state})
              </span>
              <span className="aqi-badge" style={{ backgroundColor: status1?.badgeBg, color: status1?.color, border: `1px solid ${status1?.badgeBorder}` }}>
                {status1?.label}
              </span>
            </div>
            <div className="aqi-main-score">
              <span className="aqi-big-number" style={{ color: status1?.color }}>
                {d1.aqi}
              </span>
              <span className="card-unit">AQI</span>
            </div>
            <p className="aqi-description">{status1?.healthAdvice}</p>
          </div>

          {/* Center VS Chip */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.95rem',
              color: 'var(--text-secondary)'
            }}>
              VS
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Δ {comp?.aqiDiff}
            </span>
          </div>

          {/* City 2 Hero */}
          <div className="aqi-hero-card" style={{ '--aqi-color': status2?.color, borderColor: status2?.badgeBorder }}>
            <div className="aqi-header-status">
              <span className="card-label" style={{ color: '#f59e0b', fontWeight: 800 }}>
                {d2.city} ({d2.state})
              </span>
              <span className="aqi-badge" style={{ backgroundColor: status2?.badgeBg, color: status2?.color, border: `1px solid ${status2?.badgeBorder}` }}>
                {status2?.label}
              </span>
            </div>
            <div className="aqi-main-score">
              <span className="aqi-big-number" style={{ color: status2?.color }}>
                {d2.aqi}
              </span>
              <span className="card-unit">AQI</span>
            </div>
            <p className="aqi-description">{status2?.healthAdvice}</p>
          </div>
        </div>
      )}

      {/* 4. Synchronized Dual-Line Historical Trend Chart */}
      <section className="chart-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Comparative AQI Timeline</span>
            </h3>
            <p className="panel-subtitle">Overlaid 24-hour historical records: {city1} vs {city2}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ● {city1}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ● {city2}
            </span>
          </div>
        </div>

        <div className="chart-wrapper" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedTrend} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<DualTooltip city1Name={city1} city2Name={city2} />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={city1}
                name={city1}
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 4, fill: '#06b6d4' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey={city2}
                name={city2}
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. Comprehensive Metric-by-Metric Delta Grid */}
      {d1 && d2 && (
        <section style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-teal)' }} />
              <span>Full Parameters Delta Table</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Direct side-by-side criteria pollutants and weather measurements
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Metric Parameter</th>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--accent-cyan)' }}>{d1.city}</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#f59e0b' }}>{d2.city}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Difference (Δ)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Advantage</th>
                </tr>
              </thead>
              <tbody>
                {/* PM2.5 */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>PM2.5 (Fine Particles)</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.pm25} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.pm25} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem', color: comp?.pm25Diff > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {comp?.pm25Diff > 0 ? `+${comp?.pm25Diff}` : comp?.pm25Diff} µg/m³
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ color: d1.pm25 < d2.pm25 ? 'var(--accent-cyan)' : '#f59e0b', fontWeight: 700 }}>
                      {d1.pm25 < d2.pm25 ? d1.city : d2.city} (Cleaner)
                    </span>
                  </td>
                </tr>

                {/* PM10 */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>PM10 (Coarse Dust)</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.pm10} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.pm10} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem', color: comp?.pm10Diff > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {comp?.pm10Diff > 0 ? `+${comp?.pm10Diff}` : comp?.pm10Diff} µg/m³
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ color: d1.pm10 < d2.pm10 ? 'var(--accent-cyan)' : '#f59e0b', fontWeight: 700 }}>
                      {d1.pm10 < d2.pm10 ? d1.city : d2.city} (Cleaner)
                    </span>
                  </td>
                </tr>

                {/* CO */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>Carbon Monoxide (CO)</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.co} mg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.co} mg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{parseFloat((d1.co - d2.co).toFixed(2))} mg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.co < d2.co ? d1.city : d2.city}</td>
                </tr>

                {/* NO2 */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>Nitrogen Dioxide (NO2)</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.no2} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.no2} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{parseFloat((d1.no2 - d2.no2).toFixed(1))} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.no2 < d2.no2 ? d1.city : d2.city}</td>
                </tr>

                {/* Ozone O3 */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>Ground Ozone (O3)</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.o3} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.o3} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{parseFloat((d1.o3 - d2.o3).toFixed(1))} µg/m³</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.o3 < d2.o3 ? d1.city : d2.city}</td>
                </tr>

                {/* Temperature */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>Temperature</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.temperature} °C</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.temperature} °C</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{comp?.tempDiff > 0 ? `+${comp?.tempDiff}` : comp?.tempDiff} °C</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{comp?.tempDiff > 0 ? `${d1.city} warmer` : `${d2.city} warmer`}</td>
                </tr>

                {/* Relative Humidity */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>Relative Humidity</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.humidity} %</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.humidity} %</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{comp?.humidityDiff > 0 ? `+${comp?.humidityDiff}` : comp?.humidityDiff} %</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{comp?.humidityDiff > 0 ? `${d1.city} more humid` : `${d2.city} more humid`}</td>
                </tr>

                {/* Wind Speed */}
                <tr>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>Wind Speed</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.windSpeed} km/h</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d2.windSpeed} km/h</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{comp?.windDiff > 0 ? `+${comp?.windDiff}` : comp?.windDiff} km/h</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{d1.windSpeed > d2.windSpeed ? `${d1.city} stronger breeze` : `${d2.city} stronger breeze`}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
