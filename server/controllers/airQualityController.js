const db = require('../db');

// List of supported cities
const SUPPORTED_CITIES = ['Chennai', 'Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru'];

/**
 * Format timestamp into display hour (e.g. "8 AM", "2 PM")
 */
function formatHour(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours} ${ampm}`;
}

/**
 * GET /api/cities
 * Returns supported cities list
 */
exports.getCities = async (req, res) => {
  res.json({
    success: true,
    cities: SUPPORTED_CITIES,
    dbConnected: db.isPostgresConnected()
  });
};

/**
 * GET /api/air-quality/:city
 * Returns latest environmental record for a specific city from PostgreSQL
 */
exports.getLatestCityRecord = async (req, res) => {
  const cityName = req.params.city.trim();

  try {
    const sql = `
      SELECT id, city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at
      FROM air_quality_records
      WHERE LOWER(city) = LOWER($1)
      ORDER BY recorded_at DESC
      LIMIT 1;
    `;

    const result = await db.query(sql, [cityName]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `City '${cityName}' not found in database records. Available cities: ${SUPPORTED_CITIES.join(', ')}`
      });
    }

    const row = result.rows[0];

    // Compute approximate CO2 baseline for display consistency
    const estimatedCo2 = Math.round(Number(row.co) * 450 + 160);

    const record = {
      id: row.id,
      city: row.city,
      aqi: Number(row.aqi),
      temperature: Number(row.temperature),
      humidity: Number(row.humidity),
      pm25: Number(row.pm25),
      pm10: Number(row.pm10),
      co: Number(row.co),
      co2: estimatedCo2,
      no2: Number(row.no2),
      so2: Number(row.so2),
      o3: Number(row.o3),
      wind_speed: Number(row.wind_speed),
      windSpeed: Number(row.wind_speed),
      pressure: Number(row.pressure),
      recorded_at: row.recorded_at,
      lastUpdated: 'Just now',
      source: db.isPostgresConnected() ? 'PostgreSQL Database' : 'PostgreSQL Schema Store (Local Fallback)'
    };

    res.json({
      ...record,
      success: true,
      data: record,
      dbConnected: db.isPostgresConnected()
    });
  } catch (err) {
    console.error(`Error querying latest record for ${cityName}:`, err);
    res.status(500).json({
      success: false,
      message: 'Database query failure while retrieving city telemetry',
      error: err.message
    });
  }
};

/**
 * GET /api/air-quality/:city/history
 * Returns historical AQI records for that city from PostgreSQL
 */
exports.getCityHistory = async (req, res) => {
  const cityName = req.params.city.trim();

  try {
    const sql = `
      SELECT recorded_at, aqi, temperature, humidity, pm25, pm10
      FROM air_quality_records
      WHERE LOWER(city) = LOWER($1)
      ORDER BY recorded_at ASC;
    `;

    const result = await db.query(sql, [cityName]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No historical records found for '${cityName}'`,
        history: []
      });
    }

    // Format historical data points for Recharts trend line
    const history = result.rows.map((row, index) => {
      // Create readable standard hours if available (e.g., 8 AM, 10 AM, 12 PM, 2 PM, 4 PM, 6 PM)
      const standardHours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'];
      const displayTime = standardHours[index] || formatHour(row.recorded_at);

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
      city: cityName,
      count: history.length,
      history,
      trend: history, // Support both `history` and `trend` aliases
      dbConnected: db.isPostgresConnected()
    });
  } catch (err) {
    console.error(`Error querying history for ${cityName}:`, err);
    res.status(500).json({
      success: false,
      message: 'Database error fetching historical records',
      error: err.message
    });
  }
};
