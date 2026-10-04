import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  apiGetUserFavorites,
  apiAddUserFavorite,
  apiRemoveUserFavorite,
  apiGetUserAlerts,
  fetchCityLatest,
  fetchCities
} from '../services/api';
import {
  User,
  Star,
  Plus,
  Trash2,
  Bell,
  Sliders,
  ExternalLink,
  Shield,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Compass
} from 'lucide-react';

export default function UserDashboard({ onNavigate, onSelectCity }) {
  const { user, preferences, favorites, addFavoriteCity, removeFavoriteCity } = useAuth();
  const [favoriteList, setFavoriteList] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [userAlerts, setUserAlerts] = useState([]);
  const [selectedCityToAdd, setSelectedCityToAdd] = useState('');
  const [defaultCityData, setDefaultCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const defaultCity = preferences?.default_city || 'Chennai';

  useEffect(() => {
    loadUserData();
  }, [preferences]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available cities
      const citiesRes = await fetchCities();
      if (citiesRes.cities) {
        setAllCities(citiesRes.cities);
      }

      // 2. Fetch default city telemetry
      const defData = await fetchCityLatest(defaultCity);
      setDefaultCityData(defData);

      // 3. Fetch user favorite cities with telemetry
      const favRes = await apiGetUserFavorites();
      if (favRes.success) {
        setFavoriteList(favRes.favorites || []);
      }

      // 4. Fetch user personalized alerts
      const alertsRes = await apiGetUserAlerts();
      if (alertsRes.success) {
        setUserAlerts(alertsRes.alerts || []);
      }
    } catch (err) {
      console.error('[UserDashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!selectedCityToAdd) return;
    try {
      await addFavoriteCity(selectedCityToAdd);
      setActionMsg(`Added ${selectedCityToAdd} to your favorite cities.`);
      setSelectedCityToAdd('');
      setTimeout(() => setActionMsg(null), 3000);
      loadUserData();
    } catch (err) {
      setActionMsg(`Failed to add favorite: ${err.message}`);
    }
  };

  const handleRemoveFavorite = async (city) => {
    try {
      await removeFavoriteCity(city);
      setActionMsg(`Removed ${city} from your favorites.`);
      setTimeout(() => setActionMsg(null), 3000);
      loadUserData();
    } catch (err) {
      setActionMsg(`Failed to remove favorite: ${err.message}`);
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

  const getAqiStatus = (aqi) => {
    const val = Number(aqi) || 0;
    if (val <= 50) return 'Good';
    if (val <= 100) return 'Moderate';
    if (val <= 150) return 'Sensitive';
    if (val <= 200) return 'Unhealthy';
    if (val <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <User size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Welcome back, {user?.name || 'Observer'}
              </h1>
              <span style={{
                background: user?.role === 'ADMIN' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                border: user?.role === 'ADMIN' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                color: user?.role === 'ADMIN' ? '#818cf8' : '#34d399',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {user?.role === 'ADMIN' ? <Shield size={12} /> : <Activity size={12} />}
                {user?.role === 'ADMIN' ? 'Administrator' : 'Citizen Observer'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
              Monitoring primary zone: <strong style={{ color: '#38bdf8' }}>{defaultCity}</strong> • Alert Threshold: <strong style={{ color: '#fbbf24' }}>{preferences?.alert_aqi_threshold || 100} AQI</strong>
            </p>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigate('settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(51, 65, 85, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f1f5f9',
              fontSize: '0.86rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Sliders size={16} /> Preferences & Settings
          </button>
          <button
            onClick={() => {
              if (onSelectCity) onSelectCity(defaultCity);
              onNavigate('overview');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            <ExternalLink size={16} /> Public Overview
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          color: '#34d399',
          fontSize: '0.88rem',
          marginBottom: '20px'
        }}>
          {actionMsg}
        </div>
      )}

      {/* Grid: Primary Station & Quick Telemetry */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Default City Ambient Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primary Monitored Station
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0 0', color: '#f8fafc' }}>
                {defaultCity}
              </h2>
            </div>
            <button
              onClick={() => {
                if (onSelectCity) onSelectCity(defaultCity);
                onNavigate('my-environment');
              }}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Station View →
            </button>
          </div>

          {defaultCityData ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{
                  fontSize: '3.2rem',
                  fontWeight: 800,
                  color: getAqiColor(defaultCityData.aqi),
                  lineHeight: 1
                }}>
                  {defaultCityData.aqi}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: getAqiColor(defaultCityData.aqi)
                  }}>
                    {getAqiStatus(defaultCityData.aqi)} Air Quality
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Updated {defaultCityData.lastUpdated || 'just now'}
                  </div>
                </div>
              </div>

              {/* Parameter mini cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.75rem' }}>
                    <Thermometer size={13} /> Temp
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>
                    {defaultCityData.temperature}°C
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#38bdf8', fontSize: '0.75rem' }}>
                    <Droplets size={13} /> Humidity
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>
                    {defaultCityData.humidity}%
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#34d399', fontSize: '0.75rem' }}>
                    <Wind size={13} /> Wind
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }}>
                    {defaultCityData.windSpeed} km/h
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b' }}>
              Loading station data...
            </div>
          )}
        </div>

        {/* Personalized Alerts Feed */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Your Environmental Alerts
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Threshold: &gt;{preferences?.alert_aqi_threshold || 100} AQI
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '210px', overflowY: 'auto' }}>
            {userAlerts.length > 0 ? (
              userAlerts.slice(0, 4).map((alert, idx) => (
                <div
                  key={alert.id || idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle
                    size={16}
                    color={alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>{alert.city}</strong>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: alert.severity === 'CRITICAL' ? '#fca5a5' : '#fde68a'
                      }}>
                        {alert.metric} {alert.value}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#cbd5e1' }}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '28px 0', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                All monitored zones are within your safe threshold (&lt;{preferences?.alert_aqi_threshold || 100} AQI).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Favorite Cities Management Section */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="#fbbf24" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Monitored Favorite Cities
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Save custom cities to quickly monitor air telemetry and receive targeted threshold notifications
            </p>
          </div>

          {/* Add City Control */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedCityToAdd}
              onChange={(e) => setSelectedCityToAdd(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            >
              <option value="">Select city to pin...</option>
              {allCities
                .filter(c => !favoriteList.some(fav => fav.city.toLowerCase() === c.name.toLowerCase()))
                .map(c => (
                  <option key={c.key} value={c.name}>{c.name} ({c.state})</option>
                ))}
            </select>
            <button
              onClick={handleAddFavorite}
              disabled={!selectedCityToAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#10b981',
                border: 'none',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: selectedCityToAdd ? 'pointer' : 'not-allowed',
                opacity: selectedCityToAdd ? 1 : 0.6
              }}
            >
              <Plus size={16} /> Pin City
            </button>
          </div>
        </div>

        {/* Favorite Cities Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px'
        }}>
          {favoriteList.length > 0 ? (
            favoriteList.map((fav) => {
              const tel = fav.telemetry;
              const aqi = tel ? tel.aqi : '--';
              const color = tel ? getAqiColor(tel.aqi) : '#64748b';
              const status = tel ? getAqiStatus(tel.aqi) : 'Offline';

              return (
                <div
                  key={fav.city}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    position: 'relative',
                    transition: 'transform 0.2s, border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                        {fav.city}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: color, fontWeight: 600 }}>
                        {status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorite(fav.city)}
                      title="Remove from favorites"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color }}>
                      {aqi}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>AQI Index</span>
                  </div>

                  {tel && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.76rem',
                      color: '#94a3b8',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '10px'
                    }}>
                      <span>PM2.5: <strong style={{ color: '#cbd5e1' }}>{tel.pm25} µg/m³</strong></span>
                      <span>PM10: <strong style={{ color: '#cbd5e1' }}>{tel.pm10} µg/m³</strong></span>
                    </div>
                  )}

                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => {
                        if (onSelectCity) onSelectCity(fav.city);
                        onNavigate('overview');
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 0',
                        borderRadius: '8px',
                        background: 'rgba(51, 65, 85, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Live Telemetry →
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '36px 0', textAlign: 'center', color: '#64748b' }}>
              No favorite cities added yet. Use the selector above to pin your monitored cities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
