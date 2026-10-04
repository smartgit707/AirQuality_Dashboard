const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');

// All user routes require authenticated user session
router.use(authenticateUser);

router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);

router.get('/favorites', userController.getFavorites);
router.post('/favorites', userController.addFavorite);
router.delete('/favorites/:city', userController.removeFavorite);

router.get('/alerts', userController.getUserAlerts);

module.exports = router;
