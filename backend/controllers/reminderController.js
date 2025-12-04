const { Reminder, Adherence } = require('../models/Reminder');
const Patient = require('../models/Patient');

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res, next) => {
  try {
    const { patientId, type, text, schedule } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify patient ownership if user is patient
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: req.user.id });
      if (patientProfile._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const reminder = await Reminder.create({
      patientId,
      type,
      text,
      schedule: {
        times: schedule.times || []
      },
      enabled: true
    });

    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient reminders
// @route   GET /api/reminders/:patientId
// @access  Private
exports.getReminders = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify authorization
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: req.user.id });
      if (patientProfile._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const reminders = await Reminder.find({
      patientId,
      enabled: true
    }).sort({ createdAt: -1 });

    // Get today's adherence records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAdherence = await Adherence.find({
      patientId,
      timestamp: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        reminders,
        todayAdherence
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark reminder as taken
// @route   POST /api/reminders/:id/mark
// @access  Private
exports.markReminder = async (req, res, next) => {
  try {
    const { status } = req.body; // 'taken' or 'missed'

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Verify patient ownership
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user.id });
      if (patient._id.toString() !== reminder.patientId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const adherence = await Adherence.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      timestamp: new Date(),
      status: status || 'taken'
    });

    res.status(201).json({
      success: true,
      data: adherence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

