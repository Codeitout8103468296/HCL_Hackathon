/**
 * Initialization Script
 * Checks if database is empty and seeds initial data if needed
 * Runs automatically on first backend setup
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const PreventiveRule = require('../models/PreventiveRule');

const seedRulesScript = require('./seedRules');
const seedDataScript = require('./seedData');

/**
 * Check if database has any data
 */
async function hasData() {
  try {
    const userCount = await User.countDocuments();
    const ruleCount = await PreventiveRule.countDocuments();
    
    // Consider database initialized if we have users or rules
    return userCount > 0 || ruleCount > 0;
  } catch (error) {
    // If error, assume database is empty
    return false;
  }
}

/**
 * Initialize database with seed data
 */
async function initialize() {
  try {
    // Hardcoded MongoDB URI
    const mongoUri = 'mongodb://localhost:27017/healthcare_wellness';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('📦 Connected to MongoDB for initialization');
    }
    
    // Check if database already has data
    const dataExists = await hasData();
    
    if (dataExists) {
      console.log('✅ Database already initialized. Skipping seed scripts.');
      return false; // Already initialized
    }
    
    console.log('\n🌱 Database is empty. Starting initialization...\n');
    
    // Seed preventive rules first
    console.log('📋 Seeding preventive care rules...');
    await seedRulesScript();
    
    // Wait a bit for rules to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then seed synthetic data
    console.log('\n📊 Seeding synthetic data...');
    await seedDataScript();
    
    console.log('\n✨ Database initialization completed successfully!');
    return true; // Successfully initialized
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  initialize()
    .then((initialized) => {
      if (initialized) {
        console.log('\n🎉 Backend is ready to use!');
      }
      // Only disconnect if called directly (not from server.js)
      if (mongoose.connection.readyState !== 0) {
        mongoose.disconnect();
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize:', error);
      if (mongoose.connection.readyState !== 0) {
        mongoose.disconnect();
      }
      process.exit(1);
    });
}

module.exports = initialize;

