const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    enum: ['medication', 'water'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  schedule: {
    times: [{
      type: String,
      required: true // Format: "HH:MM"
    }]
  },
  enabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdherenceSchema = new mongoose.Schema({
  reminderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['taken', 'missed'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  Reminder: mongoose.model('Reminder', ReminderSchema),
  Adherence: mongoose.model('Adherence', AdherenceSchema)
};

