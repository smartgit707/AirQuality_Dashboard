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
 * 1. Validate city
 * 2. Get its coordinates
 * 3. Call Open-Meteo API
 * 4. Process response & calculate AQI
 * 5. Store reading in PostgreSQL (air_quality_records)
 * 6. Return clean JSON to frontend
 */
exports.getLatestCityRecord = async (req, res) => {
  const cityName = (req.params.city || '').trim();
  const cityConfig = getCityConfig(cityName);

  // 1. City validation
  if (!cityConfig) {
    return res.status(404).json({
      success: false,
      message: `Invalid city '${cityName}'. Supported cities: ${supportedCityNames.join(', ')}`
    });
  }

  const standardCityName = cityConfig.name;

  try {
    // 2 & 3. Call Open-Meteo external APIs with coordinates
    console.log(`[Open-Meteo] Fetching live air quality & weather for ${standardCityName} (${cityConfig.latitude}, ${cityConfig.longitude})...`);
    const liveData = await fetchRealEnvironmentalData(cityConfig.latitude, cityConfig.longitude);

    // 4 & 5. Store fresh reading in PostgreSQL database table `air_quality_records`
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
      console.log(`[Database] Stored fresh Open-Meteo reading for ${standardCityName} (AQI: ${liveData.aqi})`);

      // If database has historical hourly points from Open-Meteo and needs preloading
      if (Array.isArray(liveData.recentHourly) && liveData.recentHourly.length > 0) {
        const checkSql = `SELECT COUNT(*) as count FROM air_quality_records WHERE LOWER(city) = LOWER($1);`;
        const countRes = await db.query(checkSql, [standardCityName]);
        const existingCount = Number(countRes.rows[0]?.count || 0);

        if (existingCount <= 1) {
          // Preload recent hourly points so historical chart immediately has trend data
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
      console.warn(`[Database] Could not persist reading to PostgreSQL:`, dbErr.message);
    }

    // 6. Return clean, formatted response to React frontend
    const responsePayload = {
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

    return res.json({
      ...responsePayload,
      data: responsePayload
    });

  } catch (apiErr) {
    console.error(`[Open-Meteo] External API error for ${standardCityName}:`, apiErr.message);

    // Fallback: Query the latest saved record from PostgreSQL if external API fails
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
        const record = {
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
          warning: 'Live API temporarily unavailable. Displaying most recent stored record.',
          source: 'PostgreSQL Stored Record',
          success: true,
          dbConnected: db.isPostgresConnected()
        };

        return res.json({
          ...record,
          data: record
        });
      }
    } catch (cacheErr) {
      console.error(`[Database] Fallback retrieval also failed:`, cacheErr.message);
    }

    // If both live API and database cache are unavailable
    return res.status(503).json({
      success: false,
      message: 'Unable to fetch the latest environmental data. Please try again.',
      error: apiErr.message
    });
  }
};

/**
 * GET /api/air-quality/:city/history
 * Returns historical AQI records from PostgreSQL database
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

  const standardCityName = cityConfig.name;

  try {
    const sql = `
      SELECT recorded_at, aqi, temperature, humidity, pm25, pm10
      FROM air_quality_records
      WHERE LOWER(city) = LOWER($1)
      ORDER BY recorded_at ASC;
    `;

    const result = await db.query(sql, [standardCityName]);

    // Format historical data points for Recharts trend chart
    const history = (result.rows || []).map((row, index) => {
      const standardHours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'];
      const displayTime = formatHour(row.recorded_at) || standardHours[index % standardHours.length];

      return {
        time: displayTime,
        aqi: Number(row.aqi),
        temperature: Number(row.temperature),
        humidity: Number(row.humidity),
        pm25: Number(row.pm25),
        pm10: Number(row.pm10),
        recorded_at: row.recorded_at
      };
    });

    res.json({
      success: true,
      city: standardCityName,
      count: history.length,
      history,
      trend: history,
      dbConnected: db.isPostgresConnected()
    });
  } catch (err) {
    console.error(`Error querying history for ${standardCityName}:`, err);
    res.status(500).json({
      success: false,
      message: 'Database error fetching historical records',
      error: err.message,
      history: []
    });
  }
};
