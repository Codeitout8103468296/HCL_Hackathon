const request = require('supertest');
const app = require('../server');
const PreventiveRule = require('../models/PreventiveRule');
const { createAuthenticatedProvider, getAuthToken, verifyProviderExists } = require('./utils/testHelpers');

describe('Rules API', () => {
  describe('POST /api/rules', () => {
    it('should create preventive care rule', async () => {
      const { user, provider, token } = await createAuthenticatedProvider();

      await verifyProviderExists(provider._id);

      const ruleData = {
        name: 'Test Rule',
        conditionExpression: 'age >= 50',
        recommendationText: 'Test recommendation',
        recommendedIntervalDays: 365,
        testType: 'test-type',
        enabled: true
      };

      const res = await request(app)
        .post('/api/rules')
        .set('Authorization', `Bearer ${token}`)
        .send(ruleData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(ruleData.name);
      expect(res.body.data.testType).toBe(ruleData.testType);
    });
  });

  describe('GET /api/rules', () => {
    it('should get all enabled rules', async () => {
      const { user, provider, token } = await createAuthenticatedProvider();

      await verifyProviderExists(provider._id);

      // Create enabled and disabled rules
      await PreventiveRule.create({
        name: 'Enabled Rule',
        conditionExpression: 'age >= 18',
        recommendationText: 'Test',
        recommendedIntervalDays: 365,
        testType: 'test',
        enabled: true
      });

      await PreventiveRule.create({
        name: 'Disabled Rule',
        conditionExpression: 'age >= 18',
        recommendationText: 'Test',
        recommendedIntervalDays: 365,
        testType: 'test',
        enabled: false
      });

      const res = await request(app)
        .get('/api/rules')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.every(rule => rule.enabled === true)).toBe(true);
    });
  });

  describe('PUT /api/rules/:id', () => {
    it('should update rule successfully', async () => {
      const { user, provider, token } = await createAuthenticatedProvider();

      await verifyProviderExists(provider._id);

      const rule = await PreventiveRule.create({
        name: 'Original Rule',
        conditionExpression: 'age >= 18',
        recommendationText: 'Original',
        recommendedIntervalDays: 365,
        testType: 'test',
        enabled: true
      });

      const updateData = {
        name: 'Updated Rule',
        recommendationText: 'Updated recommendation'
      };

      const res = await request(app)
        .put(`/api/rules/${rule._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Rule');
      expect(res.body.data.recommendationText).toBe('Updated recommendation');
    });

    it('should return 404 for non-existent rule', async () => {
      const { user, provider, token } = await createAuthenticatedProvider();

      await verifyProviderExists(provider._id);

      const mongoose = require('mongoose');
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/rules/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});

