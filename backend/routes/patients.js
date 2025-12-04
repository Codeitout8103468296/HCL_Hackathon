const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getGoals,
  logGoal,
  getProfile,
  updateProfile
} = require('../controllers/patientController');
const {
  generateEmergencyCard,
  getEmergencyCard
} = require('../controllers/emergencyController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/:id/dashboard', getDashboard);
router.get('/:id/goals', getGoals);
router.post('/:id/goals', logGoal);
router.get('/:id/profile', getProfile);
router.put('/:id/profile', updateProfile);
router.get('/:id/emergency-card', getEmergencyCard);
router.post('/:id/emergency-card', generateEmergencyCard);

module.exports = router;

