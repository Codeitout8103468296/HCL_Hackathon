const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientCompliance
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('provider'));

router.get('/:id/patients', getPatients);
router.get('/:id/patients/:patientId/compliance', getPatientCompliance);

module.exports = router;

