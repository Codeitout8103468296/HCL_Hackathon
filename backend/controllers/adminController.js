const Provider = require('../models/Provider');
const Patient = require('../models/Patient');
const User = require('../models/User');
const WellnessEntry = require('../models/WellnessEntry');

// @desc    Get all providers
// @route   GET /api/admin/providers
// @access  Private (Admin only)
exports.getAllProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({})
      .populate('userId', 'name email')
      .populate('patients', 'userId');

    const providersWithStats = await Promise.all(
      providers.map(async (provider) => {
        const patientCount = provider.patients.length;
        const patients = await Patient.find({ _id: { $in: provider.patients } });
        
        let totalWellnessScore = 0;
        let scoreCount = 0;
        
        for (const patient of patients) {
          const recentEntry = await WellnessEntry.findOne({ patientId: patient._id })
            .sort({ date: -1 });
          if (recentEntry) {
            totalWellnessScore += recentEntry.score;
            scoreCount++;
          }
        }
        
        const avgWellnessScore = scoreCount > 0 ? Math.round(totalWellnessScore / scoreCount) : 0;

        return {
          ...provider.toObject(),
          patientCount,
          avgWellnessScore
        };
      })
    );

    res.status(200).json({
      success: true,
      data: providersWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all patients (admin view)
// @route   GET /api/admin/patients
// @access  Private (Admin only)
exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({})
      .populate('userId', 'name email')
      .populate('assignedProvider', 'userId specialization');

    const patientsWithCompliance = await Promise.all(
      patients.map(async (patient) => {
        const recentEntry = await WellnessEntry.findOne({
          patientId: patient._id
        }).sort({ date: -1 });

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

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalProviders = await Provider.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const patients = await Patient.find({});
    let totalWellnessScore = 0;
    let scoreCount = 0;
    
    for (const patient of patients) {
      const recentEntry = await WellnessEntry.findOne({ patientId: patient._id })
        .sort({ date: -1 });
      if (recentEntry) {
        totalWellnessScore += recentEntry.score;
        scoreCount++;
      }
    }
    
    const avgWellnessScore = scoreCount > 0 ? Math.round(totalWellnessScore / scoreCount) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalProviders,
        totalUsers,
        avgWellnessScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

