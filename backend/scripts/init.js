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
    
    // Always ensure admin user exists (create or update)
    console.log('\n👤 Ensuring admin user exists...');
    const adminEmail = 'admin@example.com';
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      adminUser = await User.create({
        email: adminEmail,
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        consentGiven: true
      });
      console.log('✅ Admin user created:', adminEmail);
    } else {
      // Update existing admin user to ensure correct role and password
      adminUser.role = 'admin';
      adminUser.consentGiven = true;
      // Force password update by marking as modified
      adminUser.password = 'admin123';
      adminUser.markModified('password');
      await adminUser.save();
      console.log('✅ Admin user verified/updated:', adminEmail);
    }
    
    // Only seed data if database is empty
    const hasExistingData = await hasData();
    if (!hasExistingData) {
      console.log('\n🌱 Database is empty. Starting initialization...\n');
      console.log('📌 Note: All seed data will be associated with admin user');
      
      // Seed preventive rules first
      console.log('\n📋 Seeding preventive care rules...');
      await seedRulesScript();
      
      // Wait a bit for rules to be saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then seed synthetic data (will preserve admin user and assign all data to admin)
      console.log('\n📊 Seeding synthetic data (all data for admin)...');
      await seedDataScript();
      
      console.log('\n✨ Database initialization completed successfully!');
      console.log('\n🔑 Admin Login Credentials:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   All patients, providers, and data are accessible via admin account`);
    } else {
      console.log('\n✅ Database already has data. Skipping seed.');
      console.log(`\n🔑 Admin Login Credentials:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
    }
    
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

