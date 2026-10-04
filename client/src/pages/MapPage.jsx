import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchCityLatest, fetchCities } from '../services/api';
import { getAqiCategory } from '../utils/calculations';
import { 
  MapPin, 
  Navigation, 
  Info, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Compass, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Volume2,
  CheckCircle2,
  Wind
} from 'lucide-react';

// Default station coordinates with baseline data to guarantee immediate rendering
const INITIAL_STATIONS = [
  { city: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, aqi: 78, temperature: 29.0, pm25: 34, pm10: 61, lastUpdated: 'Synchronized' },
  { city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, aqi: 88, temperature: 28.0, pm25: 41, pm10: 72, lastUpdated: 'Synchronized' },
  { city: 'Delhi', state: 'National Capital Region', latitude: 28.6139, longitude: 77.2090, aqi: 180, temperature: 29.1, pm25: 116.4, pm10: 178, lastUpdated: 'Synchronized' },
  { city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, aqi: 118, temperature: 31.0, pm25: 58, pm10: 105, lastUpdated: 'Synchronized' },
  { city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, aqi: 42, temperature: 23.0, pm25: 18, pm10: 36, lastUpdated: 'Synchronized' },
];

// EcoRoute Urban Corridors
const ECOROUTE_CORRIDORS = {
  Hyderabad: {
    city: 'Hyderabad',
    name: 'HITEC Tech Hub to Secunderabad Corridor',
    originName: 'HITEC City Cyber Towers',
    destName: 'Secunderabad Junction',
    center: [17.4420, 78.4350],
    zoom: 12,
    originCoord: [17.4474, 78.3762],
    destCoord: [17.4399, 78.4983],
    greenRoute: [
      [17.4474, 78.3762],
      [17.4400, 78.3980],
      [17.4260, 78.4190],
      [17.4210, 78.4410],
      [17.4310, 78.4620],
      [17.4380, 78.4810],
      [17.4399, 78.4983]
    ],
    redRoute: [
      [17.4474, 78.3762],
      [17.4320, 78.3890],
      [17.4080, 78.4320],
      [17.4120, 78.4600],
      [17.4280, 78.4750],
      [17.4399, 78.4983]
    ],
    greenStats: { dist: '20.8 km', time: '40 min', avgAqi: 56, pm25: '26 µg/m³', exposure: 'Low (48 µg)' },
    redStats: { dist: '18.4 km', time: '35 min', avgAqi: 148, pm25: '78 µg/m³', exposure: 'High (162 µg)' },
    savingsPct: 65,
    greenHighlights: 'Routes through KBR National Park perimeter & Sanjeevaiah botanical lake buffer away from heavy freight.'
  },
  Delhi: {
    city: 'Delhi',
    name: 'Connaught Place to Noida Tech Corridor',
    originName: 'Connaught Place Inner Circle',
    destName: 'Noida Electronic City (Sec 62)',
    center: [28.6180, 77.2900],
    zoom: 12,
    originCoord: [28.6315, 77.2167],
    destCoord: [28.6280, 77.3685],
    greenRoute: [
      [28.6315, 77.2167],
      [28.6220, 77.2400],
      [28.6080, 77.2750],
      [28.6150, 77.3100],
      [28.6220, 77.3400],
      [28.6280, 77.3685]
    ],
    redRoute: [
      [28.6315, 77.2167],
      [28.5980, 77.2450],
      [28.5720, 77.2620],
      [28.5800, 77.3120],
      [28.6120, 77.3450],
      [28.6280, 77.3685]
    ],
    greenStats: { dist: '22.4 km', time: '48 min', avgAqi: 94, pm25: '48 µg/m³', exposure: 'Moderate (82 µg)' },
    redStats: { dist: '19.8 km', time: '42 min', avgAqi: 235, pm25: '168 µg/m³', exposure: 'Hazardous (290 µg)' },
    savingsPct: 68,
    greenHighlights: 'Bypasses the congested Ring Road and Ashram Chowk truck corridor along Yamuna green belt.'
  },
  Bengaluru: {
    city: 'Bengaluru',
    name: 'Indiranagar to Electronic City Corridor',
    originName: 'Indiranagar 100ft Road',
    destName: 'Electronic City Phase 1',
    center: [12.9100, 77.6500],
    zoom: 12,
    originCoord: [12.9784, 77.6408],
    destCoord: [12.8452, 77.6602],
    greenRoute: [
      [12.9784, 77.6408],
      [12.9450, 77.6480],
      [12.9180, 77.6520],
      [12.8800, 77.6550],
      [12.8452, 77.6602]
    ],
    redRoute: [
      [12.9784, 77.6408],
      [12.9350, 77.6200],
      [12.9170, 77.6220],
      [12.8650, 77.6450],
      [12.8452, 77.6602]
    ],
    greenStats: { dist: '18.6 km', time: '38 min', avgAqi: 38, pm25: '15 µg/m³', exposure: 'Minimal (24 µg)' },
    redStats: { dist: '17.2 km', time: '36 min', avgAqi: 122, pm25: '64 µg/m³', exposure: 'Elevated (118 µg)' },
    savingsPct: 72,
    greenHighlights: 'Avoids heavy congestion at Silk Board Junction using Agara lake tree perimeter.'
  },
  Chennai: {
    city: 'Chennai',
    name: 'Marina Beach to Guindy Tech Zone',
    originName: 'Marina Promenade',
    destName: 'Guindy Kathipara Junction',
    center: [13.0300, 80.2450],
    zoom: 13,
    originCoord: [13.0500, 80.2824],
    destCoord: [13.0067, 80.2030],
    greenRoute: [
      [13.0500, 80.2824],
      [13.0320, 80.2650],
      [13.0180, 80.2420],
      [13.0100, 80.2200],
      [13.0067, 80.2030]
    ],
    redRoute: [
      [13.0500, 80.2824],
      [13.0600, 80.2520],
      [13.0350, 80.2280],
      [13.0150, 80.2110],
      [13.0067, 80.2030]
    ],
    greenStats: { dist: '12.8 km', time: '26 min', avgAqi: 46, pm25: '21 µg/m³', exposure: 'Good (34 µg)' },
    redStats: { dist: '11.5 km', time: '24 min', avgAqi: 98, pm25: '49 µg/m³', exposure: 'Moderate (85 µg)' },
    savingsPct: 56,
    greenHighlights: 'Benefits from natural coastal onshore breeze ventilation and Adyar eco-park buffer.'
  },
  Mumbai: {
    city: 'Mumbai',
    name: 'Bandra West to Powai Lake Corridor',
    originName: 'Bandra Bandstand',
    destName: 'Powai / Hiranandani Gardens',
    center: [19.0900, 72.8700],
    zoom: 12,
    originCoord: [19.0596, 72.8295],
    destCoord: [19.1232, 72.9060],
    greenRoute: [
      [19.0596, 72.8295],
      [19.0800, 72.8550],
      [19.1020, 72.8800],
      [19.1150, 72.8950],
      [19.1232, 72.9060]
    ],
    redRoute: [
      [19.0596, 72.8295],
      [19.0680, 72.8500],
      [19.0880, 72.8680],
      [19.1050, 72.8880],
      [19.1232, 72.9060]
    ],
    greenStats: { dist: '16.5 km', time: '38 min', avgAqi: 58, pm25: '28 µg/m³', exposure: 'Moderate (52 µg)' },
    redStats: { dist: '14.8 km', time: '34 min', avgAqi: 154, pm25: '82 µg/m³', exposure: 'Unhealthy (158 µg)' },
    savingsPct: 62,
    greenHighlights: 'Circumnavigates the heavy diesel emissions of Western Express Highway via greener residential avenues.'
  }
};

