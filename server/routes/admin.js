const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// All admin routes require authenticated user session AND ADMIN role
router.use(authenticateUser);
router.use(requireAdmin);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.patch('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Monitored Cities Management
router.get('/cities', adminController.getCitiesStatus);

// System Broadcast Alerts
router.post('/alerts/broadcast', adminController.broadcastAlert);

// Telemetry Inspection
router.get('/data', adminController.getHistoricalData);

// System Monitoring & Audit Logs
router.get('/system', adminController.getSystemMetrics);

module.exports = router;
