const request = require('supertest');
const app = require('../server');
const WellnessEntry = require('../models/WellnessEntry');
const { createAuthenticatedPatient, getAuthToken } = require('./utils/testHelpers');

describe('Patient API', () => {
  describe('GET /api/patients/:id/dashboard', () => {
    it('should get patient dashboard data', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      const res = await request(app)
        .get(`/api/patients/${user._id}/dashboard`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.patient).toBeDefined();
      expect(res.body.data.todayEntry).toBeDefined();
      expect(res.body.data.healthTip).toBeDefined();
    });

    it('should reject access without authentication', async () => {
      const res = await request(app)
        .get('/api/patients/123/dashboard')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/patients/:id/goals', () => {
    it('should get patient goals', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      // Create some wellness entries
      await WellnessEntry.create({
        patientId: patient._id,
        steps: 5000,
        sleepHours: 7,
        waterIntake: 2000
      });

      const res = await request(app)
        .get(`/api/patients/${user._id}/goals`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/patients/:id/goals', () => {
    it('should log daily goal successfully', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      const goalData = {
        steps: 8000,
        sleepHours: 8,
        waterIntake: 2500
      };

      const res = await request(app)
        .post(`/api/patients/${user._id}/goals`)
        .set('Authorization', `Bearer ${token}`)
        .send(goalData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.steps).toBe(8000);
      expect(res.body.data.sleepHours).toBe(8);
      expect(res.body.data.score).toBeGreaterThan(0);
    });

    it('should update existing goal for the same day', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      // Create initial entry
      await WellnessEntry.create({
        patientId: patient._id,
        steps: 5000,
        sleepHours: 7,
        waterIntake: 2000
      });

      // Update with new values
      const res = await request(app)
        .post(`/api/patients/${user._id}/goals`)
        .set('Authorization', `Bearer ${token}`)
        .send({ steps: 10000 })
        .expect(200);

      expect(res.body.data.steps).toBe(10000);
    });
  });

  describe('GET /api/patients/:id/profile', () => {
    it('should get patient profile', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      const res = await request(app)
        .get(`/api/patients/${user._id}/profile`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBeDefined();
    });
  });

  describe('PUT /api/patients/:id/profile', () => {
    it('should update patient profile', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      const updateData = {
        allergies: ['Peanuts', 'Dust'],
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'John Doe',
          phone: '123-456-7890',
          relationship: 'Spouse'
        }
      };

      const res = await request(app)
        .put(`/api/patients/${user._id}/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.allergies).toHaveLength(2);
      expect(res.body.data.bloodGroup).toBe('O+');
    });
  });
});

