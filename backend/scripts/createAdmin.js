/**
 * Script to create or update admin user
 * Run with: node backend/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Hardcoded MongoDB URI
    const mongoUri = 'mongodb://localhost:27017/healthcare_wellness';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    // Try to find existing admin user (with password field)
    let adminUser = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminUser) {
      // Create new admin user
      adminUser = await User.create({
        email: adminEmail,
        password: adminPassword,
        name: 'System Administrator',
        role: 'admin',
        consentGiven: true
      });
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      // Update existing user
      adminUser.role = 'admin';
      adminUser.consentGiven = true;
      adminUser.name = 'System Administrator';
      // Update password
      adminUser.password = adminPassword;
      adminUser.markModified('password');
      await adminUser.save();
      console.log('✅ Admin user updated successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }
    
    // Verify the user can be found and password works
    const verifyUser = await User.findOne({ email: adminEmail }).select('+password');
    if (verifyUser) {
      const passwordMatch = await verifyUser.matchPassword(adminPassword);
      if (passwordMatch) {
        console.log('✅ Password verification successful!');
      } else {
        console.log('❌ Password verification failed!');
      }
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Admin user setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();

