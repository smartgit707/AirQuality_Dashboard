import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, Compass, X, Sparkles } from 'lucide-react';
import { mockCityData, CITIES, getAQIStatus } from '../data/mockData';

export default function LocationSearch({ 
  currentCity, 
  onCityChange, 
  variant = 'banner', // 'banner' (large homepage style) | 'compact' (navbar style)
  disabled = false 
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const containerRef = useRef(null);

  // Close suggestions when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on query matching city name, state, or country
  const filteredCities = CITIES.map(name => mockCityData[name] || { city: name, state: '', country: 'India', aqi: 75 })
    .filter(item => {
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      const matchCity = item.city.toLowerCase().includes(q);
      const matchState = (item.state || '').toLowerCase().includes(q);
      const matchCountry = (item.country || 'India').toLowerCase().includes(q);
      return matchCity || matchState || matchCountry;
    });

  const handleSelectCity = (cityName) => {
    onCityChange(cityName);
    setQuery('');
    setIsOpen(false);
    setLocationError(null);
  };

  // Browser Geolocation API handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Find nearest city from known list using Euclidean distance approximation
        let closestCity = CITIES[0];
        let minDistance = Infinity;

        CITIES.forEach((cityName) => {
          const c = mockCityData[cityName];
          if (c && c.latitude && c.longitude) {
            const dist = Math.hypot(c.latitude - userLat, c.longitude - userLng);
            if (dist < minDistance) {
              minDistance = dist;
              closestCity = cityName;
            }
          }
        });

        handleSelectCity(closestCity);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback gracefully without breaking
        setLocationError('Could not detect location. Selected closest default.');
        setTimeout(() => setLocationError(null), 4000);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const isBanner = variant === 'banner';

  return (
    <div 
      ref={containerRef}
      className={`location-search-wrapper ${isBanner ? 'location-search-banner' : 'location-search-compact'}`}
      style={{ position: 'relative', width: isBanner ? '100%' : 'auto' }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card, rgba(10, 20, 15, 0.85))',
          border: isBanner ? '1px solid var(--accent-cyan, rgba(0, 245, 160, 0.28))' : '1px solid var(--border-color)',
          borderRadius: isBanner ? '16px' : '10px',
          padding: isBanner ? '10px 16px' : '6px 12px',
          boxShadow: isBanner ? 'var(--shadow-card)' : 'none',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.25s ease'
        }}
      >
        <Search 
          size={isBanner ? 20 : 15} 
          style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} 
        />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder={isBanner ? "Search city, state, country or region (e.g. Chennai, Delhi, London)..." : "Search location..."}
          aria-label="Search air quality monitoring location"
          className="location-search-input"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: isBanner ? '0.98rem' : '0.85rem',
            width: isBanner ? '100%' : '180px',
            fontFamily: 'inherit'
          }}
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            type="button"
            title="Clear search"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        )}

        {/* Use My Location Quick Button */}
        {isBanner && (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={disabled || isLocating}
            title="Detect nearby monitoring station via browser geolocation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%)',
              border: '1px solid rgba(0, 245, 160, 0.35)',
              color: '#00f5a0',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: disabled || isLocating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 15px rgba(0, 245, 160, 0.15)'
            }}
          >
            <Navigation size={14} className={isLocating ? 'spin' : ''} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        )}
      </div>

      {/* Geolocation feedback alert */}
      {locationError && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#fca5a5',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.78rem',
          zIndex: 60
        }}>
          {locationError}
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          className="location-search-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary, #ffffff)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(20px)',
            zIndex: 100,
            maxHeight: '340px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {query.trim() ? `Matching Stations (${filteredCities.length})` : 'Popular Monitoring Hubs'}
          </div>

          {filteredCities.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No monitoring station matched "{query}". Try Chennai, Delhi, Mumbai, Bengaluru...
            </div>
          ) : (
            filteredCities.map((item) => {
              const aqiStatus = getAQIStatus(item.aqi || 50);
              const isSelected = item.city.toLowerCase() === currentCity.toLowerCase();

              return (
                <div
                  key={item.city}
                  onClick={() => handleSelectCity(item.city)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(0, 245, 160, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(0, 245, 160, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover, rgba(255, 255, 255, 0.05))';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--bg-card-hover, rgba(255, 255, 255, 0.06))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)'
                    }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {item.city}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {item.state ? `${item.state}, ` : ''}{item.country || 'India'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AQI</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: aqiStatus.color }}>
                        {item.aqi || '--'}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: aqiStatus.badgeBg,
                        color: aqiStatus.color,
                        border: `1px solid ${aqiStatus.badgeBorder}`
                      }}
                    >
                      {aqiStatus.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
