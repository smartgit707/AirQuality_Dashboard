require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
const isCloudOrProduction = Boolean(connectionString || process.env.NODE_ENV === 'production' || process.env.VERCEL);

// Initialize PostgreSQL Connection Pool supporting both local and cloud connection strings (Neon, Supabase, Vercel Postgres)
const poolConfig = connectionString
  ? {
      connectionString,
      ssl: isCloudOrProduction ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    }
  : {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      database: process.env.DATABASE_NAME || 'air_quality_db',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

let isPostgresConnected = false;
let isMigrated = false;

// Connection test on server boot & auto-migration
async function initConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW() AS current_time;');
    isPostgresConnected = true;
    console.log(`[Database] ✅ Connected to PostgreSQL database successfully.`);

    // Auto-migrate schema on fresh cloud databases if needed
    if (!isMigrated) {
      try {
        const tableCheck = await client.query("SELECT to_regclass('public.air_quality_records') AS tbl_exists;");
        if (!tableCheck.rows[0] || !tableCheck.rows[0].tbl_exists) {
          console.log('[Database] 🚀 Tables not detected. Auto-running schema initialization...');
          const schemaPath = path.join(__dirname, 'schema.sql');
          if (fs.existsSync(schemaPath)) {
            const sql = fs.readFileSync(schemaPath, 'utf8');
            await client.query(sql);
            console.log('[Database] ✅ Schema and seed records created successfully.');
          }
        }
        isMigrated = true;
      } catch (migErr) {
        console.warn('[Database] Auto-migration check:', migErr.message);
      }
    }

    client.release();
    return true;
  } catch (err) {
    isPostgresConnected = false;
    console.warn(`[Database] ⚠️ PostgreSQL connection attempt failed (${err.code || err.message}).`);
    console.warn(`[Database] Using fallback in-memory dataset structured identically to 'air_quality_records' table.`);
    return false;
  }
}

// Auto-trigger connection attempt on load
initConnection().catch(() => {});


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

// Fallback alerts dataset for offline / development mode
const fallbackAlerts = [
  { id: 1, city: 'Delhi', severity: 'CRITICAL', metric: 'AQI', value: 215.0, message: 'Unhealthy air quality detected. Elevated smog levels across urban corridor.', created_at: new Date(Date.now() - 25 * 60 * 1000), is_read: false },
  { id: 2, city: 'Delhi', severity: 'CRITICAL', metric: 'PM2.5', value: 165.0, message: 'PM2.5 concentration has increased significantly above safe limits.', created_at: new Date(Date.now() - 120 * 60 * 1000), is_read: false },
  { id: 3, city: 'Mumbai', severity: 'WARNING', metric: 'AQI', value: 118.0, message: 'Air quality has reached a level that may affect sensitive individuals.', created_at: new Date(Date.now() - 60 * 60 * 1000), is_read: false },
  { id: 4, city: 'Hyderabad', severity: 'INFO', metric: 'AQI', value: 88.0, message: 'Moderate air quality prevailing. Atmospheric parameters remain within expected bounds.', created_at: new Date(Date.now() - 180 * 60 * 1000), is_read: true },
  { id: 5, city: 'Chennai', severity: 'INFO', metric: 'Humidity', value: 68.0, message: 'Coastal humidity peak detected with stable wind circulation.', created_at: new Date(Date.now() - 240 * 60 * 1000), is_read: true }
];

// Fallback users dataset (pre-seeded with bcrypt hashes)
const fallbackUsers = [
  {
    id: 1,
    name: 'System Administrator',
    email: 'admin@ecosense.gov',
    password_hash: '$2b$10$d.XyCpMMXuyRtlFrAMIeleVUUYDKo03/5B0esxtUO7NLy2vmSNjz2', // admin123
    role: 'ADMIN',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    updated_at: new Date()
  },
  {
    id: 2,
    name: 'Citizen Observer',
    email: 'user@ecosense.org',
    password_hash: '$2b$10$efaoM93xBbKZMwW//2HvkuNg8ZNXWpEohJfLEKZ.ukrpcFZyN8xmm', // user123
    role: 'USER',
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    updated_at: new Date()
  }
];

