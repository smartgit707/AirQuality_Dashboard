/**
 * Frontend Mock Data & Environmental Status Evaluators
 * Provides mock data for 5 Indian cities and utility functions for AQI grading
 */

export const mockCityData = {
  Chennai: {
    city: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    aqi: 78,
    temperature: 29,
    humidity: 68,
    pm25: 34,
    pm10: 61,
    co2: 520,
    co: 0.8,
    no2: 24,
    so2: 8,
    o3: 42,
    windSpeed: 14,
    pressure: 1008,
    lastUpdated: "5 min ago",
    trend: [
      { time: "8 AM", aqi: 62 },
      { time: "10 AM", aqi: 68 },
      { time: "12 PM", aqi: 75 },
      { time: "2 PM", aqi: 81 },
      { time: "4 PM", aqi: 78 },
      { time: "6 PM", aqi: 72 }
    ]
  },
  Delhi: {
    city: "Delhi",
    state: "National Capital Region",
    latitude: 28.6139,
    longitude: 77.2090,
    aqi: 215,
    temperature: 24,
    humidity: 45,
    pm25: 165,
    pm10: 240,
    co2: 680,
    co: 2.4,
    no2: 78,
    so2: 22,
    o3: 65,
    windSpeed: 6,
    pressure: 1012,
    lastUpdated: "2 min ago",
    trend: [
      { time: "8 AM", aqi: 195 },
      { time: "10 AM", aqi: 205 },
      { time: "12 PM", aqi: 220 },
      { time: "2 PM", aqi: 235 },
      { time: "4 PM", aqi: 215 },
      { time: "6 PM", aqi: 225 }
    ]
  },
  Mumbai: {
    city: "Mumbai",
    state: "Maharashtra",
    latitude: 19.0760,
    longitude: 72.8777,
    aqi: 118,
    temperature: 31,
    humidity: 75,
    pm25: 58,
    pm10: 105,
    co2: 560,
    co: 1.2,
    no2: 44,
    so2: 14,
    o3: 38,
    windSpeed: 16,
    pressure: 1010,
    lastUpdated: "8 min ago",
    trend: [
      { time: "8 AM", aqi: 95 },
      { time: "10 AM", aqi: 105 },
      { time: "12 PM", aqi: 112 },
      { time: "2 PM", aqi: 125 },
      { time: "4 PM", aqi: 118 },
      { time: "6 PM", aqi: 110 }
    ]
  },
  Bengaluru: {
    city: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    aqi: 42,
    temperature: 23,
    humidity: 60,
    pm25: 18,
    pm10: 36,
    co2: 430,
    co: 0.4,
    no2: 15,
    so2: 5,
    o3: 28,
    windSpeed: 11,
    pressure: 915,
    lastUpdated: "3 min ago",
    trend: [
      { time: "8 AM", aqi: 35 },
      { time: "10 AM", aqi: 38 },
      { time: "12 PM", aqi: 45 },
      { time: "2 PM", aqi: 48 },
      { time: "4 PM", aqi: 42 },
      { time: "6 PM", aqi: 39 }
    ]
  },
  Hyderabad: {
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.3850,
    longitude: 78.4867,
    aqi: 88,
    temperature: 28,
    humidity: 58,
    pm25: 41,
    pm10: 72,
    co2: 495,
    co: 0.9,
    no2: 30,
    so2: 10,
    o3: 35,
    windSpeed: 9,
    pressure: 960,
    lastUpdated: "12 min ago",
    trend: [
      { time: "8 AM", aqi: 72 },
      { time: "10 AM", aqi: 79 },
      { time: "12 PM", aqi: 85 },
      { time: "2 PM", aqi: 92 },
      { time: "4 PM", aqi: 88 },
      { time: "6 PM", aqi: 82 }
    ]
  },
  Kolkata: {
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
    latitude: 22.5726,
    longitude: 88.3639,
    aqi: 142,
    temperature: 29,
    humidity: 78,
    pm25: 78,
    pm10: 135,
    co2: 590,
    co: 1.4,
    no2: 48,
    so2: 16,
    o3: 32,
    windSpeed: 8,
    windDirection: "SSE",
    pressure: 1009,
    visibility: 4.8,
    lastUpdated: "6 min ago",
    trend: [
      { time: "8 AM", aqi: 120 },
      { time: "10 AM", aqi: 132 },
      { time: "12 PM", aqi: 140 },
      { time: "2 PM", aqi: 152 },
      { time: "4 PM", aqi: 145 },
      { time: "6 PM", aqi: 142 }
    ]
  },
  Pune: {
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    latitude: 18.5204,
    longitude: 73.8567,
    aqi: 65,
    temperature: 27,
    humidity: 62,
    pm25: 28,
    pm10: 52,
    co2: 470,
    co: 0.6,
    no2: 22,
    so2: 7,
    o3: 36,
    windSpeed: 12,
    windDirection: "WNW",
    pressure: 948,
    visibility: 8.5,
    lastUpdated: "9 min ago",
    trend: [
      { time: "8 AM", aqi: 55 },
      { time: "10 AM", aqi: 60 },
      { time: "12 PM", aqi: 68 },
      { time: "2 PM", aqi: 72 },
      { time: "4 PM", aqi: 66 },
      { time: "6 PM", aqi: 65 }
    ]
  },
  Ahmedabad: {
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    latitude: 23.0225,
    longitude: 72.5714,
    aqi: 136,
    temperature: 32,
    humidity: 50,
    pm25: 72,
    pm10: 124,
    co2: 560,
    co: 1.3,
    no2: 46,
    so2: 18,
    o3: 40,
    windSpeed: 10,
    windDirection: "NW",
    pressure: 1006,
    visibility: 6.0,
    lastUpdated: "11 min ago",
    trend: [
      { time: "8 AM", aqi: 115 },
      { time: "10 AM", aqi: 128 },
      { time: "12 PM", aqi: 142 },
      { time: "2 PM", aqi: 148 },
      { time: "4 PM", aqi: 139 },
      { time: "6 PM", aqi: 136 }
    ]
  },
  Jaipur: {
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    latitude: 26.9124,
    longitude: 75.7873,
    aqi: 128,
    temperature: 30,
    humidity: 42,
    pm25: 64,
    pm10: 118,
    co2: 530,
    co: 1.1,
    no2: 38,
    so2: 12,
    o3: 44,
    windSpeed: 9,
    windDirection: "NE",
    pressure: 968,
    visibility: 6.5,
    lastUpdated: "4 min ago",
    trend: [
      { time: "8 AM", aqi: 110 },
      { time: "10 AM", aqi: 120 },
      { time: "12 PM", aqi: 135 },
      { time: "2 PM", aqi: 140 },
      { time: "4 PM", aqi: 130 },
      { time: "6 PM", aqi: 128 }
    ]
  },
  Lucknow: {
    city: "Lucknow",
    state: "Uttar Pradesh",
    country: "India",
    latitude: 26.8467,
    longitude: 80.9462,
    aqi: 178,
    temperature: 26,
    humidity: 58,
    pm25: 112,
    pm10: 185,
    co2: 640,
    co: 1.9,
    no2: 62,
    so2: 19,
    o3: 52,
    windSpeed: 7,
    windDirection: "E",
    pressure: 998,
    visibility: 4.0,
    lastUpdated: "7 min ago",
    trend: [
      { time: "8 AM", aqi: 155 },
      { time: "10 AM", aqi: 170 },
      { time: "12 PM", aqi: 185 },
      { time: "2 PM", aqi: 192 },
      { time: "4 PM", aqi: 180 },
      { time: "6 PM", aqi: 178 }
    ]
  },
  Chandigarh: {
    city: "Chandigarh",
    state: "Punjab & Haryana",
    country: "India",
    latitude: 30.7333,
    longitude: 76.7794,
    aqi: 72,
    temperature: 25,
    humidity: 52,
    pm25: 32,
    pm10: 64,
    co2: 480,
    co: 0.7,
    no2: 26,
    so2: 8,
    o3: 38,
    windSpeed: 8,
    windDirection: "NW",
    pressure: 978,
    visibility: 8.0,
    lastUpdated: "14 min ago",
    trend: [
      { time: "8 AM", aqi: 60 },
      { time: "10 AM", aqi: 68 },
      { time: "12 PM", aqi: 75 },
      { time: "2 PM", aqi: 80 },
      { time: "4 PM", aqi: 74 },
      { time: "6 PM", aqi: 72 }
    ]
  },
  Kochi: {
    city: "Kochi",
    state: "Kerala",
    country: "India",
    latitude: 9.9312,
    longitude: 76.2673,
    aqi: 38,
    temperature: 30,
    humidity: 82,
    pm25: 16,
    pm10: 32,
    co2: 420,
    co: 0.3,
    no2: 14,
    so2: 4,
    o3: 24,
    windSpeed: 16,
    windDirection: "WSW",
    pressure: 1010,
    visibility: 9.5,
    lastUpdated: "10 min ago",
    trend: [
      { time: "8 AM", aqi: 32 },
      { time: "10 AM", aqi: 35 },
      { time: "12 PM", aqi: 40 },
      { time: "2 PM", aqi: 44 },
      { time: "4 PM", aqi: 39 },
      { time: "6 PM", aqi: 38 }
    ]
  },
  Patna: {
    city: "Patna",
    state: "Bihar",
    country: "India",
    latitude: 25.5941,
    longitude: 85.1376,
    aqi: 195,
    temperature: 27,
    humidity: 65,
    pm25: 135,
    pm10: 210,
    co2: 670,
    co: 2.1,
    no2: 70,
    so2: 21,
    o3: 58,
    windSpeed: 5,
    windDirection: "ENE",
    pressure: 1004,
    visibility: 3.5,
    lastUpdated: "5 min ago",
    trend: [
      { time: "8 AM", aqi: 175 },
      { time: "10 AM", aqi: 190 },
      { time: "12 PM", aqi: 205 },
      { time: "2 PM", aqi: 215 },
      { time: "4 PM", aqi: 198 },
      { time: "6 PM", aqi: 195 }
    ]
  },
  London: {
    city: "London",
    state: "England",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
    aqi: 34,
    temperature: 15,
    humidity: 70,
    pm25: 12,
    pm10: 22,
    co2: 415,
    co: 0.3,
    no2: 24,
    so2: 4,
    o3: 36,
    windSpeed: 18,
    windDirection: "SW",
    pressure: 1015,
    visibility: 10.0,
    lastUpdated: "8 min ago",
    trend: [
      { time: "8 AM", aqi: 28 },
      { time: "10 AM", aqi: 32 },
      { time: "12 PM", aqi: 36 },
      { time: "2 PM", aqi: 38 },
      { time: "4 PM", aqi: 35 },
      { time: "6 PM", aqi: 34 }
    ]
  },
  "New York": {
    city: "New York",
    state: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.0060,
    aqi: 45,
    temperature: 18,
    humidity: 55,
    pm25: 16,
    pm10: 28,
    co2: 425,
    co: 0.4,
    no2: 28,
    so2: 5,
    o3: 42,
    windSpeed: 15,
    windDirection: "WNW",
    pressure: 1016,
    visibility: 10.0,
    lastUpdated: "12 min ago",
    trend: [
      { time: "8 AM", aqi: 38 },
      { time: "10 AM", aqi: 42 },
      { time: "12 PM", aqi: 48 },
      { time: "2 PM", aqi: 50 },
      { time: "4 PM", aqi: 46 },
      { time: "6 PM", aqi: 45 }
    ]
  },
  Tokyo: {
    city: "Tokyo",
    state: "Kanto",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    aqi: 29,
    temperature: 20,
    humidity: 60,
    pm25: 10,
    pm10: 18,
    co2: 410,
    co: 0.2,
    no2: 20,
    so2: 3,
    o3: 34,
    windSpeed: 12,
    windDirection: "SSE",
    pressure: 1013,
    visibility: 10.0,
    lastUpdated: "15 min ago",
    trend: [
      { time: "8 AM", aqi: 24 },
      { time: "10 AM", aqi: 28 },
      { time: "12 PM", aqi: 31 },
      { time: "2 PM", aqi: 33 },
      { time: "4 PM", aqi: 30 },
      { time: "6 PM", aqi: 29 }
    ]
  },
  Paris: {
    city: "Paris",
    state: "Île-de-France",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    aqi: 36,
    temperature: 17,
    humidity: 64,
    pm25: 14,
    pm10: 24,
    co2: 418,
    co: 0.3,
    no2: 25,
    so2: 4,
    o3: 38,
    windSpeed: 14,
    windDirection: "SW",
    pressure: 1014,
    visibility: 10.0,
    lastUpdated: "18 min ago",
    trend: [
      { time: "8 AM", aqi: 30 },
      { time: "10 AM", aqi: 34 },
      { time: "12 PM", aqi: 38 },
      { time: "2 PM", aqi: 40 },
      { time: "4 PM", aqi: 37 },
      { time: "6 PM", aqi: 36 }
    ]
  },
  Dubai: {
    city: "Dubai",
    state: "Dubai",
    country: "United Arab Emirates",
    latitude: 25.2048,
    longitude: 55.2708,
    aqi: 112,
    temperature: 36,
    humidity: 48,
    pm25: 55,
    pm10: 145,
    co2: 540,
    co: 0.9,
    no2: 35,
    so2: 14,
    o3: 46,
    windSpeed: 20,
    windDirection: "NW",
    pressure: 1008,
    visibility: 7.0,
    lastUpdated: "9 min ago",
    trend: [
      { time: "8 AM", aqi: 95 },
      { time: "10 AM", aqi: 105 },
      { time: "12 PM", aqi: 118 },
      { time: "2 PM", aqi: 124 },
      { time: "4 PM", aqi: 116 },
      { time: "6 PM", aqi: 112 }
    ]
  }
};

