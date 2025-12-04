const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dob: {
    type: Date,
    required: true
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [{
    type: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  conditions: [{
    type: String
  }],
  lastTests: [{
    type: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }],
  immunizations: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  assignedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', PatientSchema);

