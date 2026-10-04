import React, { useState, useEffect } from 'react';
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
import { 
  BarChart2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Activity,
  Layers
} from 'lucide-react';
import { fetchAnalytics } from '../services/api';

const METRIC_OPTIONS = [
  { key: 'aqi', label: 'Air Quality Index (AQI)', unit: '', color: '#38bdf8' },
  { key: 'pm25', label: 'PM2.5 Concentration', unit: 'µg/m³', color: '#fbbf24' },
  { key: 'pm10', label: 'PM10 Concentration', unit: 'µg/m³', color: '#a855f7' },
  { key: 'co', label: 'Carbon Monoxide (CO)', unit: 'mg/m³', color: '#34d399' },
  { key: 'no2', label: 'Nitrogen Dioxide (NO2)', unit: 'µg/m³', color: '#f87171' },
  { key: 'so2', label: 'Sulfur Dioxide (SO2)', unit: 'µg/m³', color: '#fb923c' },
  { key: 'o3', label: 'Ozone (O3)', unit: 'µg/m³', color: '#60a5fa' },
  { key: 'temperature', label: 'Ambient Temperature', unit: '°C', color: '#f97316' },
  { key: 'humidity', label: 'Relative Humidity', unit: '%', color: '#06b6d4' }
];

const RANGE_OPTIONS = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' }
];

const CITIES = ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];

export default function AnalyticsPage({ defaultCity = 'Delhi' }) {
  const [city, setCity] = useState(defaultCity);
  const [metric, setMetric] = useState('aqi');
  const [range, setRange] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeMetricObj = METRIC_OPTIONS.find(m => m.key === metric) || METRIC_OPTIONS[0];

  useEffect(() => {
    let isSubscribed = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAnalytics(city, metric, range);
        if (isSubscribed) {
          setAnalyticsData(res);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('[Analytics] Error fetching metrics:', err);
          setError('Failed to compute analytics for the selected timeframe.');
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    loadData();
    return () => { isSubscribed = false; };
  }, [city, metric, range]);

  const stats = analyticsData?.stats || {
    current: 0,
    average: 0,
    minimum: 0,
    maximum: 0,
    percentageChange: 0
  };

  const isPositiveTrend = stats.percentageChange > 0;

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title-group">
          <h1>
            <span>Atmospheric</span>
            <span className="city-highlight"> Analytics & Metrics</span>
          </h1>
          <p>
            Historical time-series evaluation, min/max distributions, and trend deltas across environmental factors
          </p>
        </div>
      </div>

      {/* Control Bar: City, Metric, Range */}
      <div className="analytics-control-bar card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="analytics-filters-grid">
          {/* City Selector */}
          <div className="filter-group">
            <label className="filter-label">Monitoring Station</label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="location-selector"
              style={{ width: '100%' }}
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div className="filter-group">
            <label className="filter-label">Environmental Parameter</label>
            <select 
              value={metric} 
              onChange={(e) => setMetric(e.target.value)}
              className="location-selector"
              style={{ width: '100%' }}
            >
              {METRIC_OPTIONS.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="filter-group">
            <label className="filter-label">Timeline Range</label>
            <div className="time-range-pills">
              {RANGE_OPTIONS.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={`range-pill ${range === r.key ? 'active' : ''}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="analytics-stats-grid">
        {/* Current Reading */}
        <div className="card stat-summary-card">
          <span className="stat-summary-label">Current Reading</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: activeMetricObj.color }}>
              {loading ? '...' : stats.current}
            </span>
            <span className="stat-summary-unit">{activeMetricObj.unit}</span>
          </div>
          <span className="stat-summary-sub">Latest telemetry sync</span>
        </div>

        {/* Period Average */}
        <div className="card stat-summary-card">
          <span className="stat-summary-label">Period Average</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: '#f8fafc' }}>
              {loading ? '...' : stats.average}
            </span>
            <span className="stat-summary-unit">{activeMetricObj.unit}</span>
          </div>
          <span className="stat-summary-sub">Across selected {range}</span>
        </div>

        {/* Minimum Recorded */}
        <div className="card stat-summary-card">
          <span className="stat-summary-label">Minimum Recorded</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: '#10b981' }}>
              {loading ? '...' : stats.minimum}
            </span>
            <span className="stat-summary-unit">{activeMetricObj.unit}</span>
          </div>
          <span className="stat-summary-sub">Lowest baseline dip</span>
        </div>

        {/* Maximum Recorded */}
        <div className="card stat-summary-card">
          <span className="stat-summary-label">Maximum Recorded</span>
          <div className="stat-summary-value-row">
            <span className="stat-summary-num" style={{ color: '#ef4444' }}>
              {loading ? '...' : stats.maximum}
            </span>
            <span className="stat-summary-unit">{activeMetricObj.unit}</span>
          </div>
          <span className="stat-summary-sub">Peak recorded intensity</span>
        </div>

        {/* Trend Delta */}
        <div className="card stat-summary-card">
          <span className="stat-summary-label">Variance Trend</span>
          <div className="stat-summary-value-row" style={{ alignItems: 'center' }}>
            <span className="stat-summary-num" style={{ color: isPositiveTrend ? '#f97316' : '#10b981' }}>
              {loading ? '...' : `${stats.percentageChange > 0 ? '+' : ''}${stats.percentageChange}%`}
            </span>
            {isPositiveTrend ? (
              <ArrowUpRight size={22} style={{ color: '#f97316' }} />
            ) : (
              <ArrowDownRight size={22} style={{ color: '#10b981' }} />
            )}
          </div>
          <span className="stat-summary-sub">Compared to initial period</span>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
              {city} &mdash; {activeMetricObj.label} Trend ({range.toUpperCase()})
            </h3>
            <p className="card-subtitle">
              Measured points with localized interpolation over the requested timeline
            </p>
          </div>
          <div className="chart-legend-badge">
            <span className="pulse-dot-indicator" style={{ backgroundColor: activeMetricObj.color }} />
            <span>{activeMetricObj.label}</span>
          </div>
        </div>

        <div style={{ height: '380px', width: '100%' }}>
          {loading ? (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              <div className="pulse-dot" style={{ marginRight: '10px' }} />
              <span>Querying time-series analytics...</span>
            </div>
          ) : analyticsData?.points && analyticsData.points.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.points} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetricObj.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={activeMetricObj.color} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  unit={activeMetricObj.unit ? ` ${activeMetricObj.unit}` : ''}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                    color: '#fff'
                  }}
                  formatter={(val) => [`${val} ${activeMetricObj.unit}`, activeMetricObj.label]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={activeMetricObj.color} 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#metricGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
              No historical data available for this parameter yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
