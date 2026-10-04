const db = require('../db');
const { cityConfigs } = require('../config/cities');
const { fetchAndStoreCityTelemetry } = require('./airQualityController');
const os = require('os');

/**
 * GET /api/admin/users
 * Returns list of users (passwords excluded)
 */
async function getUsers(req, res) {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at DESC;`
    );

    return res.json({
      success: true,
      totalUsers: result.rowCount,
      users: result.rows
    });
  } catch (err) {
    console.error('[Admin Controller] getUsers error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user registry.' });
  }
}

/**
 * PATCH /api/admin/users/:id/toggle-status
 * Toggle user active/deactivated state
 */
async function toggleUserStatus(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const adminId = req.user.id;

    if (targetUserId === adminId) {
      return res.status(400).json({ success: false, error: 'Administrators cannot deactivate their own account.' });
    }

    const check = await db.query('SELECT is_active FROM users WHERE id = $1', [targetUserId]);
    if (check.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const newStatus = !check.rows[0].is_active;
    await db.query('UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, targetUserId]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'ADMIN_USER_TOGGLE', `User #${targetUserId} active status changed to ${newStatus}`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: `User account has been ${newStatus ? 'activated' : 'deactivated'}.`,
      isActive: newStatus
    });
  } catch (err) {
    console.error('[Admin Controller] toggleUserStatus error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update user status.' });
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * Elevate or demote user role
 */
async function changeUserRole(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const adminId = req.user.id;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role specified. Must be USER or ADMIN.' });
    }

    if (targetUserId === adminId) {
      return res.status(400).json({ success: false, error: 'Administrators cannot modify their own privileges.' });
    }

    await db.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, targetUserId]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'ADMIN_ROLE_CHANGE', `Changed user #${targetUserId} role to ${role}`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: `User privileges updated to ${role}.`,
      role
    });
  } catch (err) {
    console.error('[Admin Controller] changeUserRole error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
}

/**
 * DELETE /api/admin/users/:id
 */
async function deleteUser(req, res) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const adminId = req.user.id;

    if (targetUserId === adminId) {
      return res.status(400).json({ success: false, error: 'Administrators cannot delete their own account.' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [targetUserId]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'ADMIN_USER_DELETE', `Deleted user #${targetUserId}`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: 'User removed successfully.'
    });
  } catch (err) {
    console.error('[Admin Controller] deleteUser error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
}

/**
 * GET /api/admin/cities
 * Returns monitored cities status, health, and latest readings
 */
async function getCitiesStatus(req, res) {
  try {
    const cityKeys = Object.keys(cityConfigs);
    const cityStatuses = await Promise.all(
      cityKeys.map(async (key) => {
        const config = cityConfigs[key];
        const latest = await fetchAndStoreCityTelemetry(config.name);
        return {
          key,
          name: config.name,
          latitude: config.latitude,
          longitude: config.longitude,
          status: 'ONLINE',
          aqi: latest ? latest.aqi : null,
          lastSync: latest ? latest.updatedAt : null,
          temperature: latest ? latest.temperature : null,
          pollutants: latest ? { pm25: latest.pm25, pm10: latest.pm10, no2: latest.no2 } : null
        };
      })
    );

    return res.json({
      success: true,
      totalCities: cityStatuses.length,
      cities: cityStatuses
    });
  } catch (err) {
    console.error('[Admin Controller] getCitiesStatus error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve city status.' });
  }
}

/**
 * POST /api/admin/alerts/broadcast
 * Broadcast an administrative environmental advisory or warning
 */
async function broadcastAlert(req, res) {
  try {
    const { city, severity, metric, value, message } = req.body;
    const adminId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Alert broadcast message is required.' });
    }

    const alertSeverity = severity || 'WARNING';
    const alertCity = city || 'All Cities';

    const insertRes = await db.query(
      `INSERT INTO alerts (city, severity, metric, value, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [alertCity, alertSeverity, metric || 'Manual Notice', Number(value) || 0, message.trim()]
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [adminId, 'ALERT_BROADCAST', `Admin broadcast alert for ${alertCity}: ${message.trim()}`, req.ip || '127.0.0.1']
    );

    return res.status(201).json({
      success: true,
      message: 'Advisory successfully broadcast to the platform.',
      alert: insertRes.rows[0]
    });
  } catch (err) {
    console.error('[Admin Controller] broadcastAlert error:', err);
    return res.status(500).json({ success: false, error: 'Failed to broadcast alert.' });
  }
}

/**
 * GET /api/admin/data
 * Inspect stored telemetry database records with city and limit filters
 */
async function getHistoricalData(req, res) {
  try {
    const city = req.query.city;
    const limit = parseInt(req.query.limit, 10) || 50;

    let queryText = 'SELECT * FROM air_quality_records ORDER BY recorded_at DESC LIMIT $1';
    let params = [limit];

    if (city && city.toLowerCase() !== 'all') {
      queryText = 'SELECT * FROM air_quality_records WHERE LOWER(city) = LOWER($1) ORDER BY recorded_at DESC LIMIT $2';
      params = [city, limit];
    }

    const result = await db.query(queryText, params);

    return res.json({
      success: true,
      count: result.rowCount,
      records: result.rows
    });
  } catch (err) {
    console.error('[Admin Controller] getHistoricalData error:', err);
    return res.status(500).json({ success: false, error: 'Failed to inspect historical records.' });
  }
}

/**
 * GET /api/admin/system
 * Detailed operational and infrastructure telemetry for the administrator
 */
async function getSystemMetrics(req, res) {
  try {
    const userCountRes = await db.query('SELECT COUNT(*) FROM users');
    const recordsCountRes = await db.query('SELECT COUNT(*) FROM air_quality_records');
    const alertsCountRes = await db.query('SELECT COUNT(*) FROM alerts');
    const auditLogsRes = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 25');

    const totalUsers = parseInt(userCountRes.rows[0].count, 10) || 0;
    const totalRecords = parseInt(recordsCountRes.rows[0].count, 10) || 0;
    const totalAlerts = parseInt(alertsCountRes.rows[0].count, 10) || 0;

    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    return res.json({
      success: true,
      system: {
        platform: 'EcoSense Environmental Intelligence Core v3.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        serverUptime: Math.floor(uptimeSeconds),
        hostUptime: Math.floor(os.uptime()),
        cpuLoadAverage: os.loadavg(),
        freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
        totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
        processMemoryRSS_MB: Math.round(memoryUsage.rss / (1024 * 1024)),
        databaseStatus: db.isPostgresConnected() ? 'CONNECTED (PostgreSQL)' : 'STANDALONE (In-Memory Simulator Active)',
        collectorIntervalMinutes: 30,
        collectorStatus: 'ACTIVE (Background Worker Running)'
      },
      counts: {
        users: totalUsers,
        records: totalRecords,
        alerts: totalAlerts
      },
      auditLogs: auditLogsRes.rows
    });
  } catch (err) {
    console.error('[Admin Controller] getSystemMetrics error:', err);
    return res.status(500).json({ success: false, error: 'Failed to gather system metrics.' });
  }
}

module.exports = {
  getUsers,
  toggleUserStatus,
  changeUserRole,
  deleteUser,
  getCitiesStatus,
  broadcastAlert,
  getHistoricalData,
  getSystemMetrics
};
