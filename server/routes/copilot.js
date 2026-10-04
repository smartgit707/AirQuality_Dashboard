const express = require('express');
const router = express.Router();
const copilotController = require('../controllers/copilotController');
const { optionalAuth } = require('../middleware/auth');

/**
 * POST /api/copilot/chat
 * Send a question to EcoSense AI Copilot
 */
router.post('/chat', optionalAuth, copilotController.chatWithCopilot);

module.exports = router;
