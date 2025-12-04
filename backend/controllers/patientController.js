const Patient = require('../models/Patient');
const User = require('../models/User');
const WellnessEntry = require('../models/WellnessEntry');

// @desc    Get patient dashboard
// @route   GET /api/patients/:id/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.id })
      .populate('userId', 'name email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get today's wellness entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = await WellnessEntry.findOne({
      patientId: patient._id,
      date: { $gte: today }
    });

    // Get recent wellness entries for trends
    const recentEntries = await WellnessEntry.find({
      patientId: patient._id
    })
      .sort({ date: -1 })
      .limit(7);

    // Get upcoming preventive care reminders (mock for now)
    const upcomingReminders = [];

    res.status(200).json({
      success: true,
      data: {
        patient,
        todayEntry: todayEntry || {
          steps: 0,
          sleepHours: 0,
          waterIntake: 0,
          score: 0
        },
        recentEntries,
        upcomingReminders,
        healthTip: getHealthTipOfTheDay()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient goals
// @route   GET /api/patients/:id/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const entries = await WellnessEntry.find({ patientId: patient._id })
      .sort({ date: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Log daily goal
// @route   POST /api/patients/:id/goals
// @access  Private
exports.logGoal = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const { steps, sleepHours, waterIntake } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let entry = await WellnessEntry.findOne({
      patientId: patient._id,
      date: { $gte: today }
    });

    if (entry) {
      entry.steps = steps || entry.steps;
      entry.sleepHours = sleepHours || entry.sleepHours;
      entry.waterIntake = waterIntake || entry.waterIntake;
      await entry.save();
    } else {
      entry = await WellnessEntry.create({
        patientId: patient._id,
        steps: steps || 0,
        sleepHours: sleepHours || 0,
        waterIntake: waterIntake || 0,
        preventiveComplianceScore: 0
      });
    }

    res.status(200).json({
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

// @desc    Get patient profile
// @route   GET /api/patients/:id/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.id })
      .populate('userId', 'name email')
      .populate('assignedProvider');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/:id/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.params.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patient._id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedPatient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function for health tip
function getHealthTipOfTheDay() {
  const tips = [
    'Stay hydrated! Aim for 8 glasses of water per day.',
    'Get at least 7-8 hours of sleep for optimal health.',
    'Take a 10-minute walk every hour if you sit for long periods.',
    'Remember to take your medications as prescribed.',
    'Practice deep breathing exercises to reduce stress.',
    'Eat a balanced diet with plenty of fruits and vegetables.',
    'Schedule regular preventive checkups with your healthcare provider.'
  ];
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return tips[dayOfYear % tips.length];
}

