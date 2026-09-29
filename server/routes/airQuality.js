const express = require('express');
const router = express.Router();
const { airQualityData, citiesList } = require('../data/mockData');

// GET /api/air-quality - returns overview of all cities
router.get('/air-quality', (req, res) => {
  res.json({
    success: true,
    count: citiesList.length,
    data: Object.values(airQualityData)
  });
});

// GET /api/cities - returns list of supported cities
router.get('/cities', (req, res) => {
  res.json({
    success: true,
    cities: citiesList
  });
});

// GET /api/air-quality/:city - returns specific city environmental metrics
router.get('/air-quality/:city', (req, res) => {
  const cityName = req.params.city.trim().toLowerCase();
  
  // Find matching city case-insensitively
  const matchedKey = Object.keys(airQualityData).find(
    k => k.toLowerCase() === cityName
  );

  if (!matchedKey) {
    return res.status(404).json({
      success: false,
      message: `City '${req.params.city}' not found. Supported cities: ${citiesList.join(', ')}`
    });
  }

  const cityRecord = { 
    ...airQualityData[matchedKey],
    lastUpdated: "Just now"
  };

  // Provide both direct properties and wrapper for client convenience
  res.json({
    city: cityRecord.city,
    aqi: cityRecord.aqi,
    temperature: cityRecord.temperature,
    humidity: cityRecord.humidity,
    pm25: cityRecord.pm25,
    pm10: cityRecord.pm10,
    co2: cityRecord.co2,
    co: cityRecord.co,
    no2: cityRecord.no2,
    so2: cityRecord.so2,
    o3: cityRecord.o3,
    windSpeed: cityRecord.windSpeed,
    pressure: cityRecord.pressure,
    trend: cityRecord.trend,
    lastUpdated: cityRecord.lastUpdated,
    success: true,
    data: cityRecord
  });
});

module.exports = router;
