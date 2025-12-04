const express = require('express');
const router = express.Router();
const {
  generateEmergencyCard,
  getPublicEmergencyCard
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

// Public route (no auth required)
router.get('/:publicToken', getPublicEmergencyCard);

// Protected route
router.post('/patients/:id/emergency-card', protect, generateEmergencyCard);

module.exports = router;

