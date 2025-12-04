const mongoose = require('mongoose');

const SymptomReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    severity: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    }
  }],
  recommendation: {
    type: String,
    enum: ['self-care', 'see-gp', 'emergency'],
    required: true
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  }
});

module.exports = mongoose.model('SymptomReport', SymptomReportSchema);

