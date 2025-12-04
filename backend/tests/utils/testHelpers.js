const User = require('../../models/User');
const Patient = require('../../models/Patient');
const Provider = require('../../models/Provider');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Counter for unique test data
let testCounter = 0;

// Create test user
exports.createTestUser = async (userData = {}) => {
  // Use a more unique email to avoid collisions
  // Combine timestamp, counter, and random number
  testCounter++;
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000000);
  const uniqueId = `${timestamp}_${testCounter}_${random}`;
  
  const defaultUser = {
    email: `test${uniqueId}@test.com`,
    password: 'Test123456',
    name: `Test User ${uniqueId}`,
    role: 'patient',
    consentGiven: true,
    ...userData
  };

  try {
    const user = await User.create(defaultUser);
    // Verify user was created
    const verifyUser = await User.findById(user._id);
    if (!verifyUser) {
      throw new Error('User creation failed - user not found after creation');
    }
    return user;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - retry with new unique ID
      const retryId = `${Date.now()}_${testCounter}_${Math.floor(Math.random() * 10000000)}`;
      const retryUser = {
        ...defaultUser,
        email: `test${retryId}@test.com`,
        name: `Test User ${retryId}`
      };
      return await User.create(retryUser);
    }
    throw error;
  }
};

// Create test patient
exports.createTestPatient = async (userId, patientData = {}) => {
  const defaultPatient = {
    userId,
    dob: new Date('1990-01-01'),
    sex: 'male',
    ...patientData
  };

  return await Patient.create(defaultPatient);
};

// Create test provider
exports.createTestProvider = async (userId, providerData = {}) => {
  const defaultProvider = {
    userId,
    specialization: 'General Practice',
    licenseNumber: 'TEST123',
    ...providerData
  };

  return await Provider.create(defaultProvider);
};

// Get auth token for user
exports.getAuthToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'test_secret_key_for_testing_only';
  // Ensure userId is converted to string for consistent token generation
  const id = userId ? userId.toString() : userId;
  return jwt.sign({ id }, secret, {
    expiresIn: '7d'
  });
};

// Create authenticated user with patient profile
exports.createAuthenticatedPatient = async (patientData = {}) => {
  const user = await exports.createTestUser({ role: 'patient' });
  
  // Ensure user exists and is accessible
  let userCheck = await User.findById(user._id);
  if (!userCheck) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 50));
    userCheck = await User.findById(user._id);
    if (!userCheck) {
      throw new Error('User was not created properly');
    }
  }
  
  const patient = await exports.createTestPatient(user._id, patientData);
  
  // Ensure patient was created
  const patientCheck = await Patient.findById(patient._id);
  if (!patientCheck) {
    throw new Error('Patient was not created properly');
  }
  
  const token = exports.getAuthToken(user._id);
  
  // Verify token is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_for_testing_only');
    if (!decoded.id || decoded.id.toString() !== user._id.toString()) {
      throw new Error('Token does not match user ID');
    }
  } catch (error) {
    throw new Error(`Token validation failed: ${error.message}`);
  }
  
  return { user, patient, token };
};

// Create authenticated provider
exports.createAuthenticatedProvider = async () => {
  const user = await exports.createTestUser({ role: 'provider' });
  
  // Ensure user exists and is accessible
  let userCheck = await User.findById(user._id);
  if (!userCheck) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 50));
    userCheck = await User.findById(user._id);
    if (!userCheck) {
      throw new Error('User was not created properly');
    }
  }
  
  const provider = await exports.createTestProvider(user._id);
  
  // Ensure provider was created
  const providerCheck = await Provider.findById(provider._id);
  if (!providerCheck) {
    throw new Error('Provider was not created properly');
  }
  
  const token = exports.getAuthToken(user._id);
  
  // Verify token is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_for_testing_only');
    if (!decoded.id || decoded.id.toString() !== user._id.toString()) {
      throw new Error('Token does not match user ID');
    }
  } catch (error) {
    throw new Error(`Token validation failed: ${error.message}`);
  }
  
  return { user, provider, token };
};

// Helper to verify patient exists before API calls
exports.verifyPatientExists = async (patientId) => {
  const Patient = require('../../models/Patient');
  const verifyPatient = await Patient.findById(patientId);
  if (!verifyPatient) {
    // Wait and retry once
    await new Promise(resolve => setTimeout(resolve, 100));
    const retryPatient = await Patient.findById(patientId);
    if (!retryPatient) {
      throw new Error('Patient not found after creation');
    }
    return retryPatient;
  }
  return verifyPatient;
};

// Helper to verify provider exists before API calls
exports.verifyProviderExists = async (providerId) => {
  const Provider = require('../../models/Provider');
  const verifyProvider = await Provider.findById(providerId);
  if (!verifyProvider) {
    // Wait and retry once
    await new Promise(resolve => setTimeout(resolve, 100));
    const retryProvider = await Provider.findById(providerId);
    if (!retryProvider) {
      throw new Error('Provider not found after creation');
    }
    return retryProvider;
  }
  return verifyProvider;
};

