import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  CloudFog, 
  Factory, 
  Sparkles, 
  Wind, 
  Gauge, 
  Compass, 
  Info,
  Layers,
  ThermometerSun,
  Activity,
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';
import AQICard from '../components/AQICard';
import MetricCard from '../components/MetricCard';
import PollutantCard from '../components/PollutantCard';
import AQIChart from '../components/AQIChart';
import { getAQIStatus } from '../data/mockData';

export default function Dashboard({ 
  data, 
  historyData, 
  currentCity, 
  loading, 
  error, 
  isApiConnected, 
  isDbConnected, 
  onRetry 
}) {
  // If no data and loading, show full page loading state
  if (!data && loading) {
    return (
      <main className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '55vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1.25rem', width: '16px', height: '16px' }}></div>
          <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: '0.4rem' }}>Loading Environmental Telemetry...</h2>
          <p style={{ fontSize: '0.9rem' }}>Querying PostgreSQL database records for {currentCity}</p>
        </div>
      </main>
    );
  }

  // If no data and critical error (e.g. city not found / server down), show friendly error card
  if (!data && error) {
    return (
      <main className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '55vh' }}>
        <div style={{ 
          textAlign: 'center', 
          maxWidth: '500px', 
          padding: '2.5rem', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)' 
        }}>
          <AlertTriangle size={42} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: '0.5rem' }}>Telemetry Retrieval Failed</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>{error}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="location-selector-container"
              style={{ margin: '0 auto', cursor: 'pointer', padding: '0.6rem 1.25rem', color: '#fff', background: 'var(--accent-blue)' }}
            >
              <RefreshCw size={16} />
              <span>Retry Query</span>
            </button>
          )}
        </div>
      </main>
    );
  }

  if (!data) return null;

  const currentAQIStatus = getAQIStatus(data.aqi);

  // AQI benchmark tiers for the reference guide
  const aqiTiers = [
    { range: '0 - 50', label: 'Good', color: '#10b981' },
    { range: '51 - 100', label: 'Moderate', color: '#eab308' },
    { range: '101 - 150', label: 'Sensitive Groups', color: '#f97316' },
    { range: '151 - 200', label: 'Unhealthy', color: '#ef4444' },
    { range: '201+', label: 'Very Unhealthy', color: '#8b5cf6' },
  ];

  return (
    <main className="dashboard-container">
      {/* City Header & Meta */}
      <section className="dashboard-header">
        <div className="header-title-group">
          <h1>
            <span>Air Quality in</span>
            <span className="city-highlight">{data.city}</span>
            {data.state && <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500 }}>({data.state})</span>}
          </h1>
          <p>
            Real-time atmospheric analysis and environmental parameters from database records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Live Open-Meteo API Indicator */}
          <span 
            className="source-badge" 
            style={{ 
              borderColor: data.isLive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(234, 179, 8, 0.35)',
              color: data.isLive ? '#10b981' : '#facc15',
              backgroundColor: data.isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)'
            }}
            title={data.isLive ? 'Real-time telemetry fetched directly via Open-Meteo Air Quality API' : 'Displaying latest saved reading from database'}
          >
            {data.isLive ? '● Live Open-Meteo Data' : '○ Stored DB Reading (Fallback)'}
          </span>

          {/* PostgreSQL Connection Badge */}
          <span 
            className="source-badge" 
            style={{ 
              borderColor: isDbConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)',
              color: isDbConnected ? '#10b981' : '#60a5fa',
              backgroundColor: isDbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'
            }}
            title={isDbConnected ? 'Active connection to PostgreSQL database' : 'Querying Express API server with PostgreSQL schema dataset'}
          >
            <Database size={13} style={{ marginRight: '4px' }} />
            {isDbConnected ? 'PostgreSQL Live Connected' : 'Express API Connected'}
          </span>
        </div>
      </section>

      {/* Fallback data warning banner if external API failed */}
      {data.warning && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.12)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: '#fef08a'
        }}>
          <AlertTriangle size={18} style={{ color: '#eab308', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem' }}>{data.warning}</span>
        </div>
      )}

      {/* Non-blocking API/Database Warning Banner if present */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          color: '#fca5a5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
          {onRetry && (
            <button 
              onClick={onRetry}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.8rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* 1. Top Metrics Overview Grid */}
      <section className="top-metrics-grid" aria-label="Key Environmental Metrics">
        {/* AQI Hero Card */}
        <AQICard aqi={data.aqi} />

        {/* Temperature Card */}
        <MetricCard 
          label="Temperature"
          value={data.temperature}
          unit="°C"
          icon={Thermometer}
          accentColor="#f97316"
          subtitle="Ambient reading"
        />

        {/* Humidity Card */}
        <MetricCard 
          label="Humidity"
          value={data.humidity}
          unit="%"
          icon={Droplets}
          accentColor="#06b6d4"
          subtitle="Relative moisture"
        />

        {/* PM2.5 Card */}
        <MetricCard 
          label="PM2.5"
          value={data.pm25}
          unit="µg/m³"
          icon={CloudFog}
          accentColor="#eab308"
          subtitle="Fine particles"
        />

        {/* PM10 Card */}
        <MetricCard 
          label="PM10"
          value={data.pm10}
          unit="µg/m³"
          icon={Factory}
          accentColor="#a855f7"
          subtitle="Respirable dust"
        />

        {/* CO2 Level Card */}
        <MetricCard 
          label="CO2 Level"
          value={data.co2 || 490}
          unit="ppm"
          icon={Sparkles}
          accentColor="#10b981"
          subtitle="Atmospheric CO2"
        />
      </section>

      {/* 2. Middle Section: AQI Trend Chart (using historical records) & AQI Standards Reference */}
      <section className="dashboard-middle-section">
        {/* AQI Historical Trend Chart */}
        <AQIChart data={historyData && historyData.length > 0 ? historyData : data.trend} city={data.city} />

        {/* AQI Scale Reference Guide */}
        <div className="scale-reference-panel">
          <div className="panel-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 className="panel-title">
                <Layers size={18} />
                <span>AQI Standards</span>
              </h2>
              <p className="panel-subtitle">Official Air Quality Classification</p>
            </div>
          </div>

          <div className="scale-list">
            {aqiTiers.map((tier) => {
              const isCurrent = currentAQIStatus.label.toLowerCase().includes(tier.label.toLowerCase());
              return (
                <div 
                  key={tier.label} 
                  className={`scale-item ${isCurrent ? 'active' : ''}`}
                  style={{ color: tier.color }}
                >
                  <div className="scale-label-group">
                    <span 
                      className="scale-color-indicator" 
                      style={{ backgroundColor: tier.color }} 
                    />
                    <span>{tier.label}</span>
                  </div>
                  <span className="scale-range">{tier.range}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Info size={14} />
            <span>Currently in <strong>{data.city}</strong>: {currentAQIStatus.label} ({data.aqi})</span>
          </div>
        </div>
      </section>

      {/* 3. Detailed Pollutant Monitoring Section */}
      <section className="pollutants-section">
        <div className="section-header">
          <h2 className="section-title">
            <Activity size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>Pollutant Monitoring</span>
          </h2>
          <p className="section-subtitle">
            Concentrations of primary criteria pollutants contributing to environmental health
          </p>
        </div>

        <div className="pollutants-grid">
          <PollutantCard 
            name="PM2.5" 
            fullName="Fine Particles" 
            value={data.pm25} 
            unit="µg/m³" 
            typeKey="pm25" 
          />
          <PollutantCard 
            name="PM10" 
            fullName="Coarse Dust" 
            value={data.pm10} 
            unit="µg/m³" 
            typeKey="pm10" 
          />
          <PollutantCard 
            name="CO" 
            fullName="Carbon Monoxide" 
            value={data.co} 
            unit="mg/m³" 
            typeKey="co" 
          />
          <PollutantCard 
            name="NO2" 
            fullName="Nitrogen Dioxide" 
            value={data.no2} 
            unit="µg/m³" 
            typeKey="no2" 
          />
          <PollutantCard 
            name="SO2" 
            fullName="Sulfur Dioxide" 
            value={data.so2} 
            unit="µg/m³" 
            typeKey="so2" 
          />
          <PollutantCard 
            name="O3" 
            fullName="Ozone" 
            value={data.o3} 
            unit="µg/m³" 
            typeKey="o3" 
          />
        </div>
      </section>

      {/* 4. Environmental Conditions Section */}
      <section className="conditions-section">
        <div className="section-header">
          <h2 className="section-title">
            <Wind size={20} style={{ color: 'var(--accent-teal)' }} />
            <span>Environmental Conditions</span>
          </h2>
          <p className="section-subtitle">
            Meteorological factors influencing air dispersion and ambient comfort
          </p>
        </div>

        <div className="conditions-grid">
          {/* Temperature */}
          <div className="condition-card">
            <div className="condition-icon-box" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316' }}>
              <ThermometerSun size={26} />
            </div>
            <div className="condition-details">
              <span className="condition-label">Temperature</span>
              <div className="condition-value-row">
                <span className="condition-value">{data.temperature}</span>
                <span className="condition-unit">°C</span>
              </div>
              <span className="condition-desc">Comfortable thermal range</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="condition-card">
            <div className="condition-icon-box" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
              <Droplets size={26} />
            </div>
            <div className="condition-details">
              <span className="condition-label">Relative Humidity</span>
              <div className="condition-value-row">
                <span className="condition-value">{data.humidity}</span>
                <span className="condition-unit">%</span>
              </div>
              <span className="condition-desc">Moisture saturation in air</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="condition-card">
            <div className="condition-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <Wind size={26} />
            </div>
            <div className="condition-details">
              <span className="condition-label">Wind Speed</span>
              <div className="condition-value-row">
                <span className="condition-value">{data.wind_speed || data.windSpeed}</span>
                <span className="condition-unit">km/h</span>
              </div>
              <span className="condition-desc">Dispersion breeze</span>
            </div>
          </div>

          {/* Pressure */}
          <div className="condition-card">
            <div className="condition-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Gauge size={26} />
            </div>
            <div className="condition-details">
              <span className="condition-label">Barometric Pressure</span>
              <div className="condition-value-row">
                <span className="condition-value">{data.pressure}</span>
                <span className="condition-unit">hPa</span>
              </div>
              <span className="condition-desc">Atmospheric pressure</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
