import React from 'react';
import { MapPin } from 'lucide-react';
import { CITIES } from '../data/mockData';

export default function LocationSelector({ currentCity, onCityChange, disabled }) {
  return (
    <div className="location-selector-container">
      <MapPin size={18} className="location-icon" />
      <select 
        value={currentCity} 
        onChange={(e) => onCityChange(e.target.value)}
        disabled={disabled}
        className="city-select"
        aria-label="Select monitoring location"
      >
        {CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
}
