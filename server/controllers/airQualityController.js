const db = require('../db');
const { getCityConfig, supportedCityNames } = require('../config/cities');
const { fetchRealEnvironmentalData } = require('../services/openMeteoService');

/**
 * Format timestamp into display hour (e.g. "8 AM", "2 PM")
 */
function formatHour(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours} ${ampm}`;
}

/**
 * Internal helper to fetch live telemetry, store in DB, and retrieve history
 */
async function fetchAndStoreCityTelemetry(cityName) {
  const cityConfig = getCityConfig(cityName);
  if (!cityConfig) return null;

  const standardCityName = cityConfig.name;
  let record = null;
  let isLive = false;
  let warning = null;

  try {
    const liveData = await fetchRealEnvironmentalData(cityConfig.latitude, cityConfig.longitude);
    isLive = true;

    // Persist reading in PostgreSQL
    try {
      const insertSql = `
        INSERT INTO air_quality_records 
          (city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      const insertParams = [
        standardCityName,
        liveData.aqi,
        liveData.temperature,
        liveData.humidity,
        liveData.pm25,
        liveData.pm10,
        liveData.co,
        liveData.no2,
        liveData.so2,
        liveData.o3,
        liveData.windSpeed,
        liveData.pressure,
        liveData.recorded_at
      ];

      await db.query(insertSql, insertParams);

      // Preload historical hourly points if fresh
      if (Array.isArray(liveData.recentHourly) && liveData.recentHourly.length > 0) {
        const countRes = await db.query(`SELECT COUNT(*) as count FROM air_quality_records WHERE LOWER(city) = LOWER($1);`, [standardCityName]);
        if (Number(countRes.rows[0]?.count || 0) <= 1) {
          for (const hp of liveData.recentHourly) {
            await db.query(insertSql, [
              standardCityName,
              hp.aqi,
              hp.temperature,
              hp.humidity,
              hp.pm25,
              hp.pm10,
              liveData.co,
              liveData.no2,
              liveData.so2,
              liveData.o3,
              liveData.windSpeed,
              liveData.pressure,
              hp.recorded_at
            ]);
          }
        }
      }
    } catch (dbErr) {
      console.warn(`[Database] Could not persist reading for ${standardCityName}:`, dbErr.message);
    }

    record = {
      city: standardCityName,
      state: cityConfig.state,
      aqi: liveData.aqi,
      temperature: liveData.temperature,
      humidity: liveData.humidity,
      pm25: liveData.pm25,
      pm10: liveData.pm10,
      co: liveData.co,
      co2: liveData.co2,
      no2: liveData.no2,
      so2: liveData.so2,
      o3: liveData.o3,
      windSpeed: liveData.windSpeed,
      wind_speed: liveData.windSpeed,
      pressure: liveData.pressure,
      updatedAt: liveData.recorded_at,
      recorded_at: liveData.recorded_at,
      lastUpdated: 'Just now',
      isLive: true,
      source: 'Open-Meteo Live API',
      success: true,
      dbConnected: db.isPostgresConnected()
    };

  } catch (apiErr) {
    console.error(`[Open-Meteo] External fetch failed for ${standardCityName}:`, apiErr.message);

    // Fallback: Query latest database record
    try {
      const fallbackSql = `
        SELECT id, city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at
        FROM air_quality_records
        WHERE LOWER(city) = LOWER($1)
        ORDER BY recorded_at DESC
        LIMIT 1;
      `;
      const fallbackResult = await db.query(fallbackSql, [standardCityName]);

      if (fallbackResult.rows && fallbackResult.rows.length > 0) {
        const row = fallbackResult.rows[0];
        record = {
          city: row.city,
          state: cityConfig.state,
          aqi: Number(row.aqi),
          temperature: Number(row.temperature),
          humidity: Number(row.humidity),
          pm25: Number(row.pm25),
          pm10: Number(row.pm10),
          co: Number(row.co),
          co2: Math.round(Number(row.co) * 450 + 160),
          no2: Number(row.no2),
          so2: Number(row.so2),
          o3: Number(row.o3),
          windSpeed: Number(row.wind_speed),
          wind_speed: Number(row.wind_speed),
          pressure: Number(row.pressure),
          updatedAt: row.recorded_at,
          recorded_at: row.recorded_at,
          lastUpdated: 'Cached Database Record',
          isLive: false,
          isFallback: true,
          warning: 'Live API temporarily unavailable. Displaying stored database reading.',
          source: 'PostgreSQL Stored Record',
          success: true,
          dbConnected: db.isPostgresConnected()
        };
      }
    } catch (cacheErr) {
      console.error(`[Database] Cache fallback error:`, cacheErr.message);
    }
  }

  // Retrieve historical records from database for this city
  let history = [];
  try {
    const histSql = `
      SELECT recorded_at, aqi, temperature, humidity, pm25, pm10
      FROM air_quality_records
      WHERE LOWER(city) = LOWER($1)
      ORDER BY recorded_at ASC;
    `;
    const histRes = await db.query(histSql, [standardCityName]);
    const standardHours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'];

    history = (histRes.rows || []).map((row, idx) => ({
      time: formatHour(row.recorded_at) || standardHours[idx % standardHours.length],
      aqi: Number(row.aqi),
      temperature: Number(row.temperature),
      humidity: Number(row.humidity),
      pm25: Number(row.pm25),
      pm10: Number(row.pm10),
      recorded_at: row.recorded_at
    }));
  } catch (_) {}

  return { record, history };
}

