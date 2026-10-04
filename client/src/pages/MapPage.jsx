import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCityLatest, fetchCities } from '../services/api';
import { getAqiCategory } from '../utils/calculations';
import { MapPin, Navigation, Info, ExternalLink, RefreshCw } from 'lucide-react';

// Create custom glowing AQI marker icon
function createAqiMarkerIcon(aqi, cityName) {
  const { color } = getAqiCategory(aqi);
  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      cursor: pointer;
    ">
      <div style="
        background: ${color};
        color: #0b0f19;
        font-weight: 800;
        font-size: 13px;
        padding: 4px 10px;
        border-radius: 9999px;
        box-shadow: 0 0 15px ${color}88, 0 4px 6px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>${aqi}</span>
        <span style="font-size: 10px; opacity: 0.85;">AQI</span>
      </div>
      <div style="
        color: #ffffff;
        font-size: 11px;
        font-weight: 600;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        margin-top: 3px;
        background: rgba(15, 23, 42, 0.75);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.15);
      ">
        ${cityName}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${color};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-aqi-leaflet-marker',
    html,
    iconSize: [60, 42],
    iconAnchor: [30, 42],
    popupAnchor: [0, -45]
  });
}

export default function MapPage({ onSelectCityForDashboard }) {
  const [cityDataList, setCityDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const citiesRes = await fetchCities();
      const cityList = citiesRes.cities || ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];

      const results = await Promise.all(
        cityList.map(async (name) => {
          try {
            return await fetchCityLatest(name);
          } catch (e) {
            return null;
          }
        })
      );

      const valid = results.filter(Boolean);
      setCityDataList(valid);
    } catch (err) {
      console.error('[MapPage] Failed to fetch cities:', err);
      setError('Unable to load geographical telemetry. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCities();
  }, []);

  // India center coordinates
  const mapCenter = [20.5937, 78.9629];

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Page Header */}
      <div className="dashboard-header" style={{ marginBottom: '1.25rem' }}>
        <div className="header-title-group">
          <h1>
            <span>Live Pollution</span>
            <span className="city-highlight"> Interactive Map</span>
          </h1>
          <p>
            Real-time geospatial distribution of Air Quality Index (AQI) and particulates across metropolitan monitoring stations
          </p>
        </div>

        <button 
          onClick={loadAllCities}
          className="location-selector-container"
          style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: 'var(--bg-card)', color: '#fff' }}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Refreshing Map...' : 'Sync Stations'}</span>
        </button>
      </div>

      {/* Legend & Stats Strip */}
      <div className="map-legend-strip">
        <div className="legend-items-row">
          <span className="legend-label">Severity Scale:</span>
          <span className="legend-badge" style={{ backgroundColor: '#10b98125', color: '#10b981', borderColor: '#10b98155' }}>
            ● Good (0–50)
          </span>
          <span className="legend-badge" style={{ backgroundColor: '#fbbf2425', color: '#fbbf24', borderColor: '#fbbf2455' }}>
            ● Moderate (51–100)
          </span>
          <span className="legend-badge" style={{ backgroundColor: '#f9731625', color: '#f97316', borderColor: '#f9731655' }}>
            ● Sensitive (101–150)
          </span>
          <span className="legend-badge" style={{ backgroundColor: '#ef444425', color: '#ef4444', borderColor: '#ef444455' }}>
            ● Unhealthy (151–200)
          </span>
          <span className="legend-badge" style={{ backgroundColor: '#a855f725', color: '#a855f7', borderColor: '#a855f755' }}>
            ● Very Unhealthy (201+)
          </span>
        </div>
      </div>

      {error && (
        <div className="alert-box-warning" style={{ margin: '1rem 0' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="card map-card-wrapper" style={{ padding: 0, overflow: 'hidden', height: '620px', position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#0b1120' }}
        >
          {/* CartoDB Dark Matter tiles for clean dark theme aesthetic */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {cityDataList.map((city) => {
            if (!city.latitude || !city.longitude) return null;
            const markerIcon = createAqiMarkerIcon(city.aqi, city.city);
            const { label: statusLabel, color: statusColor } = getAqiCategory(city.aqi);

            return (
              <Marker
                key={city.city}
                position={[city.latitude, city.longitude]}
                icon={markerIcon}
              >
                <Popup className="custom-dark-popup">
                  <div style={{ color: '#f1f5f9', minWidth: '220px', padding: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{city.city}</strong>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: statusColor, 
                        background: `${statusColor}22`,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        border: `1px solid ${statusColor}55`
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '8px 0', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Current AQI</span>
                        <strong style={{ fontSize: '1.25rem', color: statusColor }}>{city.aqi}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>Temperature</span>
                        <strong style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{city.temperature}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>PM2.5</span>
                        <strong style={{ color: '#f8fafc' }}>{city.pm25} µg/m³</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>PM10</span>
                        <strong style={{ color: '#f8fafc' }}>{city.pm10} µg/m³</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Updated: {city.lastUpdated || 'Live'}</span>
                      {onSelectCityForDashboard && (
                        <button
                          onClick={() => onSelectCityForDashboard(city.city)}
                          style={{
                            background: 'var(--accent-blue)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>View Details</span>
                          <ExternalLink size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
