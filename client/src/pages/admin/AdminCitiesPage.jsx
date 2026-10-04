import React, { useState, useEffect } from 'react';
import { apiGetAdminCities, refreshCityTelemetry } from '../../services/api';
import {
  Radio,
  ArrowLeft,
  RotateCw,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Wind
} from 'lucide-react';

export default function AdminCitiesPage({ onBack }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingCity, setSyncingCity] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdminCities();
      if (res.success) {
        setCities(res.cities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (cityName) => {
    setSyncingCity(cityName);
    try {
      await refreshCityTelemetry(cityName);
      setMsg(`Station '${cityName}' telemetry refreshed successfully.`);
      setTimeout(() => setMsg(null), 3000);
      await loadCities();
    } catch (err) {
      setMsg(`Sync error: ${err.message}`);
    } finally {
      setSyncingCity(null);
    }
  };

  const getAqiColor = (aqi) => {
    const val = Number(aqi) || 0;
    if (val <= 50) return '#10b981';
    if (val <= 100) return '#eab308';
    if (val <= 150) return '#f97316';
    if (val <= 200) return '#ef4444';
    return '#8b5cf6';
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} /> Admin Console
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Monitored Sensor Stations
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Real-time telemetry feeds and Open-Meteo gateway sync state
            </p>
          </div>
        </div>

        <button
          onClick={loadCities}
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '8px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <RotateCw size={14} /> Refresh Feeds
        </button>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          color: '#34d399',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* Station Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {cities.map((city) => (
          <div
            key={city.key}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '24px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  {city.name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <MapPin size={12} /> {city.latitude.toFixed(2)}° N, {city.longitude.toFixed(2)}° E
                </div>
              </div>

              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                ONLINE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: getAqiColor(city.aqi) }}>
                {city.aqi ?? '--'}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Composite AQI</span>
            </div>

            {/* Pollutant mini telemetry */}
            {city.pollutants && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.5)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PM2.5</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{city.pollutants.pm25}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PM10</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{city.pollutants.pm10}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>NO2</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{city.pollutants.no2}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Synced: {city.lastSync ? new Date(city.lastSync).toLocaleTimeString() : 'Recent'}
              </span>
              <button
                onClick={() => handleRefresh(city.name)}
                disabled={syncingCity === city.name}
                style={{
                  background: 'rgba(51, 65, 85, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: syncingCity === city.name ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCw size={12} style={{ animation: syncingCity === city.name ? 'spin 1s linear infinite' : 'none' }} />
                {syncingCity === city.name ? 'Syncing...' : 'Sync Gateway'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
