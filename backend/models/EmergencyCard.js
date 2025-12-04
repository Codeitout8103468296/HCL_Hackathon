const mongoose = require('mongoose');
const crypto = require('crypto');

const EmergencyCardSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    unique: true
  },
  publicToken: {
    type: String,
    unique: true,
    required: true
  },
  fields: {
    name: {
      type: Boolean,
      default: true
    },
    bloodGroup: {
      type: Boolean,
      default: true
    },
    allergies: {
      type: Boolean,
      default: true
    },
    emergencyContact: {
      type: Boolean,
      default: true
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Generate public token before saving
EmergencyCardSchema.pre('save', function(next) {
  if (!this.publicToken || this.publicToken === '') {
    this.publicToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Also handle create
EmergencyCardSchema.pre('validate', function(next) {
  if (!this.publicToken || this.publicToken === '') {
    this.publicToken = crypto.randomBytes(32).toString('hex');
  }
  next();
});

module.exports = mongoose.model('EmergencyCard', EmergencyCardSchema);