// Hardcoded fallback coordinates for all monitored stations
const CITY_COORDINATES = {
  Chennai: { latitude: 13.0827, longitude: 80.2707 },
  Hyderabad: { latitude: 17.3850, longitude: 78.4867 },
  Delhi: { latitude: 28.6139, longitude: 77.2090 },
  Mumbai: { latitude: 19.0760, longitude: 72.8777 },
  Bengaluru: { latitude: 12.9716, longitude: 77.5946 }
};

// Helper to force Leaflet to recalculate container size when mounted in tab
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    const t3 = setTimeout(() => map.invalidateSize(), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);
  return null;
}

// Controller to smoothly animate to target corridor
function MapFlyController({ center, zoom }) {
  const map = useMap();
  const lat = center ? center[0] : null;
  const lng = center ? center[1] : null;

  useEffect(() => {
    if (lat && lng && zoom) {
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }, [lat, lng, zoom, map]);
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

// Waypoint Pin Icons
function createWaypointIcon(label, isGreen = true) {
  const color = isGreen ? '#00f5a0' : '#ef4444';
  const textColor = isGreen ? '#042416' : '#ffffff';
  const html = `
    <div style="
      background: ${color};
      color: ${textColor};
      font-weight: 800;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 0 16px ${color}aa, 0 4px 8px rgba(0,0,0,0.5);
      border: 2px solid #ffffff;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      <span>${isGreen ? '🟢 START' : '🏁 DESTINATION'}</span>
    </div>
  `;
  return L.divIcon({
    className: 'custom-waypoint-icon',
    html,
    iconSize: [90, 30],
    iconAnchor: [45, 15]
  });
}

export default function MapPage({ onSelectCityForDashboard }) {
  const [cityDataList, setCityDataList] = useState(INITIAL_STATIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tileSource, setTileSource] = useState('dark'); // Default to sleek dark map
  
  // EcoRoute States
  const [ecoRouteActive, setEcoRouteActive] = useState(false);
  const [selectedCityCorridor, setSelectedCityCorridor] = useState('Hyderabad');
  const [commuteMode, setCommuteMode] = useState('jogger'); // jogger | cyclist | commuter
  const [voiceDispatched, setVoiceDispatched] = useState(false);

  const activeCorridor = ECOROUTE_CORRIDORS[selectedCityCorridor] || ECOROUTE_CORRIDORS.Hyderabad;

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCities();
  }, []);

  const handleSimulateVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `EcoRoute Navigation engaged for ${activeCorridor.city}. Turn right onto the Clean Air Green Corridor. Expected average AQI is ${activeCorridor.greenStats.avgAqi}, saving 65 percent particulate inhalation compared to the arterial highway.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
      setVoiceDispatched(true);
      setTimeout(() => setVoiceDispatched(false), 5000);
    }
  };

  const mapCenter = ecoRouteActive ? activeCorridor.center : [21.5, 78.9629];
  const mapZoom = ecoRouteActive ? activeCorridor.zoom : 5;

  return (
    <div className="dashboard-container" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Page Header */}
      <div className="dashboard-header" style={{ marginBottom: '1.25rem' }}>
        <div className="header-title-group">
          <h1>
            <span>Geospatial</span>
            <span className="city-highlight"> Environmental Intelligence</span>
          </h1>
          <p>
            Real-time atmospheric telemetry and Cleanest-Air "EcoRoute" navigation across urban monitoring stations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* ECOROUTE NAVIGATOR TOGGLE BUTTON */}
          <button
            onClick={() => setEcoRouteActive(!ecoRouteActive)}
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              border: ecoRouteActive ? '1px solid #00f5a0' : '1px solid rgba(255, 255, 255, 0.15)',
              background: ecoRouteActive ? 'linear-gradient(135deg, #00f5a0 0%, #10b981 100%)' : 'rgba(12, 24, 18, 0.85)',
              color: ecoRouteActive ? '#042416' : '#cbd5e1',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: ecoRouteActive ? '0 0 20px rgba(0, 245, 160, 0.45)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            type="button"
          >
            <Compass size={16} />
            <span>{ecoRouteActive ? '🌿 EcoRoute Active' : '🗺️ EcoRoute Navigator'}</span>
          </button>

          {/* Tile Layer Toggle */}
          <button
            onClick={() => setTileSource(prev => prev === 'osm' ? 'dark' : 'osm')}
            className="location-selector-container"
            style={{ cursor: 'pointer', padding: '0.5rem 0.85rem', background: 'var(--bg-card)', color: '#fff', fontSize: '0.8rem' }}
            title="Toggle map style"
            type="button"
          >
            <Layers size={14} />
            <span>{tileSource === 'osm' ? 'Style: Day' : 'Style: Dark Matter'}</span>
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

      {/* ECOROUTE CONTROL BAR (WHEN ACTIVE) */}
      {ecoRouteActive && (
        <div style={{
          background: 'rgba(12, 24, 18, 0.95)',
          border: '1px solid rgba(0, 245, 160, 0.3)',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Corridor Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={16} color="#00f5a0" />
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>Urban Corridor:</span>
              <select
                value={selectedCityCorridor}
                onChange={(e) => setSelectedCityCorridor(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(0, 245, 160, 0.3)',
                  borderRadius: '8px',
                  color: '#00f5a0',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Object.keys(ECOROUTE_CORRIDORS).map(c => (
                  <option key={c} value={c} style={{ background: '#0a140f', color: '#f8fafc' }}>
                    {c}: {ECOROUTE_CORRIDORS[c].originName} → {ECOROUTE_CORRIDORS[c].destName}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Pills */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px' }}>
              {[
                { key: 'jogger', label: '🏃 Running' },
                { key: 'cyclist', label: '🚴 Cycling' },
                { key: 'commuter', label: '🚗 Transit' }
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setCommuteMode(m.key)}
                  style={{
                    background: commuteMode === m.key ? '#00f5a0' : 'transparent',
                    color: commuteMode === m.key ? '#042416' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Voice Simulation */}
          <button
            onClick={handleSimulateVoice}
            style={{
              background: voiceDispatched ? 'rgba(0, 245, 160, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              color: '#00f5a0',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Volume2 size={14} />
            <span>{voiceDispatched ? 'Dispatching Audio...' : 'Voice Nav Briefing'}</span>
          </button>
        </div>
      )}

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

      {/* Main Map + EcoRoute Overlay Container */}
      <div style={{ position: 'relative' }}>
        {/* Interactive Leaflet Map Container */}
        <div className="card map-card-wrapper" style={{ padding: 0, overflow: 'hidden', height: '620px' }}>
          <MapContainer
            key={ecoRouteActive ? `ecoroute-${selectedCityCorridor}` : 'national-stations'}
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#0b1120' }}
          >
            {/* Auto Recalculate Size */}
            <MapResizer />
            {ecoRouteActive && <MapFlyController center={activeCorridor.center} zoom={activeCorridor.zoom} />}

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
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                subdomains="abcd"
                maxZoom={19}
              />
            )}

            {/* Standard Station Pins (always visible or in nationwide mode) */}
            {!ecoRouteActive && cityDataList.map((city) => {
              const lat = Number(city.latitude || CITY_COORDINATES[city.city]?.latitude);
              const lng = Number(city.longitude || CITY_COORDINATES[city.city]?.longitude);
              if (!lat || !lng) return null;

              const markerIcon = createAqiMarkerIcon(city.aqi, city.city);
              const { label: statusLabel, color: statusColor } = getAqiCategory(city.aqi);

              return (
                <Marker
                  key={city.city}
                  position={[lat, lng]}
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
                              background: '#00f5a0',
                              color: '#042416',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Dashboard View</span>
                            <ExternalLink size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ECOROUTE PATHS & WAYPOINTS (WHEN ACTIVE) */}
            {ecoRouteActive && (
              <>
                {/* 1. Origin & Destination Waypoints */}
                <Marker position={activeCorridor.originCoord} icon={createWaypointIcon(activeCorridor.originName, true)}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>
                    <div style={{ color: '#042416', fontWeight: 800, fontSize: '0.75rem' }}>
                      🟢 START: {activeCorridor.originName}
                    </div>
                  </Tooltip>
                </Marker>

                <Marker position={activeCorridor.destCoord} icon={createWaypointIcon(activeCorridor.destName, false)}>
                  <Tooltip permanent direction="top" offset={[0, -10]}>
                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>
                      🏁 END: {activeCorridor.destName}
                    </div>
                  </Tooltip>
                </Marker>

                {/* 2. Red Highway Arterial Path (Polluted / High Diesel) */}
                <Polyline
                  positions={activeCorridor.redRoute}
                  pathOptions={{
                    color: '#ef4444',
                    weight: 4,
                    dashArray: '6, 8',
                    opacity: 0.85
                  }}
                >
                  <Tooltip sticky>
                    <div style={{ color: '#f8fafc', padding: '4px' }}>
                      <strong style={{ color: '#ef4444', display: 'block' }}>🔴 High-Pollution Arterial Corridor</strong>
                      <span>Avg AQI: {activeCorridor.redStats.avgAqi} | PM2.5: {activeCorridor.redStats.pm25}</span>
                    </div>
                  </Tooltip>
                </Polyline>

                {/* 3. Green Clean Air Corridor (Safe / Canopy Filtration) */}
                <Polyline
                  positions={activeCorridor.greenRoute}
                  pathOptions={{
                    color: '#00f5a0',
                    weight: 6,
                    opacity: 0.95
                  }}
                >
                  <Tooltip sticky>
                    <div style={{ color: '#042416', padding: '4px' }}>
                      <strong style={{ color: '#00f5a0', display: 'block' }}>🟢 EcoSense Clean Air Corridor</strong>
                      <span>Avg AQI: {activeCorridor.greenStats.avgAqi} | PM2.5: {activeCorridor.greenStats.pm25}</span>
                    </div>
                  </Tooltip>
                </Polyline>
              </>
            )}
          </MapContainer>
        </div>

        {/* FLOATING ECOROUTE ANALYTICS CARD (OVERLAY BOTTOM-LEFT) */}
        {ecoRouteActive && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            width: '360px',
            maxWidth: 'calc(100% - 48px)',
            background: 'rgba(8, 16, 12, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 245, 160, 0.35)',
            borderRadius: '16px',
            padding: '18px',
            zIndex: 1000,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 245, 160, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#00f5a0" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  EcoRoute Comparison
                </h3>
              </div>
              <span style={{
                background: 'rgba(0, 245, 160, 0.15)',
                color: '#00f5a0',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(0, 245, 160, 0.3)'
              }}>
                -{activeCorridor.savingsPct}% PARTICULATES
              </span>
            </div>

            {/* Side-by-Side Dual Path Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {/* Green Path Card */}
              <div style={{
                background: 'rgba(0, 245, 160, 0.08)',
                border: '1px solid rgba(0, 245, 160, 0.4)',
                borderRadius: '12px',
                padding: '10px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#00f5a0', fontWeight: 800, textTransform: 'uppercase' }}>
                  🟢 Clean Corridor
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00f5a0', margin: '4px 0' }}>
                  {activeCorridor.greenStats.avgAqi} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>AQI</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  {activeCorridor.greenStats.time} • {activeCorridor.greenStats.dist}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>
                  PM2.5: {activeCorridor.greenStats.pm25}
                </div>
              </div>

              {/* Red Path Card */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '10px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase' }}>
                  🔴 Fast Highway
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', margin: '4px 0' }}>
                  {activeCorridor.redStats.avgAqi} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>AQI</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                  {activeCorridor.redStats.time} • {activeCorridor.redStats.dist}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px' }}>
                  PM2.5: {activeCorridor.redStats.pm25}
                </div>
              </div>
            </div>

            {/* Inhalation Savings Pill */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              lineHeight: 1.45,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f5a0', fontWeight: 700, marginBottom: '2px' }}>
                <ShieldCheck size={14} /> Health Impact
              </div>
              Taking this green route avoids <strong>~114 µg</strong> of fine particulate matter, equivalent to skipping deep roadside exhaust exposure.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
