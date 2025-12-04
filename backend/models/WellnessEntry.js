const mongoose = require('mongoose');

const WellnessEntrySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  steps: {
    type: Number,
    default: 0
  },
  sleepHours: {
    type: Number,
    default: 0
  },
  waterIntake: {
    type: Number,
    default: 0 // in ml
  },
  preventiveComplianceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 30
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate wellness score before saving
WellnessEntrySchema.pre('save', function(next) {
  // Steps: 40 points (max 10000 steps = 40 points)
  const stepsScore = Math.min((this.steps / 10000) * 40, 40);
  
  // Sleep: 30 points (8 hours = 30 points)
  const sleepScore = Math.min((this.sleepHours / 8) * 30, 30);
  
  // Preventive compliance: 30 points (already set)
  const complianceScore = this.preventiveComplianceScore || 0;
  
  this.score = Math.round(stepsScore + sleepScore + complianceScore);
  next();
});

// Index for efficient queries
WellnessEntrySchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('WellnessEntry', WellnessEntrySchema);

