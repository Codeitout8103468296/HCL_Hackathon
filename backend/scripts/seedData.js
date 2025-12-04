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
  console.log('🗑️  Clearing existing data...');
  try {
    await EmergencyCard.deleteMany({});
    await Adherence.deleteMany({});
    await SymptomReport.deleteMany({});
    await Advisory.deleteMany({});
    await Reminder.deleteMany({});
    await WellnessEntry.deleteMany({});
    await Patient.deleteMany({});
    await Provider.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

async function seedProviders() {
  console.log(`\n👨‍⚕️  Creating ${CONFIG.NUM_PROVIDERS} providers...`);
  const providers = [];
  
  for (let i = 0; i < CONFIG.NUM_PROVIDERS; i++) {
    const userData = generateUser('provider', i);
    const user = await User.create(userData);
    
    const providerData = generateProvider(user._id);
    const provider = await Provider.create(providerData);
    
    providers.push(provider);
    console.log(`  ✓ Created provider: ${user.name} (${provider.specialization})`);
  }
  
  return providers;
}

async function seedPatients(providers) {
  console.log(`\n👤 Creating ${CONFIG.NUM_PATIENTS} patients...`);
  const patients = [];
  
  for (let i = 0; i < CONFIG.NUM_PATIENTS; i++) {
    const userData = generateUser('patient', i);
    const user = await User.create(userData);
    
    // Assign patient to a random provider
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const patientData = generatePatient(user._id, provider._id);
    const patient = await Patient.create(patientData);
    
    // Update provider's patients array
    provider.patients.push(patient._id);
    await provider.save();
    
    patients.push(patient);
    
    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Created ${i + 1}/${CONFIG.NUM_PATIENTS} patients...`);
    }
  }
  
  console.log(`  ✅ Created ${patients.length} patients`);
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

async function seedAdvisories(providers, patients) {
  console.log(`\n📝 Creating ${CONFIG.NUM_ADVISORIES} advisories...`);
  const advisories = [];
  
  for (let i = 0; i < CONFIG.NUM_ADVISORIES; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const providerPatients = await Patient.find({ assignedProvider: provider._id });
    
    if (providerPatients.length > 0) {
      const patient = providerPatients[Math.floor(Math.random() * providerPatients.length)];
      const advisoryData = generateAdvisory(provider._id, patient._id);
      const advisory = await Advisory.create(advisoryData);
      advisories.push(advisory);
    }
  }
  
  console.log(`  ✅ Created ${advisories.length} advisories`);
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
    
    // Clear existing data
    await clearDatabase();
    
    // Seed providers
    const providers = await seedProviders();
    
    // Seed patients
    const patients = await seedPatients(providers);
    
    // Seed wellness entries
    await seedWellnessEntries(patients);
    
    // Seed reminders
    await seedReminders(patients);
    
    // Seed advisories
    await seedAdvisories(providers, patients);
    
    // Seed symptom reports
    await seedSymptomReports(patients);
    
    // Seed emergency cards
    await seedEmergencyCards(patients);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`👨‍⚕️  Providers: ${providers.length}`);
    console.log(`👤 Patients: ${patients.length}`);
    console.log(`📊 Wellness Entries: ${CONFIG.NUM_WELLNESS_ENTRIES}`);
    console.log(`⏰ Reminders: ${CONFIG.NUM_REMINDERS}`);
    console.log(`📝 Advisories: ${CONFIG.NUM_ADVISORIES}`);
    console.log(`🏥 Symptom Reports: ${CONFIG.NUM_SYMPTOM_REPORTS}`);
    
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

