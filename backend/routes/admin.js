const express = require('express');
const router = express.Router();
const {
  getAllProviders,
  getAllPatients,
  getAdminStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/providers', getAllProviders);
router.get('/patients', getAllPatients);
router.get('/stats', getAdminStats);

module.exports = router;

