const request = require('supertest');
const app = require('../server');
const SymptomReport = require('../models/SymptomReport');
const { createAuthenticatedPatient, getAuthToken, verifyPatientExists } = require('./utils/testHelpers');

describe('Symptoms API', () => {
  describe('POST /api/symptoms/report', () => {
    it('should submit symptom report and get emergency recommendation', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      const symptomData = {
        patientId: patient._id,
        symptoms: [
          { name: 'chest pain', severity: 9 },
          { name: 'shortness of breath', severity: 8 }
        ]
      };

      const res = await request(app)
        .post('/api/symptoms/report')
        .set('Authorization', `Bearer ${token}`)
        .send(symptomData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendation).toBe('emergency');
      expect(res.body.data.urgencyLevel).toBe('critical');
      expect(res.body.disclaimer).toBeDefined();
    });

    it('should submit symptom report and get see-gp recommendation', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const symptomData = {
        patientId: patient._id,
        symptoms: [
          { name: 'fever', severity: 7 },
          { name: 'cough', severity: 6 }
        ]
      };

      const res = await request(app)
        .post('/api/symptoms/report')
        .set('Authorization', `Bearer ${token}`)
        .send(symptomData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendation).toBe('see-gp');
      expect(['high', 'medium']).toContain(res.body.data.urgencyLevel);
    });

    it('should submit symptom report and get self-care recommendation', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const symptomData = {
        patientId: patient._id,
        symptoms: [
          { name: 'headache', severity: 4 },
          { name: 'fatigue', severity: 3 }
        ]
      };

      const res = await request(app)
        .post('/api/symptoms/report')
        .set('Authorization', `Bearer ${token}`)
        .send(symptomData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recommendation).toBe('self-care');
      expect(res.body.data.urgencyLevel).toBe('low');
    });
  });

  describe('GET /api/symptoms/history/:patientId', () => {
    it('should get symptom history', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Create symptom reports
      await SymptomReport.create({
        patientId: patient._id,
        symptoms: [{ name: 'fever', severity: 7 }],
        recommendation: 'see-gp',
        urgencyLevel: 'high'
      });

      await SymptomReport.create({
        patientId: patient._id,
        symptoms: [{ name: 'headache', severity: 4 }],
        recommendation: 'self-care',
        urgencyLevel: 'low'
      });

      const res = await request(app)
        .get(`/api/symptoms/history/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].timestamp).toBeDefined();
    });

    it('should limit history to 30 records', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Create more than 30 reports
      for (let i = 0; i < 35; i++) {
        await SymptomReport.create({
          patientId: patient._id,
          symptoms: [{ name: 'test', severity: 5 }],
          recommendation: 'self-care',
          urgencyLevel: 'low'
        });
      }

      const res = await request(app)
        .get(`/api/symptoms/history/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(30);
    });
  });
});