export const CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Patna",
  "London",
  "New York",
  "Tokyo",
  "Paris",
  "Dubai"
];

/**
 * Evaluates AQI according to Indian National Air Quality Index (NAQI) standards
 */
export function getAQIStatus(aqi) {
  if (aqi <= 50) {
    return {
      label: "Good",
      category: "good",
      color: "#10b981", // green
      badgeBg: "rgba(16, 185, 129, 0.12)",
      badgeBorder: "rgba(16, 185, 129, 0.3)",
      description: "Air quality is satisfactory; air pollution poses little or no risk.",
      healthAdvice: "Great day for outdoor activities, exercising, and opening windows."
    };
  } else if (aqi <= 100) {
    return {
      label: "Moderate",
      category: "moderate",
      color: "#eab308", // yellow/amber
      badgeBg: "rgba(234, 179, 8, 0.12)",
      badgeBorder: "rgba(234, 179, 8, 0.3)",
      description: "Air quality is acceptable; may cause minor discomfort to sensitive people.",
      healthAdvice: "Sensitive groups (asthma, children) should monitor exertion outdoors."
    };
  } else if (aqi <= 150) {
    return {
      label: "Sensitive Groups",
      category: "sensitive",
      color: "#f97316", // orange
      badgeBg: "rgba(249, 115, 22, 0.12)",
      badgeBorder: "rgba(249, 115, 22, 0.3)",
      description: "Members of sensitive groups may experience health effects.",
      healthAdvice: "Children, elderly, and lung/heart patients should reduce outdoor exertion."
    };
  } else if (aqi <= 200) {
    return {
      label: "Unhealthy",
      category: "unhealthy",
      color: "#ef4444", // red
      badgeBg: "rgba(239, 68, 68, 0.12)",
      badgeBorder: "rgba(239, 68, 68, 0.3)",
      description: "Everyone may begin to experience adverse health effects.",
      healthAdvice: "Wear an N95 mask outdoors, avoid prolonged physical exertion."
    };
  } else {
    return {
      label: "Very Unhealthy",
      category: "hazardous",
      color: "#8b5cf6", // purple
      badgeBg: "rgba(139, 92, 246, 0.15)",
      badgeBorder: "rgba(139, 92, 246, 0.35)",
      description: "Health warning: emergency conditions; everyone is affected.",
      healthAdvice: "Remain indoors, run air purifiers, seal windows and doors."
    };
  }
}

