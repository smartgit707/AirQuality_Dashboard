require('dotenv').config();
const express = require('express');
const cors = require('cors');
const airQualityRoutes = require('./routes/airQuality');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const airQualityController = require('./controllers/airQualityController');
const { startDataCollector } = require('./jobs/dataCollector');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for React frontend
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Mount EcoSense API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', airQualityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    project: 'EcoSense Environmental Intelligence Platform',
    message: 'EcoSense Backend API is running smoothly',
    databaseConnected: db.isPostgresConnected(),
    timestamp: new Date().toISOString()
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.json({
    project: 'EcoSense: Intelligent Air Quality & Environmental Monitoring Platform',
    tagline: 'Monitor. Analyze. Compare. Predict.',
    version: '3.0.0 (Full EcoSense Architecture)',
    databaseConnected: db.isPostgresConnected(),
    endpoints: [
      'GET /api/health',
      'GET /api/cities',
      'GET /api/air-quality/:city',
      'GET /api/air-quality/:city/history',
      'GET /api/comparison?cities=...',
      'GET /api/analytics/:city?metric=...&range=...',
      'GET /api/forecast/:city',
      'GET /api/alerts',
      'PATCH /api/alerts/:id/read',
      'GET /api/recommendations/:city',
      'GET /api/system/status',
      'POST /api/refresh/:city'
    ]
  });
});

// Serve frontend production build if available
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Express server and initialize database connection
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`🌿 EcoSense Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 System Status: http://localhost:${PORT}/api/system/status`);
  console.log(`===================================================`);

  // Test PostgreSQL connection
  await db.initConnection();

  // Start automated background telemetry collection
  startDataCollector(airQualityController.fetchAndStoreCityTelemetry);
});
