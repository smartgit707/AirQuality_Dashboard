require('dotenv').config();
const { Pool } = require('pg');

// Initialize PostgreSQL Connection Pool using environment variables
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  database: process.env.DATABASE_NAME || 'air_quality_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
});

let isPostgresConnected = false;

// Connection test on server boot
async function initConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS current_time;');
    client.release();
    isPostgresConnected = true;
    console.log(`[Database] ✅ Connected to PostgreSQL database '${process.env.DATABASE_NAME}' at ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}`);
    return true;
  } catch (err) {
    isPostgresConnected = false;
    console.warn(`[Database] ⚠️ PostgreSQL connection attempt failed (${err.code || err.message}).`);
    console.warn(`[Database] Ensure PostgreSQL is running on ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT} and run 'npm run db:init' to seed.`);
    console.warn(`[Database] Using fallback in-memory dataset structured identically to 'air_quality_records' table.`);
    return false;
  }
}

// Fallback historical records (matching PostgreSQL table schema) for offline demo mode
const fallbackRecords = [
  // Chennai
  { city: 'Chennai', aqi: 62, temperature: 26.5, humidity: 75.0, pm25: 28.0, pm10: 48.0, co: 0.6, no2: 18.0, so2: 6.0, o3: 35.0, wind_speed: 10.0, pressure: 1009.0, recorded_at: new Date(Date.now() - 10 * 3600 * 1000) },
  { city: 'Chennai', aqi: 68, temperature: 28.0, humidity: 71.0, pm25: 30.0, pm10: 52.0, co: 0.7, no2: 21.0, so2: 7.0, o3: 38.0, wind_speed: 12.0, pressure: 1008.0, recorded_at: new Date(Date.now() - 8 * 3600 * 1000) },
  { city: 'Chennai', aqi: 75, temperature: 30.2, humidity: 65.0, pm25: 32.0, pm10: 58.0, co: 0.8, no2: 23.0, so2: 8.0, o3: 40.0, wind_speed: 14.0, pressure: 1007.0, recorded_at: new Date(Date.now() - 6 * 3600 * 1000) },
  { city: 'Chennai', aqi: 81, temperature: 31.5, humidity: 62.0, pm25: 36.0, pm10: 65.0, co: 0.9, no2: 26.0, so2: 9.0, o3: 44.0, wind_speed: 15.0, pressure: 1006.0, recorded_at: new Date(Date.now() - 4 * 3600 * 1000) },
  { city: 'Chennai', aqi: 78, temperature: 29.8, humidity: 66.0, pm25: 34.0, pm10: 62.0, co: 0.8, no2: 25.0, so2: 8.0, o3: 42.0, wind_speed: 14.0, pressure: 1007.0, recorded_at: new Date(Date.now() - 2 * 3600 * 1000) },
  { city: 'Chennai', aqi: 78, temperature: 29.0, humidity: 68.0, pm25: 34.0, pm10: 61.0, co: 0.8, no2: 24.0, so2: 8.0, o3: 42.0, wind_speed: 14.0, pressure: 1008.0, recorded_at: new Date(Date.now() - 5 * 60 * 1000) },
  
  // Hyderabad
  { city: 'Hyderabad', aqi: 72, temperature: 24.5, humidity: 65.0, pm25: 33.0, pm10: 58.0, co: 0.7, no2: 22.0, so2: 7.0, o3: 28.0, wind_speed: 7.0, pressure: 961.0, recorded_at: new Date(Date.now() - 10 * 3600 * 1000) },
  { city: 'Hyderabad', aqi: 79, temperature: 26.8, humidity: 61.0, pm25: 37.0, pm10: 64.0, co: 0.8, no2: 26.0, so2: 8.0, o3: 31.0, wind_speed: 8.0, pressure: 960.0, recorded_at: new Date(Date.now() - 8 * 3600 * 1000) },
  { city: 'Hyderabad', aqi: 85, temperature: 29.5, humidity: 55.0, pm25: 40.0, pm10: 69.0, co: 0.9, no2: 29.0, so2: 9.0, o3: 33.0, wind_speed: 10.0, pressure: 959.0, recorded_at: new Date(Date.now() - 6 * 3600 * 1000) },
  { city: 'Hyderabad', aqi: 92, temperature: 30.2, humidity: 52.0, pm25: 44.0, pm10: 75.0, co: 1.0, no2: 32.0, so2: 11.0, o3: 37.0, wind_speed: 10.0, pressure: 958.0, recorded_at: new Date(Date.now() - 4 * 3600 * 1000) },
  { city: 'Hyderabad', aqi: 88, temperature: 28.9, humidity: 56.0, pm25: 41.0, pm10: 72.0, co: 0.9, no2: 30.0, so2: 10.0, o3: 35.0, wind_speed: 9.0, pressure: 959.0, recorded_at: new Date(Date.now() - 2 * 3600 * 1000) },
  { city: 'Hyderabad', aqi: 88, temperature: 28.0, humidity: 58.0, pm25: 41.0, pm10: 72.0, co: 0.9, no2: 30.0, so2: 10.0, o3: 35.0, wind_speed: 9.0, pressure: 960.0, recorded_at: new Date(Date.now() - 10 * 60 * 1000) },

  // Delhi
  { city: 'Delhi', aqi: 195, temperature: 20.0, humidity: 58.0, pm25: 145.0, pm10: 210.0, co: 2.0, no2: 68.0, so2: 18.0, o3: 52.0, wind_speed: 4.0, pressure: 1014.0, recorded_at: new Date(Date.now() - 10 * 3600 * 1000) },
  { city: 'Delhi', aqi: 205, temperature: 22.5, humidity: 50.0, pm25: 155.0, pm10: 225.0, co: 2.2, no2: 72.0, so2: 20.0, o3: 58.0, wind_speed: 5.0, pressure: 1013.0, recorded_at: new Date(Date.now() - 8 * 3600 * 1000) },
  { city: 'Delhi', aqi: 220, temperature: 25.1, humidity: 42.0, pm25: 170.0, pm10: 248.0, co: 2.5, no2: 81.0, so2: 23.0, o3: 68.0, wind_speed: 6.0, pressure: 1012.0, recorded_at: new Date(Date.now() - 6 * 3600 * 1000) },
  { city: 'Delhi', aqi: 235, temperature: 26.0, humidity: 39.0, pm25: 180.0, pm10: 260.0, co: 2.7, no2: 86.0, so2: 25.0, o3: 72.0, wind_speed: 7.0, pressure: 1011.0, recorded_at: new Date(Date.now() - 4 * 3600 * 1000) },
  { city: 'Delhi', aqi: 215, temperature: 24.8, humidity: 43.0, pm25: 165.0, pm10: 240.0, co: 2.4, no2: 78.0, so2: 22.0, o3: 65.0, wind_speed: 6.0, pressure: 1012.0, recorded_at: new Date(Date.now() - 2 * 3600 * 1000) },
  { city: 'Delhi', aqi: 215, temperature: 24.0, humidity: 45.0, pm25: 165.0, pm10: 240.0, co: 2.4, no2: 78.0, so2: 22.0, o3: 65.0, wind_speed: 6.0, pressure: 1012.0, recorded_at: new Date(Date.now() - 3 * 60 * 1000) },

  // Mumbai
  { city: 'Mumbai', aqi: 95, temperature: 27.5, humidity: 82.0, pm25: 45.0, pm10: 82.0, co: 0.9, no2: 35.0, so2: 10.0, o3: 30.0, wind_speed: 12.0, pressure: 1011.0, recorded_at: new Date(Date.now() - 10 * 3600 * 1000) },
  { city: 'Mumbai', aqi: 105, temperature: 29.2, humidity: 78.0, pm25: 50.0, pm10: 92.0, co: 1.0, no2: 39.0, so2: 12.0, o3: 33.0, wind_speed: 14.0, pressure: 1010.0, recorded_at: new Date(Date.now() - 8 * 3600 * 1000) },
  { city: 'Mumbai', aqi: 112, temperature: 31.8, humidity: 72.0, pm25: 54.0, pm10: 98.0, co: 1.1, no2: 42.0, so2: 13.0, o3: 36.0, wind_speed: 17.0, pressure: 1009.0, recorded_at: new Date(Date.now() - 6 * 3600 * 1000) },
  { city: 'Mumbai', aqi: 125, temperature: 32.5, humidity: 70.0, pm25: 62.0, pm10: 112.0, co: 1.3, no2: 48.0, so2: 16.0, o3: 41.0, wind_speed: 18.0, pressure: 1008.0, recorded_at: new Date(Date.now() - 4 * 3600 * 1000) },
  { city: 'Mumbai', aqi: 118, temperature: 31.2, humidity: 74.0, pm25: 58.0, pm10: 105.0, co: 1.2, no2: 44.0, so2: 14.0, o3: 38.0, wind_speed: 16.0, pressure: 1010.0, recorded_at: new Date(Date.now() - 2 * 3600 * 1000) },
  { city: 'Mumbai', aqi: 118, temperature: 31.0, humidity: 75.0, pm25: 58.0, pm10: 105.0, co: 1.2, no2: 44.0, so2: 14.0, o3: 38.0, wind_speed: 16.0, pressure: 1010.0, recorded_at: new Date(Date.now() - 8 * 60 * 1000) },

  // Bengaluru
  { city: 'Bengaluru', aqi: 35, temperature: 20.0, humidity: 70.0, pm25: 14.0, pm10: 28.0, co: 0.3, no2: 11.0, so2: 4.0, o3: 22.0, wind_speed: 9.0, pressure: 916.0, recorded_at: new Date(Date.now() - 10 * 3600 * 1000) },
  { city: 'Bengaluru', aqi: 38, temperature: 22.0, humidity: 64.0, pm25: 16.0, pm10: 32.0, co: 0.4, no2: 13.0, so2: 4.0, o3: 25.0, wind_speed: 11.0, pressure: 915.0, recorded_at: new Date(Date.now() - 8 * 3600 * 1000) },
  { city: 'Bengaluru', aqi: 45, temperature: 24.5, humidity: 58.0, pm25: 20.0, pm10: 40.0, co: 0.5, no2: 17.0, so2: 5.0, o3: 30.0, wind_speed: 13.0, pressure: 914.0, recorded_at: new Date(Date.now() - 6 * 3600 * 1000) },
  { city: 'Bengaluru', aqi: 48, temperature: 25.2, humidity: 55.0, pm25: 22.0, pm10: 42.0, co: 0.5, no2: 18.0, so2: 6.0, o3: 32.0, wind_speed: 12.0, pressure: 914.0, recorded_at: new Date(Date.now() - 4 * 3600 * 1000) },
  { city: 'Bengaluru', aqi: 42, temperature: 23.8, humidity: 59.0, pm25: 18.0, pm10: 36.0, co: 0.4, no2: 15.0, so2: 5.0, o3: 28.0, wind_speed: 11.0, pressure: 915.0, recorded_at: new Date(Date.now() - 2 * 3600 * 1000) },
  { city: 'Bengaluru', aqi: 42, temperature: 23.0, humidity: 60.0, pm25: 18.0, pm10: 36.0, co: 0.4, no2: 15.0, so2: 5.0, o3: 28.0, wind_speed: 11.0, pressure: 915.0, recorded_at: new Date(Date.now() - 2 * 60 * 1000) }
];

