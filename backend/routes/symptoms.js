const express = require('express');
const router = express.Router();
const {
  submitSymptomReport,
  getSymptomHistory
} = require('../controllers/symptomController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/report', submitSymptomReport);
router.get('/history/:patientId', getSymptomHistory);

module.exports = router;

