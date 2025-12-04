const request = require('supertest');
const app = require('../server');
const Advisory = require('../models/Advisory');
const Provider = require('../models/Provider');
const { createAuthenticatedProvider, createAuthenticatedPatient, getAuthToken, verifyPatientExists } = require('./utils/testHelpers');

describe('Advisories API', () => {
  describe('POST /api/advisories', () => {
    it('should create advisory note for assigned patient', async () => {
      const { user: providerUser, provider, token } = await createAuthenticatedProvider();
      const { user: patientUser, patient } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Assign patient to provider
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { patients: patient._id }
      });

      const advisoryData = {
        patientId: patient._id,
        text: 'Please remember to take your medication daily',
        tags: ['medication', 'important']
      };

      const res = await request(app)
        .post('/api/advisories')
        .set('Authorization', `Bearer ${token}`)
        .send(advisoryData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe(advisoryData.text);
      expect(res.body.data.providerId).toBeDefined();
    });

    it('should reject advisory for unassigned patient', async () => {
      const { user: providerUser, provider, token } = await createAuthenticatedProvider();
      const { user: patientUser, patient } = await createAuthenticatedPatient();

      // Don't assign patient

      const res = await request(app)
        .post('/api/advisories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient._id,
          text: 'Test advisory'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should reject advisory creation by non-provider', async () => {
      const { user: patientUser, patient, token } = await createAuthenticatedPatient();

      const res = await request(app)
        .post('/api/advisories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient._id,
          text: 'Test advisory'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/advisories/:patientId', () => {
    it('should get advisories for patient', async () => {
      const { user: providerUser, provider, token: providerToken } = await createAuthenticatedProvider();
      const { user: patientUser, patient, token: patientToken } = await createAuthenticatedPatient();

      // Assign patient
      const Provider = require('../models/Provider');
      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { patients: patient._id }
      });

      // Create advisory
      await Advisory.create({
        providerId: provider._id,
        patientId: patient._id,
        text: 'Test advisory',
        visibleToPatient: true
      });

      const res = await request(app)
        .get(`/api/advisories/${patient._id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should only show visible advisories', async () => {
      const { user: providerUser, provider, token: providerToken } = await createAuthenticatedProvider();
      const { user: patientUser, patient, token: patientToken } = await createAuthenticatedPatient();

      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { patients: patient._id }
      });

      // Create visible and hidden advisories
      await Advisory.create({
        providerId: provider._id,
        patientId: patient._id,
        text: 'Visible advisory',
        visibleToPatient: true
      });

      await Advisory.create({
        providerId: provider._id,
        patientId: patient._id,
        text: 'Hidden advisory',
        visibleToPatient: false
      });

      const res = await request(app)
        .get(`/api/advisories/${patient._id}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].visibleToPatient).toBe(true);
    });
  });

  describe('POST /api/advisories/:id/acknowledge', () => {
    it('should acknowledge advisory successfully', async () => {
      const { user: providerUser, provider, token: providerToken } = await createAuthenticatedProvider();
      const { user: patientUser, patient, token: patientToken } = await createAuthenticatedPatient();

      await Provider.findByIdAndUpdate(provider._id, {
        $addToSet: { patients: patient._id }
      });

      const advisory = await Advisory.create({
        providerId: provider._id,
        patientId: patient._id,
        text: 'Test advisory',
        visibleToPatient: true
      });

      const res = await request(app)
        .post(`/api/advisories/${advisory._id}/acknowledge`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.acknowledgedAt).toBeDefined();
    });
  });
});

