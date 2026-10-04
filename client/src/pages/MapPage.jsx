import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCityLatest, fetchCities } from '../services/api';
import { getAqiCategory } from '../utils/calculations';
import { MapPin, Navigation, Info, ExternalLink, RefreshCw, Layers } from 'lucide-react';

// Default station coordinates with baseline data to guarantee immediate rendering
const INITIAL_STATIONS = [
  { city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, aqi: 78, temperature: 29.0, pm25: 34, pm10: 61, lastUpdated: 'Synchronized' },
  { city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, aqi: 88, temperature: 28.0, pm25: 41, pm10: 72, lastUpdated: 'Synchronized' },
  { city: 'Delhi', state: 'National Capital Region', latitude: 28.6139, longitude: 77.2090, aqi: 180, temperature: 29.1, pm25: 116.4, pm10: 178, lastUpdated: 'Synchronized' },
  { city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, aqi: 118, temperature: 31.0, pm25: 58, pm10: 105, lastUpdated: 'Synchronized' },
  { city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, aqi: 42, temperature: 23.0, pm25: 18, pm10: 36, lastUpdated: 'Synchronized' },
];

// Helper to force Leaflet to recalculate container size when mounted in tab
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

// Custom glowing AQI marker icon
function createAqiMarkerIcon(aqi, cityName) {
  const { color } = getAqiCategory(aqi);
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; user-select: none;">
      <div style="
        background: ${color};
        color: #0b0f19;
        font-weight: 800;
        font-size: 12px;
        padding: 3px 8px;
        border-radius: 9999px;
        box-shadow: 0 0 16px ${color}aa, 0 4px 6px rgba(0,0,0,0.6);
        border: 2px solid #ffffff;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span>${aqi}</span>
        <span style="font-size: 9px; opacity: 0.9;">AQI</span>
      </div>
      <div style="
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        margin-top: 3px;
        background: rgba(15, 23, 42, 0.85);
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.25);
        white-space: nowrap;
      ">
        ${cityName}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${color};
        margin-top: -1px;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-aqi-leaflet-marker',
    html,
    iconSize: [80, 52],
    iconAnchor: [40, 52],
    popupAnchor: [0, -52]
  });
}

export default function MapPage({ onSelectCityForDashboard }) {
  const [cityDataList, setCityDataList] = useState(INITIAL_STATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tileSource, setTileSource] = useState('osm'); // 'osm' | 'dark'

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
      if (valid.length > 0) {
        setCityDataList(valid);
      }
    } catch (err) {
      console.warn('[MapPage] Sync note:', err.message);
      // Fallback data remains active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCities();
  }, []);

  // India center coordinates
  const mapCenter = [21.5, 78.9629];

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
            Geospatial visualization of ambient Air Quality Index across regional metropolitan monitoring stations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Tile Layer Toggle */}
          <button
            onClick={() => setTileSource(prev => prev === 'osm' ? 'dark' : 'osm')}
            className="location-selector-container"
            style={{ cursor: 'pointer', padding: '0.5rem 0.85rem', background: 'var(--bg-card)', color: '#fff', fontSize: '0.8rem' }}
            title="Toggle map style"
            type="button"
          >
            <Layers size={14} />
            <span>{tileSource === 'osm' ? 'Theme: Standard' : 'Theme: Dark Matter'}</span>
          </button>

          {/* Sync Button */}
          <button 
            onClick={loadAllCities}
            className="location-selector-container"
            style={{ cursor: 'pointer', padding: '0.5rem 1rem', background: 'var(--bg-card)', color: '#fff' }}
            disabled={loading}
            type="button"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Syncing...' : 'Sync Stations'}</span>
          </button>
        </div>
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
      <div className="card map-card-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
        <MapContainer
          center={mapCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#0b1120' }}
        >
          {/* Ensure map recalculates size */}
          <MapResizer />

          {/* Standard OpenStreetMap or CartoDB Dark Matter */}
          {tileSource === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
          )}

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
                          type="button"
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
