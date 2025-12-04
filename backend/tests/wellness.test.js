const request = require('supertest');
const app = require('../server');
const WellnessEntry = require('../models/WellnessEntry');
const { createAuthenticatedPatient, getAuthToken } = require('./utils/testHelpers');

describe('Wellness API', () => {
  describe('GET /api/wellness/:patientId', () => {
    it('should get wellness data with default 7d range', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      // Create some wellness entries
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        await WellnessEntry.create({
          patientId: patient._id,
          date,
          steps: 5000 + i * 1000,
          sleepHours: 7,
          waterIntake: 2000
        });
      }

      const res = await request(app)
        .get(`/api/wellness/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.entries).toBeInstanceOf(Array);
      expect(res.body.data.averages).toBeDefined();
      expect(res.body.data.currentScore).toBeDefined();
    });

    it('should get wellness data with 30d range', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      const res = await request(app)
        .get(`/api/wellness/${patient._id}?range=30d`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/wellness', () => {
    it('should submit wellness entry successfully', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      const wellnessData = {
        patientId: patient._id,
        steps: 10000,
        sleepHours: 8,
        waterIntake: 3000,
        preventiveComplianceScore: 25
      };

      const res = await request(app)
        .post('/api/wellness')
        .set('Authorization', `Bearer ${token}`)
        .send(wellnessData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.steps).toBe(10000);
      expect(res.body.data.score).toBeGreaterThan(0);
      expect(res.body.data.score).toBeLessThanOrEqual(100);
    });

    it('should calculate wellness score correctly', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      // Test with maximum values
      const wellnessData = {
        patientId: patient._id,
        steps: 10000, // 40 points
        sleepHours: 8, // 30 points
        preventiveComplianceScore: 30 // 30 points
      };

      const res = await request(app)
        .post('/api/wellness')
        .set('Authorization', `Bearer ${token}`)
        .send(wellnessData)
        .expect(201);

      // Should be close to 100 (allowing for rounding)
      expect(res.body.data.score).toBeGreaterThan(95);
    });

    it('should update existing entry for the same day', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Verify patient exists
      const Patient = require('../models/Patient');
      const verifyPatient = await Patient.findById(patient._id);
      if (!verifyPatient) {
        throw new Error('Patient not found after creation');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await WellnessEntry.create({
        patientId: patient._id,
        date: today,
        steps: 5000,
        sleepHours: 7,
        waterIntake: 2000
      });

      const res = await request(app)
        .post('/api/wellness')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient._id,
          steps: 8000
        })
        .expect(201);

      expect(res.body.data.steps).toBe(8000);
    });
  });
});

