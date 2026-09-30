/**
 * City Coordinates Configuration for Open-Meteo Integration
 * Latitude and Longitude definitions for Indian metropolitan monitoring stations
 */

const cities = {
  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    elevation: 6
  },
  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    latitude: 17.3850,
    longitude: 78.4867,
    elevation: 542
  },
  delhi: {
    name: "Delhi",
    state: "National Capital Region",
    latitude: 28.6139,
    longitude: 77.2090,
    elevation: 216
  },
  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    elevation: 14
  },
  bengaluru: {
    name: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    elevation: 920
  }
};

/**
 * Helper to retrieve city configuration case-insensitively
 */
function getCityConfig(cityName) {
  if (!cityName) return null;
  const key = cityName.trim().toLowerCase();
  return cities[key] || null;
}

module.exports = {
  cities,
  getCityConfig,
  supportedCityNames: Object.values(cities).map(c => c.name)
};
