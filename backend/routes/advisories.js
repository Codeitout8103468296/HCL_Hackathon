const express = require('express');
const router = express.Router();
const {
  createAdvisory,
  getAdvisories,
  updateAdvisory,
  acknowledgeAdvisory
} = require('../controllers/advisoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('provider'), createAdvisory);
router.get('/:patientId', getAdvisories);
router.patch('/:id', authorize('provider'), updateAdvisory);
router.post('/:id/acknowledge', authorize('patient'), acknowledgeAdvisory);

module.exports = router;

