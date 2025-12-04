const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  evaluateRecommendations
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:patientId', getRecommendations);
router.post('/evaluate', evaluateRecommendations);

module.exports = router;

