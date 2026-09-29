const express = require('express');
const cors = require('cors');
const airQualityRoutes = require('./routes/airQuality');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend development
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
    timestamp: new Date().toISOString()
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.json({
    project: 'Air Quality and Environment Monitoring Dashboard API',
    version: '1.0.0 (Phase 1 Prototype)',
    endpoints: [
      'GET /api/health',
      'GET /api/cities',
      'GET /api/air-quality',
      'GET /api/air-quality/:city'
    ]
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Air Quality Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 City Metrics: http://localhost:${PORT}/api/air-quality/Chennai`);
  console.log(`===================================================`);
});
