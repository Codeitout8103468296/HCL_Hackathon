const Advisory = require('../models/Advisory');
const Provider = require('../models/Provider');
const Patient = require('../models/Patient');

// @desc    Create advisory note
// @route   POST /api/advisories
// @access  Private (Provider only)
exports.createAdvisory = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const { patientId, text, tags, expiresAt } = req.body;

    // Verify patient is assigned to provider
    const patient = await Patient.findById(patientId);
    if (!patient || !provider.patients.includes(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'Patient is not assigned to this provider'
      });
    }

    const advisory = await Advisory.create({
      providerId: provider._id,
      patientId,
      text,
      tags: tags || [],
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    res.status(201).json({
      success: true,
      data: advisory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient advisories
// @route   GET /api/advisories/:patientId
// @access  Private
exports.getAdvisories = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if user is the patient or their provider
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: req.user.id });
      if (patientProfile._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these advisories'
        });
      }
    }

    const advisories = await Advisory.find({
      patientId,
      visibleToPatient: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate('providerId', 'userId')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: advisories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update advisory
// @route   PATCH /api/advisories/:id
// @access  Private (Provider only)
exports.updateAdvisory = async (req, res, next) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    
    if (!advisory) {
      return res.status(404).json({
        success: false,
        message: 'Advisory not found'
      });
    }

    const provider = await Provider.findOne({ userId: req.user.id });
    if (advisory.providerId.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this advisory'
      });
    }

    const updatedAdvisory = await Advisory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedAdvisory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Acknowledge advisory
// @route   POST /api/advisories/:id/acknowledge
// @access  Private (Patient only)
exports.acknowledgeAdvisory = async (req, res, next) => {
  try {
    const advisory = await Advisory.findById(req.params.id);
    
    if (!advisory) {
      return res.status(404).json({
        success: false,
        message: 'Advisory not found'
      });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (advisory.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to acknowledge this advisory'
      });
    }

    advisory.acknowledgedAt = new Date();
    await advisory.save();

    res.status(200).json({
      success: true,
      data: advisory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

