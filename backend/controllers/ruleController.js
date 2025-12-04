const PreventiveRule = require('../models/PreventiveRule');

// @desc    Create/update preventive care rule
// @route   POST /api/rules
// @access  Private (Admin/Provider)
exports.createRule = async (req, res, next) => {
  try {
    const rule = await PreventiveRule.create(req.body);

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all rules
// @route   GET /api/rules
// @access  Private
exports.getRules = async (req, res, next) => {
  try {
    const rules = await PreventiveRule.find({ enabled: true });

    res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update rule
// @route   PUT /api/rules/:id
// @access  Private (Admin/Provider)
exports.updateRule = async (req, res, next) => {
  try {
    const rule = await PreventiveRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

