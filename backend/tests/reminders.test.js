const request = require('supertest');
const app = require('../server');
const { Reminder, Adherence } = require('../models/Reminder');
const { createAuthenticatedPatient, getAuthToken, verifyPatientExists } = require('./utils/testHelpers');

describe('Reminders API', () => {
  describe('POST /api/reminders', () => {
    it('should create reminder successfully', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      const reminderData = {
        patientId: patient._id,
        type: 'medication',
        text: 'Take blood pressure medication',
        schedule: {
          times: ['09:00', '21:00']
        }
      };

      const res = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${token}`)
        .send(reminderData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('medication');
      expect(res.body.data.schedule.times).toHaveLength(2);
      expect(res.body.data.enabled).toBe(true);
    });

    it('should create water reminder', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const reminderData = {
        patientId: patient._id,
        type: 'water',
        text: 'Drink water',
        schedule: {
          times: ['08:00', '12:00', '16:00', '20:00']
        }
      };

      const res = await request(app)
        .post('/api/reminders')
        .set('Authorization', `Bearer ${token}`)
        .send(reminderData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('water');
    });
  });

  describe('GET /api/reminders/:patientId', () => {
    it('should get patient reminders', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      // Create reminders
      await Reminder.create({
        patientId: patient._id,
        type: 'medication',
        text: 'Test reminder 1',
        schedule: { times: ['09:00'] }
      });

      await Reminder.create({
        patientId: patient._id,
        type: 'water',
        text: 'Test reminder 2',
        schedule: { times: ['12:00'] }
      });

      const res = await request(app)
        .get(`/api/reminders/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.reminders).toBeInstanceOf(Array);
      expect(res.body.data.reminders.length).toBe(2);
      expect(res.body.data.todayAdherence).toBeDefined();
    });

    it('should only return enabled reminders', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      await Reminder.create({
        patientId: patient._id,
        type: 'medication',
        text: 'Enabled reminder',
        schedule: { times: ['09:00'] },
        enabled: true
      });

      await Reminder.create({
        patientId: patient._id,
        type: 'medication',
        text: 'Disabled reminder',
        schedule: { times: ['10:00'] },
        enabled: false
      });

      const res = await request(app)
        .get(`/api/reminders/${patient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.reminders.length).toBe(1);
      expect(res.body.data.reminders[0].enabled).toBe(true);
    });
  });

  describe('POST /api/reminders/:id/mark', () => {
    it('should mark reminder as taken', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const reminder = await Reminder.create({
        patientId: patient._id,
        type: 'medication',
        text: 'Test reminder',
        schedule: { times: ['09:00'] }
      });

      const res = await request(app)
        .post(`/api/reminders/${reminder._id}/mark`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'taken' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('taken');
      expect(res.body.data.timestamp).toBeDefined();
    });

    it('should mark reminder as missed', async () => {
      const { user, patient, token } = await createAuthenticatedPatient();

      await verifyPatientExists(patient._id);

      const reminder = await Reminder.create({
        patientId: patient._id,
        type: 'medication',
        text: 'Test reminder',
        schedule: { times: ['09:00'] }
      });

      const res = await request(app)
        .post(`/api/reminders/${reminder._id}/mark`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'missed' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('missed');
    });
  });
});

