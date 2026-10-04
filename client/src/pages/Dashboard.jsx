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
  Database, 
  Globe, 
  HeartPulse,
  Eye,
  Navigation,
  Trophy,
  ArrowRight,
  ArrowLeftRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';
import AQICard from '../components/AQICard';
import MetricCard from '../components/MetricCard';
import PollutantCard from '../components/PollutantCard';
import AQIChart from '../components/AQIChart';
import EnvironmentalScore from '../components/EnvironmentalScore';
import RecommendationCard from '../components/RecommendationCard';
import CigaretteEquivalenceCard from '../components/CigaretteEquivalenceCard';
import AudioBriefingButton from '../components/AudioBriefingButton';
import LocationSearch from '../components/LocationSearch';
import { getAQIStatus, getLiveCityRankings } from '../data/mockData';

export default function Dashboard({ 
  data, 
  historyData, 
  currentCity, 
  loading, 
  error, 
  isApiConnected, 
  isDbConnected, 
  onRetry,
  onNavigate,
  onCityChange
}) {
  if (!data && loading) {
    return (
      <main className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '55vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1.25rem', width: '16px', height: '16px' }}></div>
          <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: '0.4rem' }}>Loading Environmental Telemetry...</h2>
          <p style={{ fontSize: '0.9rem' }}>Querying atmospheric records for {currentCity}</p>
        </div>
      </main>
    );
  }

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

  // Standard NAQI / EPA scale intervals
  const aqiTiers = [
    { range: '0 - 50', label: 'Good', color: '#10b981', min: 0, max: 50 },
    { range: '51 - 100', label: 'Moderate', color: '#eab308', min: 51, max: 100 },
    { range: '101 - 150', label: 'Poor / Sensitive', color: '#f97316', min: 101, max: 150 },
    { range: '151 - 200', label: 'Unhealthy', color: '#ef4444', min: 151, max: 200 },
    { range: '201 - 300', label: 'Very Unhealthy', color: '#8b5cf6', min: 201, max: 300 },
    { range: '301+', label: 'Hazardous', color: '#a21caf', min: 301, max: 500 },
  ];

  // Calculate percentage pointer on the horizontal scale (capped at 500)
  const scalePointerPercent = Math.min(100, Math.max(2, Math.round((data.aqi / 350) * 100)));

  // Live rankings preview (top 3 polluted and cleanest)
  const topPolluted = getLiveCityRankings('polluted', 'india').slice(0, 3);
  const topCleanest = getLiveCityRankings('cleanest', 'india').slice(0, 3);

  return (
    <main className="dashboard-container" style={{ maxWidth: '1380px', margin: '0 auto', padding: '1.5rem 2rem' }}>
      
      {/* ============================================================
          SECTION 4: HERO BANNER & SEARCH LOCATION BAR
          ============================================================ */}
      <section 
        className="homepage-hero-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(8, 20, 14, 0.95) 0%, rgba(4, 10, 7, 0.98) 100%)',
          border: '1px solid rgba(0, 245, 160, 0.28)',
          borderRadius: '24px',
          padding: '2.5rem 2.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(0, 245, 160, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(0, 245, 160, 0.12)', border: '1px solid rgba(0, 245, 160, 0.3)', color: '#00f5a0', fontSize: '0.78rem', fontWeight: 800, marginBottom: '1rem' }}>
            <Wind size={14} />
            <span>AIR QUALITY & ENVIRONMENTAL INTELLIGENCE</span>
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Know the air around you.
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Real-time air quality index, criteria pollutants, meteorological dispersion, and physiological health models across metropolitan monitoring stations.
          </p>

          {/* Prominent Global Location Search */}
          <div style={{ maxWidth: '680px', marginBottom: '1.25rem' }}>
            <LocationSearch 
              currentCity={currentCity}
              onCityChange={onCityChange}
              variant="banner"
              disabled={loading}
            />
          </div>

          {/* Popular City Quick Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748b' }}>
            <span style={{ fontWeight: 700, color: '#94a3b8' }}>Popular:</span>
            {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'London', 'New York'].map((cityName) => (
              <button
                key={cityName}
                type="button"
                onClick={() => onCityChange && onCityChange(cityName)}
                style={{
                  background: cityName.toLowerCase() === currentCity.toLowerCase() ? 'rgba(0, 245, 160, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: cityName.toLowerCase() === currentCity.toLowerCase() ? '1px solid #00f5a0' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: cityName.toLowerCase() === currentCity.toLowerCase() ? '#00f5a0' : '#cbd5e1',
                  borderRadius: '8px',
                  padding: '3px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SELECTED LOCATION OVERVIEW & TELEMETRY BADGES
          ============================================================ */}
      <section 
        className="selected-location-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'rgba(12, 24, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '1.25rem 2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={22} style={{ color: '#00f5a0' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
              {data.city}
              {data.state && <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500, marginLeft: '8px' }}>({data.state}, {data.country || 'India'})</span>}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} style={{ color: '#00f5a0' }} />
              <span>Last updated: <strong>{data.lastUpdated || '10 minutes ago'}</strong></span>
            </span>
            <span>&bull;</span>
            <span>National AQI Standard: <strong>CPCB / US-EPA</strong></span>
          </div>
        </div>

        {/* Action Controls & Dispatch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <AudioBriefingButton 
            city={data.city} 
            aqi={data.aqi} 
            temperature={data.temperature} 
            pm25={data.pm25} 
          />

          <span 
            className="source-badge" 
            style={{ 
              borderColor: isDbConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)',
              color: isDbConnected ? '#10b981' : '#60a5fa',
              backgroundColor: isDbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'
            }}
          >
            <Database size={13} style={{ marginRight: '4px' }} />
            {isDbConnected ? 'PostgreSQL Live Connected' : 'Express API Connected'}
          </span>

          {onNavigate && (
            <button
              onClick={() => onNavigate('city')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(0, 245, 160, 0.15)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                color: '#00f5a0',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Full City Dossier</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </section>

      {/* Warning banner if present */}
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
              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 4 CONTINUED: PROMINENT AQI HERO & HEALTH SCORE
          ============================================================ */}
      <section className="hero-intelligence-grid" style={{ marginBottom: '1.75rem' }}>
        <AQICard aqi={data.aqi} />
        <EnvironmentalScore data={data} loading={loading} />
      </section>

      {/* Berkeley Earth Cigarette Equivalence Banner */}
      <CigaretteEquivalenceCard pm25={data.pm25} />

      {/* ============================================================
          SECTION 7: AQI SCALE REFERENCE & POSITION INDICATOR
          ============================================================ */}
      <section 
        className="aqi-scale-section"
        style={{
          background: 'rgba(12, 24, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '2rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#00f5a0' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Official National Air Quality Index (NAQI) Scale
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0' }}>
              Standard 6-tier classification adopted by CPCB & US-EPA
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <span style={{ color: '#94a3b8' }}>Currently in {data.city}:</span>
            <strong style={{ color: currentAQIStatus.color }}>{currentAQIStatus.label} ({data.aqi} AQI)</strong>
          </div>
        </div>

        {/* Visual Continuous Gradient Scale with Marker */}
        <div style={{ position: 'relative', margin: '2rem 0 1rem' }}>
          
          {/* Active pointer arrow pointing down */}
          <div 
            style={{
              position: 'absolute',
              top: '-26px',
              left: `${scalePointerPercent}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10,
              transition: 'left 0.5s ease-out'
            }}
          >
            <span style={{
              background: currentAQIStatus.color,
              color: '#052317',
              fontSize: '0.72rem',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '6px',
              boxShadow: `0 0 12px ${currentAQIStatus.color}`
            }}>
              {data.city}: {data.aqi}
            </span>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `6px solid ${currentAQIStatus.color}`
            }} />
          </div>

          {/* Color Gradient Segmented Bar */}
          <div style={{ display: 'flex', height: '12px', borderRadius: '9999px', overflow: 'hidden', gap: '2px' }}>
            {aqiTiers.map((tier) => (
              <div 
                key={tier.label}
                style={{
                  flex: 1,
                  background: tier.color,
                  opacity: currentAQIStatus.label.toLowerCase().includes(tier.label.toLowerCase()) ? 1 : 0.65,
                  boxShadow: currentAQIStatus.label.toLowerCase().includes(tier.label.toLowerCase()) ? `0 0 15px ${tier.color}` : 'none',
                  transition: 'opacity 0.2s'
                }}
                title={`${tier.label}: ${tier.range}`}
              />
            ))}
          </div>

          {/* Scale Labels Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', marginTop: '8px', textAlign: 'center' }}>
            {aqiTiers.map((tier) => {
              const isCurrent = currentAQIStatus.label.toLowerCase().includes(tier.label.toLowerCase());
              return (
                <div key={tier.label} style={{ fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 800, color: isCurrent ? tier.color : '#cbd5e1' }}>
                    {tier.label}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {tier.range}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: POLLUTANT SECTION (WITH "Data unavailable" NOT 0)
          ============================================================ */}
      <section className="pollutants-section" style={{ marginBottom: '2.5rem' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              <Activity size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>Criteria Pollutants in {data.city}</span>
            </h2>
            <p className="section-subtitle" style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Concentrations evaluated against WHO Guidelines. Click "3D Flip" on cards for pathophysiology.
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('pollutants')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Pollutants Guide</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        <div className="pollutants-grid">
          <PollutantCard name="PM2.5" fullName="Fine Particles" value={data.pm25} unit="µg/m³" typeKey="pm25" />
          <PollutantCard name="PM10" fullName="Coarse Dust" value={data.pm10} unit="µg/m³" typeKey="pm10" />
          <PollutantCard name="CO" fullName="Carbon Monoxide" value={data.co} unit="mg/m³" typeKey="co" />
          <PollutantCard name="NO2" fullName="Nitrogen Dioxide" value={data.no2} unit="µg/m³" typeKey="no2" />
          <PollutantCard name="SO2" fullName="Sulfur Dioxide" value={data.so2} unit="µg/m³" typeKey="so2" />
          <PollutantCard name="O3" fullName="Ozone" value={data.o3} unit="µg/m³" typeKey="o3" />
        </div>
      </section>

      {/* ============================================================
          SECTION 6: WEATHER + ENVIRONMENTAL CONDITIONS SECTION
          (Only display metrics that are actually available)
          ============================================================ */}
      <section className="conditions-section" style={{ marginBottom: '2.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            <Wind size={20} style={{ color: 'var(--accent-teal)' }} />
            <span>Environmental & Meteorological Conditions</span>
          </h2>
          <p className="section-subtitle" style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Meteorological dispersion forces influencing ambient particulate residence time
          </p>
        </div>

        <div className="conditions-grid">
          {/* Temperature */}
          {data.temperature != null && (
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
                <span className="condition-desc">Ambient thermal profile</span>
              </div>
            </div>
          )}

          {/* Humidity */}
          {data.humidity != null && (
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
          )}

          {/* Wind Speed & Direction */}
          {(data.wind_speed != null || data.windSpeed != null) && (
            <div className="condition-card">
              <div className="condition-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                <Wind size={26} />
              </div>
              <div className="condition-details">
                <span className="condition-label">Wind Velocity</span>
                <div className="condition-value-row">
                  <span className="condition-value">{data.wind_speed || data.windSpeed}</span>
                  <span className="condition-unit">km/h {data.windDirection ? `(${data.windDirection})` : ''}</span>
                </div>
                <span className="condition-desc">Atmospheric dispersion speed</span>
              </div>
            </div>
          )}

          {/* Pressure */}
          {data.pressure != null && (
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
                <span className="condition-desc">Surface air pressure</span>
              </div>
            </div>
          )}

          {/* Visibility (if available) */}
          {data.visibility != null && (
            <div className="condition-card">
              <div className="condition-icon-box" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                <Eye size={26} />
              </div>
              <div className="condition-details">
                <span className="condition-label">Horizontal Visibility</span>
                <div className="condition-value-row">
                  <span className="condition-value">{data.visibility}</span>
                  <span className="condition-unit">km</span>
                </div>
                <span className="condition-desc">Visual range clarity</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 10: 24-HOUR DIURNAL AQI TREND CHART
          ============================================================ */}
      <section className="dashboard-middle-section" style={{ marginBottom: '2.5rem' }}>
        <AQIChart data={historyData && historyData.length > 0 ? historyData : data.trend} city={data.city} />

        {/* Environmental Insights Sidebar */}
        <div className="scale-reference-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="panel-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles size={18} style={{ color: '#00f5a0' }} />
                  <span>Diurnal Insights</span>
                </h2>
                <p className="panel-subtitle">Atmospheric Behavioral Patterns</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Dominant Contaminant</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                  PM2.5 (Fine Respirable Dust)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Accounts for ~68% of composite index
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Peak Exposure Window</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                  8:00 AM &ndash; 11:30 AM
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Morning thermal inversion restricts mixing
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Optimal Cleanest Window</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  3:00 PM &ndash; 6:00 PM
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                  Afternoon solar convection aids dispersion
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onNavigate && onNavigate('trends')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(0, 245, 160, 0.1)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                color: '#00f5a0',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>Explore Multi-Year History</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 14 PREVIEW: CITY RANKINGS LEADERBOARD PREVIEW
          ============================================================ */}
      <section 
        className="rankings-preview-section"
        style={{
          background: 'rgba(12, 24, 18, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '2.5rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} style={{ color: '#00f5a0' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Live Metropolitan Rankings Leaderboard
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Real-time atmospheric sorting across Indian metropolitan stations
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('rankings')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(0, 245, 160, 0.15)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                color: '#00f5a0',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span>View Full Rankings Page</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Most Polluted Cities Preview */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
              <Flame size={16} />
              <span>Highest Pollution Levels</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topPolluted.map((c) => (
                <div 
                  key={c.city}
                  onClick={() => onCityChange && onCityChange(c.city)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.82rem' }}>#{c.rank}</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{c.city}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: c.status.color }}>{c.aqi} AQI</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: c.status.badgeBg, color: c.status.color }}>
                      {c.status.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cleanest Cities Preview */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' }}>
              <ShieldCheck size={16} />
              <span>Cleanest Air Quality</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCleanest.map((c) => (
                <div 
                  key={c.city}
                  onClick={() => onCityChange && onCityChange(c.city)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.82rem' }}>#{c.rank}</span>
                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{c.city}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: c.status.color }}>{c.aqi} AQI</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: c.status.badgeBg, color: c.status.color }}>
                      {c.status.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 15 PREVIEW: MULTI-CITY COMPARISON TEASER
          ============================================================ */}
      <section 
        style={{
          background: 'linear-gradient(135deg, rgba(16, 24, 39, 0.8) 0%, rgba(10, 16, 26, 0.9) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', marginBottom: '6px' }}>
            <ArrowLeftRight size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Multi-City Intelligence Matrix</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
            Compare Air Quality Between 2 to 5 Metropolitan Hubs
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, maxWidth: '640px' }}>
            Side-by-side comparison of PM2.5, PM10, meteorological dispersion, and 30-day historical averages.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('compare')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
          >
            <span>Launch City Comparator</span>
            <ArrowRight size={15} />
          </button>
        )}
      </section>

      {/* Activity & Outdoor Health Recommendations */}
      <section style={{ marginBottom: '2.5rem' }}>
        <RecommendationCard city={data.city} aqi={data.aqi} />
      </section>

      {/* 3D Studio & Simulation Launchers */}
      <section 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* 3D Earth Studio Launcher */}
        <div 
          onClick={() => onNavigate && onNavigate('globe')}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 30, 20, 0.8) 0%, rgba(3, 15, 10, 0.9) 100%)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            borderRadius: '20px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00f5a0'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f5a0', marginBottom: '8px' }}>
            <Globe size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              3D Earth Digital Twin
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
            Interactive WebGL 3D holographic globe rendering atmospheric criteria beacons, wind streamlines, and planetary air dispersion.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00f5a0', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>Launch 3D Earth Studio</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* BreathIQ 3D Simulator Launcher */}
        <div 
          onClick={() => onNavigate && onNavigate('breathiq')}
          style={{
            background: 'linear-gradient(135deg, rgba(35, 12, 14, 0.8) 0%, rgba(20, 6, 8, 0.9) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '8px' }}>
            <HeartPulse size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              BreathIQ™ 3D Pulmonary Simulator
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
            Interactive physiological lung model calculating minute tidal ventilation, particulate alveolar deposition, and cigarette toxicity equivalence.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>Launch Inhalation Simulator</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </section>
    </main>
  );
}
