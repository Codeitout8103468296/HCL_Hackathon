const request = require('supertest');
const app = require('../server');
const EmergencyCard = require('../models/EmergencyCard');
const { createAuthenticatedPatient, getAuthToken, verifyPatientExists } = require('./utils/testHelpers');

describe('Emergency Card API', () => {
  describe('POST /api/patients/:id/emergency-card', () => {
    it('should generate emergency card successfully', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      // Update patient with emergency info
      const Patient = require('../models/Patient');
      await Patient.findByIdAndUpdate(patient._id, {
        bloodGroup: 'O+',
        allergies: ['Peanuts'],
        emergencyContact: {
          name: 'John Doe',
          phone: '123-456-7890',
          relationship: 'Spouse'
        }
      });

      const cardData = {
        fields: {
          name: true,
          bloodGroup: true,
          allergies: true,
          emergencyContact: true
        },
        isPublic: true
      };

      const res = await request(app)
        .post(`/api/patients/${user._id}/emergency-card`)
        .set('Authorization', `Bearer ${token}`)
        .send(cardData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.emergencyCard.publicToken).toBeDefined();
      expect(res.body.data.qrCode).toBeDefined();
      expect(res.body.data.publicUrl).toBeDefined();
    });

    it('should update existing emergency card', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Create initial card
      const card = await EmergencyCard.create({
        patientId: patient._id,
        publicToken: 'test-token-123',
        isPublic: false
      });

      const updateData = {
        isPublic: true
      };

      const res = await request(app)
        .post(`/api/patients/${user._id}/emergency-card`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.emergencyCard.isPublic).toBe(true);
    });
  });

  describe('GET /emergency/:publicToken', () => {
    it('should get public emergency card data', async () => {
      const { user, patient } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const Patient = require('../models/Patient');
      await Patient.findByIdAndUpdate(patient._id, {
        bloodGroup: 'A+',
        allergies: ['Dust', 'Pollen'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '987-654-3210'
        }
      });

      const card = await EmergencyCard.create({
        patientId: patient._id,
        publicToken: 'public-test-token',
        fields: {
          name: true,
          bloodGroup: true,
          allergies: true,
          emergencyContact: true
        },
        isPublic: true
      });

      const res = await request(app)
        .get(`/emergency/${card.publicToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBeDefined();
      expect(res.body.data.bloodGroup).toBe('A+');
      expect(res.body.data.allergies).toBeInstanceOf(Array);
      expect(res.body.data.emergencyContact).toBeDefined();
    });

    it('should return 404 for non-public card', async () => {
      const { user, patient } = await createAuthenticatedPatient();

      const card = await EmergencyCard.create({
        patientId: patient._id,
        publicToken: 'private-token',
        isPublic: false
      });

      const res = await request(app)
        .get(`/emergency/${card.publicToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should only return allowed fields', async () => {
      const { user, patient } = await createAuthenticatedPatient();

      const Patient = require('../models/Patient');
      await Patient.findByIdAndUpdate(patient._id, {
        bloodGroup: 'B+',
        allergies: ['Peanuts']
      });

      const card = await EmergencyCard.create({
        patientId: patient._id,
        publicToken: 'limited-token',
        fields: {
          name: true,
          bloodGroup: false, // Not allowed
          allergies: true,
          emergencyContact: false // Not allowed
        },
        isPublic: true
      });

      const res = await request(app)
        .get(`/emergency/${card.publicToken}`)
        .expect(200);

      expect(res.body.data.name).toBeDefined();
      expect(res.body.data.bloodGroup).toBeUndefined();
      expect(res.body.data.allergies).toBeDefined();
      expect(res.body.data.emergencyContact).toBeUndefined();
    });
  });
});

