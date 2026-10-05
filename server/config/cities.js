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
  },
  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    elevation: 9
  },
  pune: {
    name: "Pune",
    state: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    elevation: 560
  },
  ahmedabad: {
    name: "Ahmedabad",
    state: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    elevation: 53
  },
  jaipur: {
    name: "Jaipur",
    state: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    elevation: 431
  },
  lucknow: {
    name: "Lucknow",
    state: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
    elevation: 123
  },
  chandigarh: {
    name: "Chandigarh",
    state: "Punjab & Haryana",
    latitude: 30.7333,
    longitude: 76.7794,
    elevation: 321
  },
  kochi: {
    name: "Kochi",
    state: "Kerala",
    latitude: 9.9312,
    longitude: 76.2673,
    elevation: 4
  },
  patna: {
    name: "Patna",
    state: "Bihar",
    latitude: 25.5941,
    longitude: 85.1376,
    elevation: 53
  },
  london: {
    name: "London",
    state: "England",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
    elevation: 35
  },
  newyork: {
    name: "New York",
    state: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.0060,
    elevation: 10
  },
  tokyo: {
    name: "Tokyo",
    state: "Kanto",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    elevation: 40
  },
  paris: {
    name: "Paris",
    state: "Île-de-France",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    elevation: 35
  },
  dubai: {
    name: "Dubai",
    state: "Dubai",
    country: "United Arab Emirates",
    latitude: 25.2048,
    longitude: 55.2708,
    elevation: 16
  }
};

/**
 * Helper to retrieve city configuration case-insensitively
 */
function getCityConfig(cityName) {
  if (!cityName) return null;
  const rawKey = cityName.trim().toLowerCase();
  const strippedKey = rawKey.replace(/[\s_-]+/g, '');
  return cities[rawKey] || cities[strippedKey] || Object.values(cities).find(c => c.name.toLowerCase() === rawKey || c.name.toLowerCase().replace(/[\s_-]+/g, '') === strippedKey) || null;
}

module.exports = {
  cities,
  getCityConfig,
  supportedCityNames: Object.values(cities).map(c => c.name)
};
