const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const { createTestUser, getAuthToken } = require('./utils/testHelpers');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new patient successfully', async () => {
      const userData = {
        email: 'patient@test.com',
        password: 'Test123456',
        name: 'Test Patient',
        role: 'patient',
        consentGiven: true,
        dob: '1990-01-01',
        sex: 'male'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.role).toBe('patient');

      // Verify patient profile was created
      const patient = await Patient.findOne({ userId: res.body.user.id });
      expect(patient).toBeDefined();
      expect(patient.sex).toBe('male');
    });

    it('should register a new provider successfully', async () => {
      const userData = {
        email: 'provider@test.com',
        password: 'Test123456',
        name: 'Test Provider',
        role: 'provider',
        consentGiven: true,
        specialization: 'Cardiology',
        licenseNumber: 'PROV123'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('provider');

      // Verify provider profile was created
      const provider = await Provider.findOne({ userId: res.body.user.id });
      expect(provider).toBeDefined();
    });

    it('should reject registration without consent', async () => {
      const userData = {
        email: 'noconsent@test.com',
        password: 'Test123456',
        name: 'No Consent',
        consentGiven: false
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Consent');
    });

    it('should reject duplicate email registration', async () => {
      await createTestUser({ email: 'duplicate@test.com' });

      const userData = {
        email: 'duplicate@test.com',
        password: 'Test123456',
        name: 'Duplicate',
        consentGiven: true
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = await createTestUser({
        email: 'login@test.com',
        password: 'Test123456'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'Test123456'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('login@test.com');
    });

    it('should reject login with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test123456'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      await createTestUser({
        email: 'wrongpass@test.com',
        password: 'Test123456'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@test.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user._id);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(user.email);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const user = await createTestUser();
      const token = getAuthToken(user._id);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logged out');
    });
  });
});