// Fallback user preferences
const fallbackPreferences = [
  {
    id: 1,
    user_id: 1,
    default_city: 'Delhi',
    alert_aqi_threshold: 150,
    email_notifications: true,
    push_notifications: true,
    updated_at: new Date()
  },
  {
    id: 2,
    user_id: 2,
    default_city: 'Chennai',
    alert_aqi_threshold: 100,
    email_notifications: true,
    push_notifications: false,
    updated_at: new Date()
  }
];

// Fallback favorite cities
const fallbackFavorites = [
  { id: 1, user_id: 1, city: 'Delhi', added_at: new Date() },
  { id: 2, user_id: 1, city: 'Mumbai', added_at: new Date() },
  { id: 3, user_id: 2, city: 'Chennai', added_at: new Date() },
  { id: 4, user_id: 2, city: 'Bengaluru', added_at: new Date() }
];

// Fallback audit logs
const fallbackAuditLogs = [
  { id: 1, user_id: 1, action: 'AUTH_INIT', details: 'System security initialized', ip_address: '127.0.0.1', created_at: new Date() }
];

/**
 * Execute query with automatic fallback
 */
async function query(text, params = []) {
  if (isPostgresConnected || connectionString) {
    try {
      const res = await pool.query(text, params);
      isPostgresConnected = true;
      return res;
    } catch (err) {
      console.warn('[Database] Query execution fallback:', err.message);
      // Fall through to fallback simulator if live db has transient issue or not yet initialized
    }
  }

  // If PostgreSQL is not connected, simulate SQL query on fallback schema records
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // 1. COUNT QUERIES
  if (normalized.includes('count(*)')) {
    if (normalized.includes('users')) {
      return { rows: [{ count: fallbackUsers.length }], rowCount: 1 };
    }
    if (normalized.includes('alerts')) {
      return { rows: [{ count: fallbackAlerts.length }], rowCount: 1 };
    }
    return { rows: [{ count: fallbackRecords.length }], rowCount: 1 };
  }

  // 2. USERS QUERIES
  // SELECT ... FROM users WHERE email = $1
  if (normalized.includes('from users') && normalized.includes('where email =')) {
    const emailToFind = (params[0] || '').toLowerCase().trim();
    const user = fallbackUsers.find(u => u.email.toLowerCase() === emailToFind);
    return {
      rows: user ? [{ ...user }] : [],
      rowCount: user ? 1 : 0
    };
  }

  // SELECT ... FROM users WHERE id = $1
  if (normalized.includes('from users') && normalized.includes('where id =')) {
    const idToFind = parseInt(params[0], 10);
    const user = fallbackUsers.find(u => u.id === idToFind);
    return {
      rows: user ? [{ ...user }] : [],
      rowCount: user ? 1 : 0
    };
  }

  // SELECT ... FROM users (list all users)
  if (normalized.includes('from users')) {
    const userList = fallbackUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
      updated_at: u.updated_at
    })).sort((a, b) => b.id - a.id);
    return {
      rows: userList,
      rowCount: userList.length
    };
  }

  // INSERT INTO users
  if (normalized.startsWith('insert into users')) {
    const [name, email, password_hash, role] = params;
    const newUser = {
      id: fallbackUsers.length + 1,
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role: role || 'USER',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    fallbackUsers.push(newUser);
    // Also create default preferences
    fallbackPreferences.push({
      id: fallbackPreferences.length + 1,
      user_id: newUser.id,
      default_city: 'Chennai',
      alert_aqi_threshold: 100,
      email_notifications: true,
      push_notifications: false,
      updated_at: new Date()
    });
    return {
      rows: [{
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }],
      rowCount: 1
    };
  }

  // UPDATE users
  if (normalized.startsWith('update users')) {
    if (normalized.includes('set password_hash =')) {
      const [newHash, userId] = params;
      const user = fallbackUsers.find(u => u.id === parseInt(userId, 10));
      if (user) {
        user.password_hash = newHash;
        user.updated_at = new Date();
        return { rows: [user], rowCount: 1 };
      }
    } else if (normalized.includes('set name =')) {
      const [name, userId] = params;
      const user = fallbackUsers.find(u => u.id === parseInt(userId, 10));
      if (user) {
        user.name = name;
        user.updated_at = new Date();
        return { rows: [{ id: user.id, name: user.name, email: user.email, role: user.role }], rowCount: 1 };
      }
    } else if (normalized.includes('set role =')) {
      const [role, userId] = params;
      const user = fallbackUsers.find(u => u.id === parseInt(userId, 10));
      if (user) {
        user.role = role;
        user.updated_at = new Date();
        return { rows: [{ id: user.id, name: user.name, email: user.email, role: user.role }], rowCount: 1 };
      }
    } else if (normalized.includes('is_active = not is_active') || normalized.includes('is_active =')) {
      const userId = parseInt(params[0], 10);
      const user = fallbackUsers.find(u => u.id === userId);
      if (user) {
        user.is_active = !user.is_active;
        user.updated_at = new Date();
        return { rows: [user], rowCount: 1 };
      }
    }
    return { rows: [], rowCount: 0 };
  }

  // DELETE FROM users WHERE id = $1
  if (normalized.startsWith('delete from users')) {
    const userId = parseInt(params[0], 10);
    const index = fallbackUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      fallbackUsers.splice(index, 1);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 3. USER PREFERENCES QUERIES
  // SELECT FROM user_preferences WHERE user_id = $1
  if (normalized.includes('from user_preferences') && normalized.includes('where user_id =')) {
    const userId = parseInt(params[0], 10);
    const pref = fallbackPreferences.find(p => p.user_id === userId);
    return {
      rows: pref ? [{ ...pref }] : [],
      rowCount: pref ? 1 : 0
    };
  }

  // INSERT INTO / UPDATE user_preferences
  if (normalized.startsWith('insert into user_preferences') || normalized.startsWith('update user_preferences')) {
    const [userId, defaultCity, threshold, emailNotif, pushNotif] = params;
    const uId = parseInt(userId, 10);
    let pref = fallbackPreferences.find(p => p.user_id === uId);
    if (pref) {
      if (defaultCity !== undefined) pref.default_city = defaultCity;
      if (threshold !== undefined) pref.alert_aqi_threshold = Number(threshold);
      if (emailNotif !== undefined) pref.email_notifications = Boolean(emailNotif);
      if (pushNotif !== undefined) pref.push_notifications = Boolean(pushNotif);
      pref.updated_at = new Date();
    } else {
      pref = {
        id: fallbackPreferences.length + 1,
        user_id: uId,
        default_city: defaultCity || 'Chennai',
        alert_aqi_threshold: Number(threshold) || 100,
        email_notifications: emailNotif !== undefined ? Boolean(emailNotif) : true,
        push_notifications: pushNotif !== undefined ? Boolean(pushNotif) : false,
        updated_at: new Date()
      };
      fallbackPreferences.push(pref);
    }
    return { rows: [pref], rowCount: 1 };
  }

  // 4. FAVORITE CITIES QUERIES
  // SELECT FROM favorite_cities WHERE user_id = $1
  if (normalized.includes('from favorite_cities') && normalized.includes('where user_id =')) {
    const userId = parseInt(params[0], 10);
    const favs = fallbackFavorites.filter(f => f.user_id === userId);
    return {
      rows: favs,
      rowCount: favs.length
    };
  }

  // INSERT INTO favorite_cities
  if (normalized.startsWith('insert into favorite_cities')) {
    const [userId, city] = params;
    const uId = parseInt(userId, 10);
    const exists = fallbackFavorites.find(f => f.user_id === uId && f.city.toLowerCase() === city.toLowerCase());
    if (exists) {
      return { rows: [exists], rowCount: 1 };
    }
    const newFav = {
      id: fallbackFavorites.length + 1,
      user_id: uId,
      city,
      added_at: new Date()
    };
    fallbackFavorites.push(newFav);
    return { rows: [newFav], rowCount: 1 };
  }

  // DELETE FROM favorite_cities WHERE user_id = $1 AND city = $2
  if (normalized.startsWith('delete from favorite_cities')) {
    const [userId, city] = params;
    const uId = parseInt(userId, 10);
    const idx = fallbackFavorites.findIndex(f => f.user_id === uId && f.city.toLowerCase() === city.toLowerCase());
    if (idx !== -1) {
      fallbackFavorites.splice(idx, 1);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. AUDIT LOGS
  if (normalized.startsWith('insert into audit_logs')) {
    const [userId, action, details, ip] = params;
    const newLog = {
      id: fallbackAuditLogs.length + 1,
      user_id: userId ? parseInt(userId, 10) : null,
      action: action || 'ACTION',
      details: details || '',
      ip_address: ip || '127.0.0.1',
      created_at: new Date()
    };
    fallbackAuditLogs.unshift(newLog);
    return { rows: [newLog], rowCount: 1 };
  }

  if (normalized.includes('from audit_logs')) {
    return {
      rows: fallbackAuditLogs.slice(0, 50),
      rowCount: fallbackAuditLogs.length
    };
  }

  // 6. ALERTS QUERIES
  if (normalized.includes('from alerts')) {
    if (normalized.includes('order by created_at desc')) {
      return {
        rows: [...fallbackAlerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        rowCount: fallbackAlerts.length
      };
    }
    return { rows: fallbackAlerts, rowCount: fallbackAlerts.length };
  }

  // UPDATE alerts SET is_read = ...
  if (normalized.startsWith('update alerts')) {
    const alertId = parseInt(params[0], 10);
    const target = fallbackAlerts.find(a => a.id === alertId);
    if (target) {
      target.is_read = true;
      return { rows: [target], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO alerts ...
  if (normalized.startsWith('insert into alerts')) {
    const [city, severity, metric, value, message] = params;
    const newAlert = {
      id: fallbackAlerts.length + 1,
      city: city || 'All',
      severity: severity || 'INFO',
      metric: metric || 'AQI',
      value: Number(value) || 0,
      message: message || '',
      created_at: new Date(),
      is_read: false
    };
    fallbackAlerts.unshift(newAlert);
    return { rows: [newAlert], rowCount: 1 };
  }

  // 7. SELECT * ... ORDER BY recorded_at DESC LIMIT 1 (get latest city record)
  if (normalized.includes('order by recorded_at desc limit 1') || normalized.includes('desc limit 1')) {
    const cityName = (params[0] || '').toLowerCase();
    const cityRecords = fallbackRecords
      .filter(r => !cityName || r.city.toLowerCase() === cityName)
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    
    return {
      rows: cityRecords.slice(0, 1),
      rowCount: cityRecords.length > 0 ? 1 : 0
    };
  }

  // 8. SELECT ... ORDER BY recorded_at ASC / DESC (get historical records)
  if (normalized.includes('order by recorded_at')) {
    const cityName = (params[0] || '').toLowerCase();
    let cityRecords = fallbackRecords;
    if (cityName) {
      cityRecords = fallbackRecords.filter(r => r.city.toLowerCase() === cityName);
    }
    
    cityRecords = [...cityRecords].sort((a, b) => {
      if (normalized.includes('desc')) {
        return new Date(b.recorded_at) - new Date(a.recorded_at);
      }
      return new Date(a.recorded_at) - new Date(b.recorded_at);
    });
    
    return {
      rows: cityRecords,
      rowCount: cityRecords.length
    };
  }

  // 9. INSERT INTO air_quality_records ...
  if (normalized.startsWith('insert into air_quality_records')) {
    const [city, aqi, temperature, humidity, pm25, pm10, co, no2, so2, o3, wind_speed, pressure, recorded_at] = params;
    const newRecord = {
      id: fallbackRecords.length + 1,
      city: city || 'Unknown',
      aqi: Number(aqi) || 0,
      temperature: Number(temperature) || 0,
      humidity: Number(humidity) || 0,
      pm25: Number(pm25) || 0,
      pm10: Number(pm10) || 0,
      co: Number(co) || 0,
      no2: Number(no2) || 0,
      so2: Number(so2) || 0,
      o3: Number(o3) || 0,
      wind_speed: Number(wind_speed) || 0,
      pressure: Number(pressure) || 0,
      recorded_at: recorded_at ? new Date(recorded_at) : new Date()
    };

    fallbackRecords.push(newRecord);
    return {
      rows: [newRecord],
      rowCount: 1
    };
  }

  // Generic fallback
  return {
    rows: [],
    rowCount: 0
  };
}

module.exports = {
  pool,
  query,
  initConnection,
  isPostgresConnected: () => isPostgresConnected,
  getFallbackStats: () => ({
    totalRecords: fallbackRecords.length,
    totalAlerts: fallbackAlerts.length,
    totalUsers: fallbackUsers.length
  })
};

