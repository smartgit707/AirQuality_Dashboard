import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Wind, 
  Droplets, 
  Thermometer, 
  Gauge, 
  TrendingUp, 
  Trophy, 
  Sparkles, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ArrowLeftRight,
  Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import AQICard from '../components/AQICard';
import PollutantCard from '../components/PollutantCard';
import { mockCityData, getAQIStatus } from '../data/mockData';

export default function CityPage({ city = 'Chennai', onNavigate, onCityChange }) {
  const [activeTrendTab, setActiveTrendTab] = useState('24h'); // '24h' | '7d'

  const data = mockCityData[city] || mockCityData['Chennai'];
  const status = getAQIStatus(data.aqi);

  // Generate 24h & 7d datasets based on city baseline
  const trend24h = data.trend || [
    { time: '12 AM', aqi: data.aqi - 8 },
    { time: '4 AM', aqi: data.aqi - 12 },
    { time: '8 AM', aqi: data.aqi + 5 },
    { time: '12 PM', aqi: data.aqi + 14 },
    { time: '4 PM', aqi: data.aqi + 2 },
    { time: '8 PM', aqi: data.aqi - 4 }
  ];

  const trend7d = [
    { day: 'Mon', aqi: Math.round(data.aqi * 0.92) },
    { day: 'Tue', aqi: Math.round(data.aqi * 0.88) },
    { day: 'Wed', aqi: Math.round(data.aqi * 1.05) },
    { day: 'Thu', aqi: Math.round(data.aqi * 1.12) },
    { day: 'Fri', aqi: Math.round(data.aqi * 0.98) },
    { day: 'Sat', aqi: Math.round(data.aqi * 0.85) },
    { day: 'Sun', aqi: data.aqi }
  ];

  // Calculated Insights
  const aqiValues = trend24h.map(t => t.aqi);
  const highestAqi = Math.max(...aqiValues);
  const lowestAqi = Math.min(...aqiValues);
  const avgAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const peakTime = trend24h.find(t => t.aqi === highestAqi)?.time || '2 PM';
  const cleanTime = trend24h.find(t => t.aqi === lowestAqi)?.time || '4 AM';

  return (
    <div className="analytics-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* City Breadcrumb & SEO Header */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <span>World</span>
          <span>&rsaquo;</span>
          <span>{data.country || 'India'}</span>
          <span>&rsaquo;</span>
          <span>{data.state || 'Tamil Nadu'}</span>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{data.city}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {data.city}, {data.state}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} style={{ color: 'var(--accent-cyan)' }} />
              <span>Last updated: {data.lastUpdated || '10 minutes ago'} &bull; Station Elevation: 14m</span>
            </p>
          </div>

          {/* City Ranking Pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0, 245, 160, 0.1)', border: '1px solid rgba(0, 245, 160, 0.3)', padding: '8px 14px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>National Rank</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00f5a0' }}>#4 Cleanest</div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 14px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Regional Rank</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>#2 in South Zone</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero 2-Column: AQI Holographic Card + Atmospheric Weather */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <AQICard aqi={data.aqi} />

        {/* Environmental Weather Micro-climate */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '14px' }}>
              <Wind size={20} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Meteorological Conditions in {data.city}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Atmospheric dispersion forces dictate particulate settling and ventilation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div style={{ background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.3))', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Thermometer size={14} style={{ color: '#f97316' }} /> Temperature
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {data.temperature}°C
                </div>
              </div>

              <div style={{ background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.3))', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Droplets size={14} style={{ color: '#06b6d4' }} /> Humidity
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {data.humidity}%
                </div>
              </div>

              <div style={{ background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.3))', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wind size={14} style={{ color: '#10b981' }} /> Wind Velocity
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {data.windSpeed || data.wind_speed} km/h
                </div>
              </div>

              <div style={{ background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.3))', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Gauge size={14} style={{ color: '#a855f7' }} /> Barometer
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {data.pressure} hPa
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
            <button
              onClick={() => onNavigate && onNavigate('compare')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ArrowLeftRight size={14} />
              <span>Compare {data.city}</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('globe')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(0, 245, 160, 0.15)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                color: '#00f5a0',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Globe size={14} />
              <span>3D Earth Pin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pollutants Breakdown Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live Pollutant Concentrations
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              6 Criteria air contaminants observed in {data.city}
            </p>
          </div>
        </div>

        <div className="pollutants-grid">
          <PollutantCard name="PM2.5" fullName="Fine Particles" value={data.pm25} unit="µg/m³" typeKey="pm25" />
          <PollutantCard name="PM10" fullName="Coarse Dust" value={data.pm10} unit="µg/m³" typeKey="pm10" />
          <PollutantCard name="CO" fullName="Carbon Monoxide" value={data.co} unit="mg/m³" typeKey="co" />
          <PollutantCard name="NO2" fullName="Nitrogen Dioxide" value={data.no2} unit="µg/m³" typeKey="no2" />
          <PollutantCard name="SO2" fullName="Sulfur Dioxide" value={data.so2} unit="µg/m³" typeKey="so2" />
          <PollutantCard name="O3" fullName="Ozone" value={data.o3} unit="µg/m³" typeKey="o3" />
        </div>
      </div>

      {/* Interactive Trends & Scientific Insights */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Trend Graph with 24h & 7d Toggle */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {activeTrendTab === '24h' ? '24-Hour Diurnal AQI Trend' : '7-Day Historical Trend'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                Trajectory of air quality index in {data.city}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.3))', padding: '4px', borderRadius: '10px' }}>
              <button
                onClick={() => setActiveTrendTab('24h')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTrendTab === '24h' ? '#00f5a0' : 'transparent',
                  color: activeTrendTab === '24h' ? '#052317' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                24 Hours
              </button>
              <button
                onClick={() => setActiveTrendTab('7d')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTrendTab === '7d' ? '#00f5a0' : 'transparent',
                  color: activeTrendTab === '7d' ? '#052317' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                7 Days
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTrendTab === '24h' ? (
                <AreaChart data={trend24h}>
                  <defs>
                    <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={status.color} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={status.color} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0a140f', border: `1px solid ${status.color}`, borderRadius: '10px', color: '#fff' }} />
                  <Area type="monotone" dataKey="aqi" stroke={status.color} strokeWidth={2.5} fillOpacity={1} fill="url(#cityGrad)" />
                </AreaChart>
              ) : (
                <LineChart data={trend7d}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#0a140f', border: `1px solid ${status.color}`, borderRadius: '10px', color: '#fff' }} />
                  <Line type="monotone" dataKey="aqi" stroke={status.color} strokeWidth={3} dot={{ r: 5, fill: status.color }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Air Quality Insights Analysis Panel */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '14px' }}>
              <Sparkles size={20} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Air Quality Insights & Analytics
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.25))', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Highest AQI Period:</span>
                <span style={{ fontWeight: 800, color: '#ef4444' }}>{peakTime} ({highestAqi} AQI)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.25))', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Lowest AQI Period:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>{cleanTime} ({lowestAqi} AQI)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.25))', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>24-Hour Mean AQI:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{avgAqi} AQI</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.25))', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Dominant Criteria Pollutant:</span>
                <span style={{ fontWeight: 800, color: '#fbbf24' }}>PM2.5 (Fine Particles)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subpanel, rgba(0, 0, 0, 0.25))', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pollution Trend vs Yesterday:</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>&darr; 4.2% (Improving)</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '12px', borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Recommendation: </span>
            <strong style={{ color: status.color }}>{status.healthAdvice}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