/**
 * GET /api/cities
 * Returns supported cities list
 */
exports.getCities = async (req, res) => {
  res.json({
    success: true,
    cities: supportedCityNames,
    dbConnected: db.isPostgresConnected()
  });
};

/**
 * GET /api/air-quality/:city
 */
exports.getLatestCityRecord = async (req, res) => {
  const cityName = (req.params.city || '').trim();
  const cityConfig = getCityConfig(cityName);

  if (!cityConfig) {
    return res.status(404).json({
      success: false,
      message: `Invalid city '${cityName}'. Supported cities: ${supportedCityNames.join(', ')}`
    });
  }

  const result = await fetchAndStoreCityTelemetry(cityName);

  if (!result || !result.record) {
    return res.status(503).json({
      success: false,
      message: 'Unable to fetch the latest environmental data. Please try again.'
    });
  }

  return res.json({
    ...result.record,
    data: result.record
  });
};

/**
 * GET /api/air-quality/:city/history
 */
exports.getCityHistory = async (req, res) => {
  const cityName = (req.params.city || '').trim();
  const cityConfig = getCityConfig(cityName);

  if (!cityConfig) {
    return res.status(404).json({
      success: false,
      message: `Invalid city '${cityName}'`,
      history: []
    });
  }

  const result = await fetchAndStoreCityTelemetry(cityName);

  res.json({
    success: true,
    city: cityConfig.name,
    count: result?.history?.length || 0,
    history: result?.history || [],
    trend: result?.history || [],
    dbConnected: db.isPostgresConnected()
  });
};

/**
 * GET /api/air-quality/compare?city1=...&city2=...
 * Compares two cities side-by-side with delta analysis and overlaid trend line
 */
exports.compareCities = async (req, res) => {
  const city1Name = (req.query.city1 || 'Delhi').trim();
  const city2Name = (req.query.city2 || 'Bengaluru').trim();

  const c1Config = getCityConfig(city1Name);
  const c2Config = getCityConfig(city2Name);

  if (!c1Config || !c2Config) {
    return res.status(400).json({
      success: false,
      message: `Invalid comparison cities. Both must be from: ${supportedCityNames.join(', ')}`
    });
  }

  try {
    // Concurrently fetch/retrieve data and historical readings for both cities
    const [res1, res2] = await Promise.all([
      fetchAndStoreCityTelemetry(c1Config.name),
      fetchAndStoreCityTelemetry(c2Config.name)
    ]);

    const d1 = res1?.record;
    const d2 = res2?.record;

    if (!d1 || !d2) {
      return res.status(503).json({
        success: false,
        message: 'Could not retrieve environmental telemetry for one or both comparison cities.'
      });
    }

    // Comparison Metrics & Deltas
    const aqiDiff = d1.aqi - d2.aqi;
    const cleanerCity = aqiDiff <= 0 ? d1.city : d2.city;
    const morePollutedCity = aqiDiff > 0 ? d1.city : d2.city;
    const maxAqi = Math.max(d1.aqi, d2.aqi, 1);
    const aqiPercentCleaner = Math.round((Math.abs(aqiDiff) / maxAqi) * 100);

    const tempDiff = parseFloat((d1.temperature - d2.temperature).toFixed(1));
    const humidityDiff = d1.humidity - d2.humidity;
    const pm25Diff = parseFloat((d1.pm25 - d2.pm25).toFixed(1));
    const pm10Diff = parseFloat((d1.pm10 - d2.pm10).toFixed(1));
    const windDiff = parseFloat((d1.windSpeed - d2.windSpeed).toFixed(1));

    // Build synchronized dual-series historical trend for Recharts
    const hours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'];
    const h1 = res1.history || [];
    const h2 = res2.history || [];

    const mergedTrend = hours.map((time, idx) => {
      const p1 = h1[idx] || {};
      const p2 = h2[idx] || {};

      return {
        time,
        [d1.city]: p1.aqi != null ? p1.aqi : d1.aqi,
        [d2.city]: p2.aqi != null ? p2.aqi : d2.aqi,
        [`${d1.city}_pm25`]: p1.pm25 != null ? p1.pm25 : d1.pm25,
        [`${d2.city}_pm25`]: p2.pm25 != null ? p2.pm25 : d2.pm25,
      };
    });

    res.json({
      success: true,
      city1: d1,
      city2: d2,
      comparison: {
        cleanerCity,
        morePollutedCity,
        aqiDiff: Math.abs(aqiDiff),
        aqiPercentCleaner,
        cleanerMargin: `${cleanerCity} is currently ${aqiPercentCleaner}% cleaner in AQI than ${morePollutedCity}`,
        tempDiff,
        humidityDiff,
        pm25Diff,
        pm10Diff,
        windDiff,
        summary: aqiDiff === 0 
          ? `Both ${d1.city} and ${d2.city} share an identical AQI level of ${d1.aqi}.`
          : `${cleanerCity} exhibits significantly superior atmospheric quality compared to ${morePollutedCity} with an AQI difference of ${Math.abs(aqiDiff)} points.`
      },
      mergedTrend
    });

  } catch (err) {
    console.error('[Comparison] Error comparing cities:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to generate comparison telemetry',
      error: err.message
    });
  }
};
