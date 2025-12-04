const express = require('express');
const router = express.Router();
const {
  createReminder,
  getReminders,
  markReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createReminder);
router.get('/:patientId', getReminders);
router.post('/:id/mark', markReminder);

module.exports = router;

