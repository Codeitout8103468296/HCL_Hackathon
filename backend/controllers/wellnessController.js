const WellnessEntry = require('../models/WellnessEntry');
const Patient = require('../models/Patient');

// @desc    Get wellness score and trends
// @route   GET /api/wellness/:patientId
// @access  Private
exports.getWellness = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { range = '7d' } = req.query;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const entries = await WellnessEntry.find({
      patientId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate averages
    const avgSteps = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.steps, 0) / entries.length)
      : 0;
    const avgSleep = entries.length > 0
      ? Math.round((entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length) * 10) / 10
      : 0;
    const avgScore = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        entries,
        averages: {
          steps: avgSteps,
          sleepHours: avgSleep,
          score: avgScore
        },
        currentScore: entries.length > 0 ? entries[entries.length - 1].score : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit wellness entry
// @route   POST /api/wellness
// @access  Private
exports.submitWellness = async (req, res, next) => {
  try {
    const { patientId, steps, sleepHours, waterIntake, preventiveComplianceScore } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let entry = await WellnessEntry.findOne({
      patientId,
      date: { $gte: today }
    });

    if (entry) {
      entry.steps = steps !== undefined ? steps : entry.steps;
      entry.sleepHours = sleepHours !== undefined ? sleepHours : entry.sleepHours;
      entry.waterIntake = waterIntake !== undefined ? waterIntake : entry.waterIntake;
      entry.preventiveComplianceScore = preventiveComplianceScore !== undefined 
        ? preventiveComplianceScore 
        : entry.preventiveComplianceScore;
      await entry.save();
    } else {
      entry = await WellnessEntry.create({
        patientId,
        steps: steps || 0,
        sleepHours: sleepHours || 0,
        waterIntake: waterIntake || 0,
        preventiveComplianceScore: preventiveComplianceScore || 0
      });
    }

    res.status(201).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

