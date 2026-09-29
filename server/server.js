require('dotenv').config();
const express = require('express');
const cors = require('cors');
const airQualityRoutes = require('./routes/airQuality');
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

// Mount routes
app.use('/api', airQualityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Air Quality Monitoring API is running smoothly',
    databaseConnected: db.isPostgresConnected(),
    timestamp: new Date().toISOString()
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.json({
    project: 'Air Quality and Environment Monitoring Dashboard API',
    version: '2.0.0 (Phase 3 Full Stack: React -> Express -> PostgreSQL)',
    databaseConnected: db.isPostgresConnected(),
    endpoints: [
      'GET /api/health',
      'GET /api/cities',
      'GET /api/air-quality/:city',
      'GET /api/air-quality/:city/history'
    ]
  });
});

// Start Express server and initialize database connection
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`🚀 Air Quality Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 City Latest: http://localhost:${PORT}/api/air-quality/Chennai`);
  console.log(`📈 City History: http://localhost:${PORT}/api/air-quality/Chennai/history`);
  console.log(`===================================================`);

  // Test PostgreSQL connection
  await db.initConnection();
});
