const mongoose = require('mongoose');

const PreventiveRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  conditionExpression: {
    type: String,
    required: true // e.g., "age >= 50 AND sex === 'male'"
  },
  recommendationText: {
    type: String,
    required: true
  },
  recommendedIntervalDays: {
    type: Number,
    required: true
  },
  testType: {
    type: String,
    required: true // e.g., "cholesterol", "blood-pressure", "flu-vaccine"
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

module.exports = mongoose.model('PreventiveRule', PreventiveRuleSchema);

