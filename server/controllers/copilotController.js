const { processCopilotQuery } = require('../services/aiCopilotService');
const db = require('../db');

/**
 * Controller for EcoSense AI Environmental Copilot
 */
exports.chatWithCopilot = async (req, res) => {
  try {
    const { message, city = 'Hyderabad' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message parameter is required and cannot be empty.'
      });
    }

    // Build user context if authenticated
    let userContext = null;
    if (req.user) {
      // Fetch user preferences if available
      let aqiThreshold = 100;
      let defaultCity = city;
      try {
        const prefRes = await db.query('SELECT default_city, aqi_threshold FROM user_preferences WHERE user_id = $1', [req.user.id]);
        if (prefRes.rowCount > 0) {
          defaultCity = prefRes.rows[0].default_city || defaultCity;
          aqiThreshold = prefRes.rows[0].aqi_threshold || aqiThreshold;
        }
      } catch (err) {
        // ignore
      }

      userContext = {
        name: req.user.name,
        role: req.user.role,
        defaultCity,
        aqiThreshold
      };
    }

    const targetCity = city || userContext?.defaultCity || 'Hyderabad';
    const result = await processCopilotQuery({
      message: message.trim(),
      city: targetCity,
      userContext
    });

    res.json(result);
  } catch (err) {
    console.error('[Copilot Controller] Error:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while communicating with EcoSense Copilot.',
      details: err.message
    });
  }
};
