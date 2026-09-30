const express = require('express');
const router = express.Router();
const airQualityController = require('../controllers/airQualityController');

// GET /api/cities - list of supported cities
router.get('/cities', airQualityController.getCities);

// GET /api/air-quality/compare?city1=...&city2=... - dual city comparison endpoint
router.get('/air-quality/compare', airQualityController.compareCities);

// GET /api/air-quality/:city/history - historical records for trend chart
router.get('/air-quality/:city/history', airQualityController.getCityHistory);

// GET /api/air-quality/:city - latest environmental record for a specific city
router.get('/api/air-quality/:city', airQualityController.getLatestCityRecord);
router.get('/air-quality/:city', airQualityController.getLatestCityRecord);

module.exports = router;
