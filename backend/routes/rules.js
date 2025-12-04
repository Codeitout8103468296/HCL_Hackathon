const express = require('express');
const router = express.Router();
const {
  createRule,
  getRules,
  updateRule
} = require('../controllers/ruleController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createRule);
router.get('/', getRules);
router.put('/:id', updateRule);

module.exports = router;

