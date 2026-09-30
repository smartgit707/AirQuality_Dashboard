/**
 * Open-Meteo External API Integration Service
 * Fetches real-time criteria air pollutants and meteorological observations
 */

/**
 * Standard EPA AQI Piecewise Linear Calculation from PM2.5 concentration (µg/m³)
 */
function calculateAQIFromPM25(pm25) {
  if (pm25 == null || isNaN(pm25)) return 50;

  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
    { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 }
  ];

  const bp = breakpoints.find(b => pm25 >= b.cLow && pm25 <= b.cHigh) || 
    (pm25 > 500 ? { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 } : breakpoints[0]);

  const aqi = Math.round(
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow
  );

  return Math.max(1, Math.min(500, aqi));
}

/**
 * Format ISO datetime string to display hour (e.g., "8 AM", "2 PM")
 */
function formatHour(isoString) {
  try {
    const d = new Date(isoString);
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours} ${ampm}`;
  } catch (_) {
    return isoString;
  }
}

/**
 * Fetch real air quality and meteorological data for given coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>}
 */
async function fetchRealEnvironmentalData(latitude, longitude) {
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&hourly=us_aqi,pm2_5,pm10&past_days=1&forecast_days=0`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m`;

  const timeoutSignal = AbortSignal.timeout(9000);

  // Parallel fetch to Open-Meteo Air Quality and Weather Forecast APIs
  const [aqResponse, weatherResponse] = await Promise.all([
    fetch(airQualityUrl, { signal: timeoutSignal }),
    fetch(weatherUrl, { signal: timeoutSignal })
  ]);

  if (!aqResponse.ok) {
    throw new Error(`Open-Meteo Air Quality API responded with HTTP ${aqResponse.status}`);
  }
  if (!weatherResponse.ok) {
    throw new Error(`Open-Meteo Weather API responded with HTTP ${weatherResponse.status}`);
  }

  const aqData = await aqResponse.json();
  const weatherData = await weatherResponse.json();

  if (!aqData || !aqData.current) {
    throw new Error("Empty or malformed payload from Open-Meteo Air Quality API");
  }

  const currentAq = aqData.current;
  const currentWeather = weatherData.current || {};

  // Extract raw pollutant values
  const rawPm25 = Number(currentAq.pm2_5) || 0;
  const rawPm10 = Number(currentAq.pm10) || 0;
  const rawCo = Number(currentAq.carbon_monoxide) || 0; // reported in µg/m³
  const rawNo2 = Number(currentAq.nitrogen_dioxide) || 0;
  const rawSo2 = Number(currentAq.sulphur_dioxide) || 0;
  const rawO3 = Number(currentAq.ozone) || 0;

  // Determine official AQI: prefer direct Open-Meteo us_aqi; fallback to PM2.5 calculation
  let computedAqi = Math.round(Number(currentAq.us_aqi));
  if (isNaN(computedAqi) || computedAqi <= 0) {
    computedAqi = calculateAQIFromPM25(rawPm25);
  }

  // Convert CO from µg/m³ to standard mg/m³ for presentation (e.g. 350 µg/m³ -> 0.35 mg/m³)
  const coMgM3 = parseFloat((rawCo / 1000).toFixed(2));

  // Meteorological parameters
  const temperature = currentWeather.temperature_2m != null 
    ? parseFloat(Number(currentWeather.temperature_2m).toFixed(1)) 
    : 28.0;
  const humidity = currentWeather.relative_humidity_2m != null 
    ? Math.round(Number(currentWeather.relative_humidity_2m)) 
    : 65;
  const windSpeed = currentWeather.wind_speed_10m != null 
    ? parseFloat(Number(currentWeather.wind_speed_10m).toFixed(1)) 
    : 10.0;
  const pressure = currentWeather.surface_pressure != null 
    ? Math.round(Number(currentWeather.surface_pressure)) 
    : 1010;

  // Process historical readings from Open-Meteo hourly array for chart preloading
  const recentHourly = [];
  if (aqData.hourly && Array.isArray(aqData.hourly.time)) {
    const times = aqData.hourly.time;
    const aqis = aqData.hourly.us_aqi || [];
    const pm25s = aqData.hourly.pm2_5 || [];
    const pm10s = aqData.hourly.pm10 || [];

    // Take the last 6 observations to give a 12h-24h trend progression
    const totalPoints = times.length;
    const step = Math.max(1, Math.floor(totalPoints / 6));
    
    for (let i = Math.max(0, totalPoints - (step * 6)); i < totalPoints; i += step) {
      const t = times[i];
      const hAqi = Math.round(Number(aqis[i])) || calculateAQIFromPM25(Number(pm25s[i]));
      recentHourly.push({
        time: formatHour(t),
        recorded_at: new Date(t).toISOString(),
        aqi: hAqi,
        pm25: Number(pm25s[i]) || rawPm25,
        pm10: Number(pm10s[i]) || rawPm10,
        temperature,
        humidity
      });
    }
  }

  return {
    aqi: computedAqi,
    temperature,
    humidity,
    pm25: parseFloat(rawPm25.toFixed(1)),
    pm10: parseFloat(rawPm10.toFixed(1)),
    co: coMgM3,
    no2: parseFloat(rawNo2.toFixed(1)),
    so2: parseFloat(rawSo2.toFixed(1)),
    o3: parseFloat(rawO3.toFixed(1)),
    windSpeed,
    wind_speed: windSpeed,
    pressure,
    co2: Math.round(coMgM3 * 400 + 420), // Ambient CO2 estimation in ppm
    recorded_at: currentAq.time ? new Date(currentAq.time).toISOString() : new Date().toISOString(),
    recentHourly
  };
}

module.exports = {
  fetchRealEnvironmentalData,
  calculateAQIFromPM25
};
