const mongoose = require('mongoose');

const AdvisorySchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  visibleToPatient: {
    type: Boolean,
    default: true
  },
  acknowledgedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Advisory', AdvisorySchema);