/**
 * Execute query with automatic fallback
 */
async function query(text, params = []) {
  if (isPostgresConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('[Database] Query execution error on PostgreSQL:', err.message);
      throw err;
    }
  }

  // If PostgreSQL is not connected, simulate SQL query on fallback schema records
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');
  
  // 1. SELECT * ... ORDER BY recorded_at DESC LIMIT 1 (get latest city record)
  if (normalized.includes('order by recorded_at desc limit 1') || normalized.includes('desc limit 1')) {
    const cityName = (params[0] || '').toLowerCase();
    const cityRecords = fallbackRecords
      .filter(r => r.city.toLowerCase() === cityName)
      .sort((a, b) => b.recorded_at - a.recorded_at);
    
    return {
      rows: cityRecords.slice(0, 1),
      rowCount: cityRecords.length > 0 ? 1 : 0
    };
  }

  // 2. SELECT ... ORDER BY recorded_at ASC (get historical records)
  if (normalized.includes('order by recorded_at asc') || normalized.includes('asc')) {
    const cityName = (params[0] || '').toLowerCase();
    const cityRecords = fallbackRecords
      .filter(r => r.city.toLowerCase() === cityName)
      .sort((a, b) => a.recorded_at - b.recorded_at);
    
    return {
      rows: cityRecords,
      rowCount: cityRecords.length
    };
  }

  // 3. Fallback generic filter
  return {
    rows: [],
    rowCount: 0
  };
}

module.exports = {
  pool,
  query,
  initConnection,
  isPostgresConnected: () => isPostgresConnected
};
