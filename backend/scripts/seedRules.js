const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PreventiveRule = require('../models/PreventiveRule');

dotenv.config();

const rules = [
  {
    name: 'Cholesterol Check - Men 35+',
    conditionExpression: 'age >= 35 AND sex === "male"',
    recommendationText: 'Annual cholesterol screening recommended for men 35 and older',
    recommendedIntervalDays: 365,
    testType: 'cholesterol',
    enabled: true
  },
  {
    name: 'Cholesterol Check - Women 45+',
    conditionExpression: 'age >= 45 AND sex === "female"',
    recommendationText: 'Annual cholesterol screening recommended for women 45 and older',
    recommendedIntervalDays: 365,
    testType: 'cholesterol',
    enabled: true
  },
  {
    name: 'Blood Pressure Check',
    conditionExpression: 'age >= 18',
    recommendationText: 'Regular blood pressure monitoring recommended',
    recommendedIntervalDays: 180,
    testType: 'blood-pressure',
    enabled: true
  },
  {
    name: 'Flu Vaccine',
    conditionExpression: 'age >= 6',
    recommendationText: 'Annual flu vaccination recommended',
    recommendedIntervalDays: 365,
    testType: 'flu-vaccine',
    enabled: true
  },
  {
    name: 'Diabetes Screening - High Risk',
    conditionExpression: 'age >= 45',
    recommendationText: 'Diabetes screening recommended for adults 45 and older',
    recommendedIntervalDays: 365,
    testType: 'diabetes',
    enabled: true
  },
  {
    name: 'Mammogram - Women 40+',
    conditionExpression: 'age >= 40 AND sex === "female"',
    recommendationText: 'Annual mammogram screening recommended for women 40 and older',
    recommendedIntervalDays: 365,
    testType: 'mammogram',
    enabled: true
  }
];

async function seedRules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_wellness');
    console.log('Connected to MongoDB');

    // Clear existing rules
    await PreventiveRule.deleteMany({});
    console.log('Cleared existing rules');

    // Insert new rules
    await PreventiveRule.insertMany(rules);
    console.log(`Seeded ${rules.length} preventive care rules`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding rules:', error);
    process.exit(1);
  }
}

seedRules();