export function getPollutantStatus(type, value) {
  if (value === null || value === undefined || isNaN(value)) {
    return { 
      label: "Unavailable", 
      color: "#94a3b8", 
      bg: "rgba(148, 163, 184, 0.12)",
      isUnavailable: true 
    };
  }

  // Approximate standard thresholds
  const thresholds = {
    pm25: { good: 30, moderate: 60 },
    pm10: { good: 50, moderate: 100 },
    co: { good: 1.0, moderate: 2.0 },
    no2: { good: 40, moderate: 80 },
    so2: { good: 20, moderate: 50 },
    o3: { good: 50, moderate: 100 }
  };

  const limit = thresholds[type] || { good: 50, moderate: 100 };

  if (value <= limit.good) {
    return { label: "Good", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", isUnavailable: false };
  } else if (value <= limit.moderate) {
    return { label: "Moderate", color: "#eab308", bg: "rgba(234, 179, 8, 0.12)", isUnavailable: false };
  } else {
    return { label: "High", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", isUnavailable: false };
  }
}

/**
 * Returns sorted rankings from available city data
 * @param {'polluted'|'cleanest'} mode
 * @param {'all'|'india'|'world'} filter
 */
export function getLiveCityRankings(mode = 'polluted', filter = 'all') {
  let list = Object.values(mockCityData);
  
  if (filter === 'india') {
    list = list.filter(c => !c.country || c.country === 'India');
  } else if (filter === 'world') {
    list = list.filter(c => c.country && c.country !== 'India');
  }

  // Sort by AQI
  list.sort((a, b) => {
    return mode === 'polluted' ? b.aqi - a.aqi : a.aqi - b.aqi;
  });

  return list.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    status: getAQIStatus(item.aqi)
  }));
}

