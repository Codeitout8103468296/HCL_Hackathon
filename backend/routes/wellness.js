const express = require('express');
const router = express.Router();
const {
  getWellness,
  submitWellness
} = require('../controllers/wellnessController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:patientId', getWellness);
router.post('/', submitWellness);

module.exports = router;

