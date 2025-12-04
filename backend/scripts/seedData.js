/**
 * Seed Script for Synthetic Data Generation
 * Generates 50-60+ synthetic entries for testing and development
 * 
 * Usage: node scripts/seedData.js
 * Or: npm run seed:data
 */

require('dotenv').config();

// Hardcoded MongoDB URI
const MONGODB_URI = 'mongodb://localhost:27017/healthcare_wellness';

const mongoose = require('mongoose');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const WellnessEntry = require('../models/WellnessEntry');
const { Reminder, Adherence } = require('../models/Reminder');
const Advisory = require('../models/Advisory');
const SymptomReport = require('../models/SymptomReport');
const EmergencyCard = require('../models/EmergencyCard');

const {
  generateUser,
  generatePatient,
  generateProvider,
  generateWellnessEntry,
  generateReminder,
  generateAdvisory,
  generateSymptomReport
} = require('./helpers/mockDataGenerator');

// Configuration
const CONFIG = {
  NUM_PROVIDERS: 6,
  NUM_PATIENTS: 45,
  NUM_WELLNESS_ENTRIES: 60, // Multiple entries per patient
  NUM_REMINDERS: 25,
  NUM_ADVISORIES: 18,
  NUM_SYMPTOM_REPORTS: 12,
  WELLNESS_ENTRIES_PER_PATIENT: 3 // Average entries per patient
};

