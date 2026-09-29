/**
 * Frontend Mock Data & Environmental Status Evaluators
 * Provides mock data for 5 Indian cities and utility functions for AQI grading
 */

export const mockCityData = {
  Chennai: {
    city: "Chennai",
    state: "Tamil Nadu",
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
  }
};

export const CITIES = ["Chennai", "Hyderabad", "Delhi", "Mumbai", "Bengaluru"];

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

/**
 * Returns pollutant status (Good / Moderate / High)
 */
export function getPollutantStatus(type, value) {
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
    return { label: "Good", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" };
  } else if (value <= limit.moderate) {
    return { label: "Moderate", color: "#eab308", bg: "rgba(234, 179, 8, 0.12)" };
  } else {
    return { label: "High", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" };
  }
}
