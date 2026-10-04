const express = require('express');
const router = express.Router();
const controller = require('../controllers/airQualityController');

// 1. Core Environmental Telemetry
router.get('/cities', controller.getCities);
router.get('/air-quality/:city/history', controller.getCityHistory);
router.get('/air-quality/:city', controller.getLatestCityRecord);
router.post('/refresh/:city', controller.refreshCity);

// 2. City Comparison (Dual & Multi-City up to 5)
router.get('/air-quality/compare', controller.compareCities);
router.get('/comparison', controller.getComparison);

// 3. Analytics & Historical Metrics
router.get('/analytics/:city', controller.getAnalytics);

// 4. Diurnal Trend Forecasting
router.get('/forecast/:city', controller.getForecast);

// 5. Smart Alerts Engine
router.get('/alerts', controller.getAlerts);
router.patch('/alerts/:id/read', controller.markAlertRead);

// 6. Activity & Health Recommendations
router.get('/recommendations/:city', controller.getRecommendations);

// 7. System Management & Health
router.get('/system/status', controller.getSystemStatus);

module.exports = router;
