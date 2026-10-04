/**
 * EcoSense Calculations & Environmental Health Scoring
 * 
 * Environmental Health Score (0 - 100):
 * Transparent rule-based index representing overall environmental quality.
 * Weighted:
 * - 60% Air Quality Index (AQI impact)
 * - 25% Fine Particulate Matter (PM2.5 & PM10 severity)
 * - 15% Meteorological Comfort (Temperature & Humidity extremity)
 */

export function calculateEnvironmentalScore(data) {
  if (!data) return { score: 0, status: 'Unknown', color: '#64748b', breakdown: null };

  const aqi = Number(data.aqi) || 0;
  const pm25 = Number(data.pm25) || 0;
  const pm10 = Number(data.pm10) || 0;
  const temp = Number(data.temperature) || 25;
  const humidity = Number(data.humidity) || 50;

  // 1. AQI Component (Base 60 points)
  // Optimal: 0-50 -> 55-60 pts. 51-100 -> 40-54 pts. 101-150 -> 25-39 pts. 151-200 -> 10-24 pts. >200 -> 0-9 pts.
  let aqiPoints = 60;
  if (aqi <= 50) {
    aqiPoints = 60 - (aqi / 50) * 8; // 52 - 60
  } else if (aqi <= 100) {
    aqiPoints = 52 - ((aqi - 50) / 50) * 14; // 38 - 52
  } else if (aqi <= 150) {
    aqiPoints = 38 - ((aqi - 100) / 50) * 14; // 24 - 38
  } else if (aqi <= 200) {
    aqiPoints = 24 - ((aqi - 150) / 50) * 14; // 10 - 24
  } else {
    aqiPoints = Math.max(0, 10 - ((aqi - 200) / 100) * 8); // 2 - 10
  }

  // 2. Particulates Component (Base 25 points)
  let pmPoints = 25;
  if (pm25 > 60 || pm10 > 100) {
    pmPoints -= 12;
  } else if (pm25 > 35 || pm10 > 70) {
    pmPoints -= 6;
  }

  // 3. Meteorological Comfort Component (Base 15 points)
  let weatherPoints = 15;
  // Penalty for extreme heat (>38°C) or extreme cold (<10°C)
  if (temp > 38 || temp < 8) {
    weatherPoints -= 6;
  } else if (temp > 33 || temp < 14) {
    weatherPoints -= 3;
  }
  // Penalty for extreme humidity (>80% or <20%)
  if (humidity > 80 || humidity < 20) {
    weatherPoints -= 4;
  } else if (humidity > 70 || humidity < 30) {
    weatherPoints -= 2;
  }

  const rawScore = Math.round(Math.max(5, Math.min(100, aqiPoints + pmPoints + weatherPoints)));

  let status = 'Good';
  let color = '#10b981';
  let description = 'Healthy atmospheric conditions with minimal environmental stress.';

  if (rawScore >= 85) {
    status = 'Optimal';
    color = '#10b981';
    description = 'Exceptional atmospheric balance and low environmental impact.';
  } else if (rawScore >= 70) {
    status = 'Favorable';
    color = '#38bdf8';
    description = 'Standard acceptable environmental parameters with gentle comfort.';
  } else if (rawScore >= 50) {
    status = 'Moderate';
    color = '#fbbf24';
    description = 'Mild pollution or weather discomfort detected; acceptable for most.';
  } else if (rawScore >= 35) {
    status = 'Poor';
    color = '#f97316';
    description = 'Elevated contaminants or weather extremes impacting outdoor wellness.';
  } else {
    status = 'Critical';
    color = '#ef4444';
    description = 'Severe environmental degradation. Extended exposure not advised.';
  }

  return {
    score: rawScore,
    status,
    color,
    description,
    breakdown: {
      aqiContribution: Math.round(aqiPoints),
      particulateContribution: Math.round(pmPoints),
      weatherContribution: Math.round(weatherPoints)
    }
  };
}

export function getAqiCategory(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 50) return { label: 'Good', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  if (val <= 100) return { label: 'Moderate', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
  if (val <= 150) return { label: 'Sensitive Groups', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
  if (val <= 200) return { label: 'Unhealthy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  if (val <= 300) return { label: 'Very Unhealthy', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
  return { label: 'Hazardous', color: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.25)' };
}
