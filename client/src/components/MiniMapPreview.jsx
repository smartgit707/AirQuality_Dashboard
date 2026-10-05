import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import { getAqiCategory } from '../utils/calculations';

// Coordinates for primary metropolitan stations
const CITY_COORDS = {
  Delhi: [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.3850, 78.4867],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Chandigarh: [30.7333, 76.7794],
  Kochi: [9.9312, 76.2673],
  Patna: [25.5941, 85.1376],
  London: [51.5074, -0.1278],
  'New York': [40.7128, -74.0060],
  Tokyo: [35.6762, 139.6503],
  Paris: [48.8566, 2.3522],
  Dubai: [25.2048, 55.2708]
};

// Hub baseline AQIs for immediate display
const METRO_HUBS = [
  { name: 'Delhi', aqi: 245 },
  { name: 'Mumbai', aqi: 95 },
  { name: 'Bengaluru', aqi: 62 },
  { name: 'Chennai', aqi: 78 },
  { name: 'Hyderabad', aqi: 112 },
  { name: 'Kolkata', aqi: 168 },
  { name: 'Pune', aqi: 88 },
  { name: 'Ahmedabad', aqi: 154 }
];

export default function MiniMapPreview({ currentCity = 'Delhi', currentAqi = 150, onNavigate, onCityChange }) {
  const currentCoords = CITY_COORDS[currentCity] || CITY_COORDS['Delhi'];

  const createIcon = (aqi, isCurrent) => {
    const { color } = getAqiCategory(aqi);
    const borderStyle = isCurrent ? `3px solid #ffffff` : `2px solid rgba(255,255,255,0.7)`;
    const ringAnimation = isCurrent ? 'box-shadow: 0 0 16px rgba(0,245,160,0.8), 0 0 24px rgba(0,245,160,0.5);' : `box-shadow: 0 0 8px ${color}88;`;

    return L.divIcon({
      className: 'custom-mini-map-marker',
      html: `
        <div style="
          background: ${color};
          color: #03150d;
          font-weight: 900;
          font-size: 11px;
          padding: 3px 7px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 3px;
          border: ${borderStyle};
          ${ringAnimation}
          transform: translate(-50%, -50%);
          white-space: nowrap;
          cursor: pointer;
        ">
          <span>${aqi}</span>
        </div>
      `,
      iconSize: [36, 20],
      iconAnchor: [18, 10]
    });
  };

  return (
    <section 
      className="mini-map-preview-card"
      style={{
        background: 'rgba(12, 24, 18, 0.72)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '2.5rem',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} style={{ color: '#00f5a0' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Regional Air Quality Map Preview
            </h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Geospatial dispersion surrounding {currentCity} &bull; Click any station or launch full navigation
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('map')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)',
              border: 'none',
              color: '#022013',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 245, 160, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Navigation size={14} />
            <span>Open Full Interactive Map</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Map Container */}
      <div 
        style={{ 
          height: '240px', 
          width: '100%', 
          borderRadius: '14px', 
          overflow: 'hidden', 
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}
      >
        <MapContainer
          key={`mini-map-${currentCity}`}
          center={currentCoords}
          zoom={5}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%', background: '#09130e' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
            subdomains="abcd"
          />

          {/* Current City Highlight Marker */}
          <Marker
            position={currentCoords}
            icon={createIcon(currentAqi, true)}
          >
            <Popup>
              <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>
                {currentCity}: {currentAqi} AQI (Current Selection)
              </div>
            </Popup>
          </Marker>

          {/* Surrounding Major Hub Markers */}
          {METRO_HUBS.map((hub) => {
            if (hub.name.toLowerCase() === currentCity.toLowerCase()) return null;
            const coords = CITY_COORDS[hub.name];
            if (!coords) return null;

            return (
              <Marker
                key={hub.name}
                position={coords}
                icon={createIcon(hub.aqi, false)}
                eventHandlers={{
                  click: () => {
                    if (onCityChange) onCityChange(hub.name);
                  }
                }}
              >
                <Popup>
                  <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>
                    {hub.name}: {hub.aqi} AQI
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Quick Map Floating Badge */}
        <div 
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 1000,
            background: 'rgba(10, 20, 16, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            color: '#cbd5e1'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5a0', display: 'inline-block' }} />
          <span>Centered on <strong>{currentCity}</strong> &bull; EcoRoute enabled</span>
        </div>
      </div>
    </section>
  );
}
