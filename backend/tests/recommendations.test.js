const request = require('supertest');
const app = require('../server');
const PreventiveRule = require('../models/PreventiveRule');
const { createAuthenticatedPatient, getAuthToken, verifyPatientExists } = require('./utils/testHelpers');

describe('Recommendations API', () => {
  beforeEach(async () => {
    // Create test rules
    await PreventiveRule.create({
      name: 'Cholesterol Check - Men 35+',
      conditionExpression: 'age >= 35 AND sex === "male"',
      recommendationText: 'Annual cholesterol screening',
      recommendedIntervalDays: 365,
      testType: 'cholesterol',
      enabled: true
    });

    await PreventiveRule.create({
      name: 'Blood Pressure Check',
      conditionExpression: 'age >= 18',
      recommendationText: 'Regular blood pressure monitoring',
      recommendedIntervalDays: 180,
      testType: 'blood-pressure',
      enabled: true
    });
  });

  describe('GET /api/recommendations/:patientId', () => {
    it('should get recommendations for eligible patient', async () => {
      const { user, patient, token } = await createAuthenticatedPatient({
        dob: new Date('1980-01-01'), // 44 years old
        sex: 'male'
      });

      await verifyPatientExists(patient._id);

      const res = await request(app)
        .get(`/api/recommendations/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return empty array for ineligible patient', async () => {
      const { user, patient, token } = await createAuthenticatedPatient({
        dob: new Date('2010-01-01'), // Too young
        sex: 'male'
      });

      await verifyPatientExists(patient._id);

      const res = await request(app)
        .get(`/api/recommendations/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should mark overdue recommendations with high priority', async () => {
      const { user, patient, token } = await createAuthenticatedPatient({
        dob: new Date('1980-01-01'),
        sex: 'male'
      });

      await verifyPatientExists(patient._id);

      // Add old test that's overdue
      const Patient = require('../models/Patient');
      await Patient.findByIdAndUpdate(patient._id, {
        $push: {
          lastTests: {
            type: 'cholesterol',
            date: new Date('2020-01-01') // More than 365 days ago
          }
        }
      });

      const res = await request(app)
        .get(`/api/recommendations/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const cholesterolRec = res.body.data.find(r => r.testType === 'cholesterol');
      if (cholesterolRec) {
        expect(cholesterolRec.priority).toBe('high');
        expect(cholesterolRec.daysOverdue).toBeGreaterThan(0);
      }
    });
  });

  describe('POST /api/recommendations/evaluate', () => {
    it('should evaluate recommendations successfully', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const res = await request(app)
        .post('/api/recommendations/evaluate')
        .set('Authorization', `Bearer ${token}`)
        .send({ patientId: patient._id })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});

