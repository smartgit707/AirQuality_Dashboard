import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchCityLatest,
  fetchRecommendations,
  fetchCities,
  apiUpdateUserPreferences,
  refreshCityTelemetry
} from '../services/api';
import {
  Home,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Activity,
  Heart,
  ShieldAlert,
  RotateCw,
  MapPin,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function MyEnvironmentPage({ onNavigate }) {
  const { preferences, savePreferences } = useAuth();
  const [currentCity, setCurrentCity] = useState(preferences?.default_city || 'Chennai');
  const [telemetry, setTelemetry] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => {
    if (preferences?.default_city) {
      setCurrentCity(preferences.default_city);
    }
  }, [preferences]);

  useEffect(() => {
    loadStationData();
  }, [currentCity]);

  const loadStationData = async () => {
    setLoading(true);
    try {
      const [citiesRes, telemRes, recRes] = await Promise.all([
        fetchCities(),
        fetchCityLatest(currentCity),
        fetchRecommendations(currentCity)
      ]);
      if (citiesRes.cities) setCities(citiesRes.cities);
      setTelemetry(telemRes);
      setRecommendations(recRes);
    } catch (err) {
      console.error('[MyEnvironment] Error loading station telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshCityTelemetry(currentCity);
      await loadStationData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSetAsDefault = async (city) => {
    setCurrentCity(city);
    try {
      await savePreferences({
        defaultCity: city,
        alertAqiThreshold: preferences?.alert_aqi_threshold || 100,
        emailNotifications: preferences?.email_notifications ?? true,
        pushNotifications: preferences?.push_notifications ?? false
      });
      setSaveMsg(`Saved ${city} as your primary environmental monitoring station.`);
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const getAqiColor = (aqi) => {
    const val = Number(aqi) || 0;
    if (val <= 50) return '#10b981';
    if (val <= 100) return '#eab308';
    if (val <= 150) return '#f97316';
    if (val <= 200) return '#ef4444';
    if (val <= 300) return '#8b5cf6';
    return '#991b1b';
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 18px rgba(14, 165, 233, 0.3)'
          }}>
            <Home size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              My Environment Station
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Dedicated micro-station monitoring your primary locality: <strong style={{ color: '#38bdf8' }}>{currentCity}</strong>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={currentCity}
            onChange={(e) => handleSetAsDefault(e.target.value)}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '9px 14px',
              borderRadius: '12px',
              fontSize: '0.86rem',
              outline: 'none'
            }}
          >
            {cities.map(c => (
              <option key={c.key} value={c.name}>{c.name} ({c.state})</option>
            ))}
          </select>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '9px 14px',
              borderRadius: '12px',
              fontSize: '0.86rem',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: 500
            }}
          >
            <RotateCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing...' : 'Sync Telemetry'}
          </button>
        </div>
      </div>

      {saveMsg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(14, 165, 233, 0.15)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: '12px',
          color: '#38bdf8',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          {saveMsg}
        </div>
      )}

      {/* Main Environmental Readout Grid */}
      {telemetry ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          {/* Primary AQI Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Composite Air Quality
              </span>
              <span style={{
                background: `${getAqiColor(telemetry.aqi)}22`,
                color: getAqiColor(telemetry.aqi),
                border: `1px solid ${getAqiColor(telemetry.aqi)}55`,
                padding: '3px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                {telemetry.aqi <= 50 ? 'GOOD' : telemetry.aqi <= 100 ? 'MODERATE' : 'ELEVATED'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '4rem', fontWeight: 900, color: getAqiColor(telemetry.aqi), lineHeight: 1 }}>
                {telemetry.aqi}
              </span>
              <span style={{ fontSize: '1rem', color: '#94a3b8' }}>AQI</span>
            </div>

            <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Current atmospheric quality is within expected seasonal variance. Primary contributor is particulate matter.
            </p>
          </div>

          {/* Meteorological Readings */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.8rem', marginBottom: '6px' }}>
                <Thermometer size={16} /> Ambient Temp
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {telemetry.temperature}°C
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.8rem', marginBottom: '6px' }}>
                <Droplets size={16} /> Rel. Humidity
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {telemetry.humidity}%
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.8rem', marginBottom: '6px' }}>
                <Wind size={16} /> Wind Velocity
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {telemetry.windSpeed} km/h
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '0.8rem', marginBottom: '6px' }}>
                <Gauge size={16} /> Pressure
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                {telemetry.pressure} hPa
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
          Loading micro-station telemetry...
        </div>
      )}

      {/* Health & Environmental Advice */}
      {recommendations && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Heart size={20} color="#ec4899" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Personalized Lifestyle & Health Guidance
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
                🏃 Outdoor Exercise
              </strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                {recommendations.outdoorActivities || 'Suitable for normal outdoor running and leisure.'}
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#ec4899', display: 'block', marginBottom: '4px' }}>
                🫁 Sensitive Demographics
              </strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                {recommendations.sensitiveGroups || 'Children and elderly should observe normal precautionary habits.'}
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '12px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#10b981', display: 'block', marginBottom: '4px' }}>
                🏠 Home Ventilation
              </strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                {recommendations.ventilation || 'Window ventilation is recommended during afternoon breeze hours.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
