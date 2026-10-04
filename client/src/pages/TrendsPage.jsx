import React, { useState, useEffect } from 'react';
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
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Calendar, 
  Activity, 
  RefreshCw,
  Info
} from 'lucide-react';
import { fetchCityHistory, fetchAnalytics } from '../services/api';

const CITIES = ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];

export default function TrendsPage({ defaultCity = 'Delhi' }) {
  const [city, setCity] = useState(defaultCity);
  const [range, setRange] = useState('24h');
  const [history, setHistory] = useState([]);
  const [aqiAnalytics, setAqiAnalytics] = useState(null);
  const [pm25Analytics, setPm25Analytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const loadTrendData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [histRes, aqiRes, pm25Res] = await Promise.all([
          fetchCityHistory(city),
          fetchAnalytics(city, 'aqi', range),
          fetchAnalytics(city, 'pm25', range)
        ]);

        if (isSubscribed) {
          setHistory(histRes || []);
          setAqiAnalytics(aqiRes);
          setPm25Analytics(pm25Res);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('[Trends] Error:', err);
          setError('Failed to compute environmental trends for this city.');
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadTrendData();
    return () => { isSubscribed = false; };
  }, [city, range]);

  const aqiChange = aqiAnalytics?.stats?.percentageChange || 0;
  const pm25Change = pm25Analytics?.stats?.percentageChange || 0;

  // Adapt data for multi-line trend
  const trendPoints = (aqiAnalytics?.points || []).map((pt, i) => {
    const pmPt = pm25Analytics?.points?.[i] || {};
    return {
      label: pt.label,
      AQI: pt.value,
      PM25: pmPt.value || 0
    };
  });

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-group">
          <h1>
            <span>Longitudinal Environmental</span>
            <span className="city-highlight"> Trends & Velocity</span>
          </h1>
          <p>
            Cross-pollutant evolution, atmospheric trends, and historical variance across observation windows
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

      {/* Range Pills */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
            Observation Window:
          </span>
          <div className="time-range-pills">
            {['24h', '7d', '30d'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`range-pill ${range === r ? 'active' : ''}`}
              >
                {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Narrative Banner */}
      <div className="card" style={{ 
        background: 'rgba(15, 23, 42, 0.75)', 
        borderLeft: '4px solid #38bdf8', 
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Activity size={18} style={{ color: '#38bdf8' }} />
          <strong style={{ color: '#fff', fontSize: '1rem' }}>Key Velocity Finding ({range.toUpperCase()}):</strong>
        </div>
        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          In {city}, the average Air Quality Index has {aqiChange >= 0 ? 'increased' : 'decreased'} by{' '}
          <strong style={{ color: aqiChange >= 0 ? '#f97316' : '#10b981' }}>{Math.abs(aqiChange)}%</strong> over the selected {range === '24h' ? '24-hour' : range === '7d' ? '7-day' : '30-day'} period, with PM2.5 particulates displaying a{' '}
          <strong style={{ color: pm25Change >= 0 ? '#f97316' : '#10b981' }}>{Math.abs(pm25Change)}%</strong> {pm25Change >= 0 ? 'rise' : 'decline'}.
        </p>
      </div>

      {/* Main Multi-Metric Line Chart */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
              AQI vs PM2.5 Tracking Curve ({city})
            </h3>
            <p className="card-subtitle">
              Simultaneous progression comparison across primary severity indicators
            </p>
          </div>
        </div>

        <div style={{ height: '380px', width: '100%' }}>
          {loading ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <div className="pulse-dot" style={{ marginRight: '10px' }} />
              <span>Analyzing trend points...</span>
            </div>
          ) : trendPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendPoints} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="AQI" 
                  name="Air Quality Index" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="PM25" 
                  name="PM2.5 (µg/m³)" 
                  stroke="#fbbf24" 
                  strokeWidth={2.5} 
                  dot={{ r: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              No longitudinal trend data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
