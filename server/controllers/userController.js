const db = require('../db');
const { fetchAndStoreCityTelemetry } = require('./airQualityController');

/**
 * GET /api/user/preferences
 */
async function getPreferences(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.json({
        success: true,
        preferences: {
          user_id: userId,
          default_city: 'Chennai',
          alert_aqi_threshold: 100,
          email_notifications: true,
          push_notifications: false
        }
      });
    }

    return res.json({
      success: true,
      preferences: result.rows[0]
    });
  } catch (err) {
    console.error('[User Controller] getPreferences error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve preferences.' });
  }
}

/**
 * PUT /api/user/preferences
 */
async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const { defaultCity, alertAqiThreshold, emailNotifications, pushNotifications } = req.body;

    const queryText = `
      INSERT INTO user_preferences (user_id, default_city, alert_aqi_threshold, email_notifications, push_notifications)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id)
      DO UPDATE SET
        default_city = EXCLUDED.default_city,
        alert_aqi_threshold = EXCLUDED.alert_aqi_threshold,
        email_notifications = EXCLUDED.email_notifications,
        push_notifications = EXCLUDED.push_notifications,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(queryText, [
      userId,
      defaultCity || 'Chennai',
      Number(alertAqiThreshold) || 100,
      emailNotifications !== undefined ? Boolean(emailNotifications) : true,
      pushNotifications !== undefined ? Boolean(pushNotifications) : false
    ]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'UPDATE_PREFERENCES', `Updated default city: ${defaultCity}, threshold: ${alertAqiThreshold}`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: 'Preferences updated successfully.',
      preferences: result.rows[0]
    });
  } catch (err) {
    console.error('[User Controller] updatePreferences error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update preferences.' });
  }
}

/**
 * GET /api/user/favorites
 * Returns favorite cities enriched with their current telemetry
 */
async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT city, added_at FROM favorite_cities WHERE user_id = $1 ORDER BY added_at DESC', [userId]);

    // Enrich each favorite city with current air quality reading
    const enrichedFavorites = await Promise.all(
      result.rows.map(async (fav) => {
        try {
          const telemetry = await fetchAndStoreCityTelemetry(fav.city);
          return {
            city: fav.city,
            added_at: fav.added_at,
            telemetry: telemetry || null
          };
        } catch (e) {
          return {
            city: fav.city,
            added_at: fav.added_at,
            telemetry: null
          };
        }
      })
    );

    return res.json({
      success: true,
      favorites: enrichedFavorites
    });
  } catch (err) {
    console.error('[User Controller] getFavorites error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load favorite cities.' });
  }
}

/**
 * POST /api/user/favorites
 */
async function addFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ success: false, error: 'City name is required.' });
    }

    // Capitalize properly
    const cleanCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    await db.query(
      `INSERT INTO favorite_cities (user_id, city)
       VALUES ($1, $2)
       ON CONFLICT (user_id, city) DO NOTHING;`,
      [userId, cleanCity]
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'ADD_FAVORITE', `Added ${cleanCity} to favorite locations`, req.ip || '127.0.0.1']
    );

    return res.status(201).json({
      success: true,
      message: `${cleanCity} added to favorite locations.`,
      city: cleanCity
    });
  } catch (err) {
    console.error('[User Controller] addFavorite error:', err);
    return res.status(500).json({ success: false, error: 'Failed to add favorite city.' });
  }
}

/**
 * DELETE /api/user/favorites/:city
 */
async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ success: false, error: 'City parameter is required.' });
    }

    const cleanCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    await db.query('DELETE FROM favorite_cities WHERE user_id = $1 AND LOWER(city) = LOWER($2)', [userId, cleanCity]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'REMOVE_FAVORITE', `Removed ${cleanCity} from favorites`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: `${cleanCity} removed from favorite locations.`,
      city: cleanCity
    });
  } catch (err) {
    console.error('[User Controller] removeFavorite error:', err);
    return res.status(500).json({ success: false, error: 'Failed to remove favorite city.' });
  }
}

/**
 * GET /api/user/alerts
 * Returns personalized environmental alerts tailored to user's favorite cities and threshold
 */
async function getUserAlerts(req, res) {
  try {
    const userId = req.user.id;

    // Get user preferences
    const prefResult = await db.query('SELECT alert_aqi_threshold FROM user_preferences WHERE user_id = $1', [userId]);
    const threshold = prefResult.rowCount > 0 ? prefResult.rows[0].alert_aqi_threshold : 100;

    // Get user favorites
    const favResult = await db.query('SELECT city FROM favorite_cities WHERE user_id = $1', [userId]);
    const favoriteCities = favResult.rows.map(r => r.city.toLowerCase());

    // Fetch alerts
    const alertsResult = await db.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50');
    const allAlerts = alertsResult.rows;

    // Filter relevant alerts: matching favorite cities OR AQI exceeding personal threshold
    const personalizedAlerts = allAlerts.filter(alert => {
      const cityMatch = favoriteCities.length === 0 || favoriteCities.includes(alert.city.toLowerCase());
      const valueMatch = alert.metric === 'AQI' ? alert.value >= threshold : true;
      return cityMatch || valueMatch;
    });

    return res.json({
      success: true,
      threshold,
      favoriteCitiesCount: favoriteCities.length,
      alerts: personalizedAlerts
    });
  } catch (err) {
    console.error('[User Controller] getUserAlerts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve personalized alerts.' });
  }
}

module.exports = {
  getPreferences,
  updatePreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  getUserAlerts
};