async function clearDatabase() {
  console.log('🗑️  Clearing existing data (preserving admin user)...');
  try {
    // Get admin user before clearing
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    await EmergencyCard.deleteMany({});
    await Adherence.deleteMany({});
    await SymptomReport.deleteMany({});
    await Advisory.deleteMany({});
    await Reminder.deleteMany({});
    await WellnessEntry.deleteMany({});
    await Patient.deleteMany({});
    await Provider.deleteMany({});
    // Delete all users EXCEPT admin
    if (adminUser) {
      await User.deleteMany({ _id: { $ne: adminUser._id } });
    } else {
      await User.deleteMany({});
    }
    console.log('✅ Database cleared (admin user preserved)');
    return adminUser;
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

async function seedProviders(adminUser) {
  console.log(`\n👨‍⚕️  Creating provider profile for admin and ${CONFIG.NUM_PROVIDERS - 1} additional providers...`);
  const providers = [];
  
  // First, create provider profile for admin user
  let adminProvider = await Provider.findOne({ userId: adminUser._id });
  if (!adminProvider) {
    adminProvider = await Provider.create({
      userId: adminUser._id,
      specialization: 'System Administrator',
      licenseNumber: 'ADMIN-001'
    });
    console.log(`  ✓ Created admin provider profile: ${adminUser.name}`);
  } else {
    console.log(`  ✓ Using existing admin provider profile: ${adminUser.name}`);
  }
  providers.push(adminProvider);
  
  // Create additional providers
  for (let i = 0; i < CONFIG.NUM_PROVIDERS - 1; i++) {
    const userData = generateUser('provider', i);
    const user = await User.create(userData);
    
    const providerData = generateProvider(user._id);
    const provider = await Provider.create(providerData);
    
    providers.push(provider);
    console.log(`  ✓ Created provider: ${user.name} (${provider.specialization})`);
  }
  
  return providers;
}

async function seedPatients(providers, adminProvider) {
  console.log(`\n👤 Creating ${CONFIG.NUM_PATIENTS} patients (all assigned to admin)...`);
  const patients = [];
  
  for (let i = 0; i < CONFIG.NUM_PATIENTS; i++) {
    const userData = generateUser('patient', i);
    const user = await User.create(userData);
    
    // Assign ALL patients to admin provider
    const patientData = generatePatient(user._id, adminProvider._id);
    const patient = await Patient.create(patientData);
    
    // Update admin provider's patients array
    adminProvider.patients.push(patient._id);
    await adminProvider.save();
    
    patients.push(patient);
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Created ${i + 1}/${CONFIG.NUM_PATIENTS} patients (assigned to admin)...`);
    }
  }
  
  console.log(`  ✅ Created ${patients.length} patients (all assigned to admin)`);
  return patients;
}

async function seedWellnessEntries(patients) {
  console.log(`\n📊 Creating ${CONFIG.NUM_WELLNESS_ENTRIES} wellness entries...`);
  const entries = [];
  
  for (let i = 0; i < CONFIG.NUM_WELLNESS_ENTRIES; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
    const entryData = generateWellnessEntry(patient._id, daysAgo);
    const entry = await WellnessEntry.create(entryData);
    entries.push(entry);
  }
  
  console.log(`  ✅ Created ${entries.length} wellness entries`);
  return entries;
}

async function seedReminders(patients) {
  console.log(`\n⏰ Creating ${CONFIG.NUM_REMINDERS} reminders...`);
  const reminders = [];
  
  for (let i = 0; i < CONFIG.NUM_REMINDERS; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const reminderData = generateReminder(patient._id);
    const reminder = await Reminder.create(reminderData);
    reminders.push(reminder);
    
    // Create some adherence records for this reminder
    if (Math.random() > 0.5) {
      const adherenceCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < adherenceCount; j++) {
        await Adherence.create({
          reminderId: reminder._id,
          patientId: patient._id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
          status: Math.random() > 0.2 ? 'taken' : 'missed'
        });
      }
    }
  }
  
  console.log(`  ✅ Created ${reminders.length} reminders`);
  return reminders;
}

async function seedAdvisories(adminProvider, patients) {
  console.log(`\n📝 Creating ${CONFIG.NUM_ADVISORIES} advisories (all from admin)...`);
  const advisories = [];
  
  for (let i = 0; i < CONFIG.NUM_ADVISORIES; i++) {
    // All advisories from admin provider
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const advisoryData = generateAdvisory(adminProvider._id, patient._id);
    const advisory = await Advisory.create(advisoryData);
    advisories.push(advisory);
  }
  
  console.log(`  ✅ Created ${advisories.length} advisories (all from admin)`);
  return advisories;
}

async function seedSymptomReports(patients) {
  console.log(`\n🏥 Creating ${CONFIG.NUM_SYMPTOM_REPORTS} symptom reports...`);
  const reports = [];
  
  for (let i = 0; i < CONFIG.NUM_SYMPTOM_REPORTS; i++) {
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const reportData = generateSymptomReport(patient._id);
    const report = await SymptomReport.create(reportData);
    reports.push(report);
  }
  
  console.log(`  ✅ Created ${reports.length} symptom reports`);
  return reports;
}

async function seedEmergencyCards(patients) {
  console.log(`\n🚨 Creating emergency cards for patients...`);
  const cards = [];
  
  for (const patient of patients) {
    // Only create cards for 70% of patients
    if (Math.random() > 0.3) {
      const card = await EmergencyCard.create({
        patientId: patient._id,
        isPublic: Math.random() > 0.5 // 50% public
      });
      cards.push(card);
    }
  }
  
  console.log(`  ✅ Created ${cards.length} emergency cards`);
  return cards;
}

async function seed() {
  try {
    // Connect to database only if not already connected
    if (mongoose.connection.readyState === 0) {
      // Use hardcoded URI directly
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    }
    
    console.log('\n🌱 Starting data seeding process...\n');
    
    // Get or ensure admin user exists
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        consentGiven: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user found:', adminUser.email);
    }
    
    // Clear existing data (preserving admin)
    const preservedAdmin = await clearDatabase();
    // Use preserved admin if available, otherwise use the one we found/created
    if (preservedAdmin) {
      adminUser = preservedAdmin;
    }
    
    // Seed providers (admin will be the first provider)
    const providers = await seedProviders(adminUser);
    const adminProvider = providers[0]; // Admin is always first
    
    // Seed patients (all assigned to admin)
    const patients = await seedPatients(providers, adminProvider);
    
    // Seed wellness entries
    await seedWellnessEntries(patients);
    
    // Seed reminders
    await seedReminders(patients);
    
    // Seed advisories (all from admin)
    await seedAdvisories(adminProvider, patients);
    
    // Seed symptom reports
    await seedSymptomReports(patients);
    
    // Seed emergency cards
    await seedEmergencyCards(patients);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`👨‍⚕️  Providers: ${providers.length} (Admin + ${providers.length - 1} others)`);
    console.log(`👤 Patients: ${patients.length} (ALL assigned to admin)`);
    console.log(`📊 Wellness Entries: ${CONFIG.NUM_WELLNESS_ENTRIES}`);
    console.log(`⏰ Reminders: ${CONFIG.NUM_REMINDERS}`);
    console.log(`📝 Advisories: ${CONFIG.NUM_ADVISORIES} (ALL from admin)`);
    console.log(`🏥 Symptom Reports: ${CONFIG.NUM_SYMPTOM_REPORTS}`);
    console.log(`\n🔑 Admin Credentials:`);
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123`);
    console.log(`   Role: admin`);
    console.log(`   Patients Assigned: ${adminProvider.patients.length}`);
    
    const totalEntries = providers.length + patients.length + CONFIG.NUM_WELLNESS_ENTRIES + 
                         CONFIG.NUM_REMINDERS + CONFIG.NUM_ADVISORIES + CONFIG.NUM_SYMPTOM_REPORTS;
    console.log(`\n✅ Total entries created: ${totalEntries}+`);
    console.log('='.repeat(50));
    
    console.log('\n✨ Seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed data:', error);
      process.exit(1);
    });
}

module.exports = seed;

