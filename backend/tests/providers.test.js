const request = require('supertest');
const app = require('../server');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const WellnessEntry = require('../models/WellnessEntry');
const { createAuthenticatedProvider, createAuthenticatedPatient, getAuthToken, verifyPatientExists } = require('./utils/testHelpers');

describe('Provider API', () => {
  describe('GET /api/providers/:id/patients', () => {
    it('should get assigned patients for provider', async () => {
      const { user: providerUser, provider, token } = await createAuthenticatedProvider();
      const { user: patientUser, patient } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Assign patient to provider
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { patients: patient._id }
      });
      await Patient.findByIdAndUpdate(patient._id, {
        assignedProvider: provider._id
      });

      // Create wellness entry for compliance check
      await WellnessEntry.create({
        patientId: patient._id,
        steps: 5000,
        sleepHours: 7,
        waterIntake: 2000
      });

      const res = await request(app)
        .get(`/api/providers/${providerUser._id}/patients`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].complianceStatus).toBeDefined();
      expect(res.body.data[0].wellnessScore).toBeDefined();
    });

    it('should reject access for non-provider role', async () => {
      const { user: patientUser, token } = await createAuthenticatedPatient();

      const res = await request(app)
        .get(`/api/providers/${patientUser._id}/patients`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/providers/:id/patients/:patientId/compliance', () => {
    it('should get patient compliance data', async () => {
      const { user: providerUser, provider, token } = await createAuthenticatedProvider();
      const { user: patientUser, patient } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Assign patient to provider
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { patients: patient._id }
      });

      // Create wellness entries
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        await WellnessEntry.create({
          patientId: patient._id,
          date,
          steps: 5000 + i * 500,
          sleepHours: 7,
          waterIntake: 2000
        });
      }

      const res = await request(app)
        .get(`/api/providers/${providerUser._id}/patients/${patient._id}/compliance`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.patient).toBeDefined();
      expect(res.body.data.goalsOverview).toBeDefined();
      expect(res.body.data.complianceStatus).toBeDefined();
    });

    it('should reject access for unassigned patient', async () => {
      const { user: providerUser, provider, token } = await createAuthenticatedProvider();
      const { user: patientUser, patient } = await createAuthenticatedPatient();

      // Don't assign patient to provider

      const res = await request(app)
        .get(`/api/providers/${providerUser._id}/patients/${patient._id}/compliance`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});

