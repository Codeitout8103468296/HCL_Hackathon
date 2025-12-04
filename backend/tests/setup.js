// Set test environment variables BEFORE any other modules are loaded
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/healthcare_wellness_test';
process.env.FRONTEND_URL = 'http://localhost:3000';

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load test environment variables (won't override already set vars)
dotenv.config({ path: '.env.test', override: false });

// Connect to test database
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI;
  try {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Test database connected');
    
    // Ensure indexes are built
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    console.error('Test database connection error:', error);
    throw error;
  }
});

// Clear database after each test
afterEach(async () => {
  try {
    // Wait for any pending operations to complete
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
    }
    
    // Get all collection names
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Delete collections in proper order to handle dependencies
    // Delete child collections first, then parent collections
    const deleteOrder = [
      'adherences', 'reminders', 'symptomreports', 'advisories', 
      'emergencycards', 'wellnessentries', 'preventiverules',
      'patients', 'providers', 'users'
    ];
    
    // Delete in specified order
    for (const collectionName of deleteOrder) {
      if (collectionNames.includes(collectionName)) {
        try {
          await db.collection(collectionName).deleteMany({});
        } catch (err) {
          // Ignore errors
        }
      }
    }
    
    // Delete any remaining collections
    for (const collectionName of collectionNames) {
      if (!deleteOrder.includes(collectionName)) {
        try {
          await db.collection(collectionName).deleteMany({});
        } catch (err) {
          // Ignore errors
        }
      }
    }
    
    // Wait for all delete operations to complete
    await mongoose.connection.db.admin().ping();
    
    // Small delay to ensure cleanup completes and indexes are ready
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (error) {
    // Ignore cleanup errors in test mode
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error);
  }
});

