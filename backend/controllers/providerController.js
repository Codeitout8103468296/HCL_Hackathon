const Provider = require('../models/Provider');
const Patient = require('../models/Patient');
const WellnessEntry = require('../models/WellnessEntry');
const Advisory = require('../models/Advisory');

// @desc    Get assigned patients
// @route   GET /api/providers/:id/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.params.id });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const patients = await Patient.find({ _id: { $in: provider.patients } })
      .populate('userId', 'name email');

    // Get compliance status for each patient
    const patientsWithCompliance = await Promise.all(
      patients.map(async (patient) => {
        const recentEntry = await WellnessEntry.findOne({
          patientId: patient._id
        }).sort({ date: -1 });

        // Calculate compliance status (simplified)
        let complianceStatus = 'Good';
        if (!recentEntry || recentEntry.score < 50) {
          complianceStatus = 'Needs Attention';
        } else if (recentEntry.score >= 80) {
          complianceStatus = 'Excellent';
        }

        return {
          ...patient.toObject(),
          complianceStatus,
          wellnessScore: recentEntry ? recentEntry.score : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: patientsWithCompliance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient compliance
// @route   GET /api/providers/:id/patients/:patientId/compliance
// @access  Private
exports.getPatientCompliance = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.params.id });
    const patient = await Patient.findById(req.params.patientId);

    if (!provider || !patient) {
      return res.status(404).json({
        success: false,
        message: 'Provider or patient not found'
      });
    }

    // Check if patient is assigned to provider
    if (!provider.patients.includes(patient._id)) {
      return res.status(403).json({
        success: false,
        message: 'Patient is not assigned to this provider'
      });
    }

    // Get wellness entries
    const entries = await WellnessEntry.find({ patientId: patient._id })
      .sort({ date: -1 })
      .limit(30);

    // Get goals overview
    const goalsOverview = {
      steps: entries.length > 0 ? entries[0].steps : 0,
      sleepHours: entries.length > 0 ? entries[0].sleepHours : 0,
      waterIntake: entries.length > 0 ? entries[0].waterIntake : 0,
      averageScore: entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        patient,
        goalsOverview,
        recentEntries: entries.slice(0, 7),
        complianceStatus: entries.length > 0 && entries[0].score >= 70 ? 'Good' : 'Needs Attention'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

