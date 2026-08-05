const request = require('supertest');
const app = require('../server');
const Session = require('../src/models/Session');
const {
  validateMutualAvailability,
  findOverlappingSlots,
} = require('../src/utils/availabilityValidator');

const mockUser1Availability = {
  userId: '66b1a2c3d4e5f67890123456',
  timezone: 'UTC',
  weeklySlots: [
    { dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00' },
    { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '12:00' },
  ],
  blackoutDates: ['2026-12-25'],
};

const mockUser2Availability = {
  userId: '66b789012345678901234567',
  timezone: 'UTC',
  weeklySlots: [
    { dayOfWeek: 'Monday', startTime: '15:00', endTime: '19:00' },
    { dayOfWeek: 'Friday', startTime: '10:00', endTime: '14:00' },
  ],
  blackoutDates: ['2026-01-01'],
};

describe('Module 3: Scheduling Engine & Availability Validation', () => {
  describe('1. Availability Validator Utility', () => {
    test('validates proposed time when both users are free', () => {
      const proposedTime = '2026-08-10T16:00:00.000Z';
      const result = validateMutualAvailability(
        proposedTime,
        mockUser1Availability,
        mockUser2Availability,
        60
      );
      expect(result.isValid).toBe(true);
    });

    test('rejects time when User 1 is not free (User 2 free)', () => {
      const proposedTime = '2026-08-10T18:30:00.000Z';
      const result = validateMutualAvailability(
        proposedTime,
        mockUser1Availability,
        mockUser2Availability,
        60
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('User 1 unavailable');
    });

    test('rejects time when User 2 is not free (User 1 free)', () => {
      const proposedTime = '2026-08-10T14:00:00.000Z';
      const result = validateMutualAvailability(
        proposedTime,
        mockUser1Availability,
        mockUser2Availability,
        60
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('User 2 unavailable');
    });

    test('rejects proposed time on a blackout date', () => {
      const proposedTime = '2026-12-25T16:00:00.000Z';
      const result = validateMutualAvailability(
        proposedTime,
        mockUser1Availability,
        mockUser2Availability,
        60
      );
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('blackout date');
    });

    test('calculates correct overlapping slots between User 1 and User 2', () => {
      const overlaps = findOverlappingSlots(mockUser1Availability, mockUser2Availability);
      expect(overlaps).toEqual([
        { dayOfWeek: 'Monday', startTime: '15:00', endTime: '18:00' },
      ]);
    });
  });

  describe('2. State Machine & Controller Transitions', () => {
    let mockSession;

    beforeEach(() => {
      mockSession = {
        _id: '66c999999999999999999999',
        user1Id: mockUser1Availability.userId,
        user2Id: mockUser2Availability.userId,
        proposedTime: new Date('2026-08-10T16:00:00.000Z'),
        status: 'requested',
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        }),
      };
      jest.spyOn(Session, 'findById').mockImplementation((id) => Promise.resolve(mockSession));
      jest.spyOn(Session.prototype, 'save').mockImplementation(function () {
        return Promise.resolve(this);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('POST /api/sessions/propose creates session if time is within availability', async () => {
      const res = await request(app).post('/api/sessions/propose').send({
        user1Id: mockUser1Availability.userId,
        user2Id: mockUser2Availability.userId,
        proposedTime: '2026-08-10T16:00:00.000Z',
        user1Availability: mockUser1Availability,
        user2Availability: mockUser2Availability,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('requested');
    });

    test('POST /api/sessions/propose rejects if proposed time is out of availability', async () => {
      const res = await request(app).post('/api/sessions/propose').send({
        user1Id: mockUser1Availability.userId,
        user2Id: mockUser2Availability.userId,
        proposedTime: '2026-08-10T11:00:00.000Z',
        user1Availability: mockUser1Availability,
        user2Availability: mockUser2Availability,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Proposed time rejected');
    });

    test('State Transition: requested -> confirmed (Accept)', async () => {
      mockSession.status = 'requested';
      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'accept' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
    });

    test('State Transition: requested -> cancelled (Decline)', async () => {
      mockSession.status = 'requested';
      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'decline' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    test('State Transition: confirmed -> completed', async () => {
      mockSession.status = 'confirmed';
      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'complete' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });

    test('State Transition: confirmed -> cancelled BEFORE session time passes', async () => {
      mockSession.status = 'confirmed';
      mockSession.confirmedTime = new Date(Date.now() + 86400000);

      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'cancel' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
    });

    test('BLOCKED State Transition: confirmed -> cancelled AFTER session time passes', async () => {
      mockSession.status = 'confirmed';
      mockSession.confirmedTime = new Date(Date.now() - 86400000);

      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'cancel' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot cancel a confirmed session after the session time has passed');
    });

    test('BLOCKED Invalid Transitions (requested -> completed)', async () => {
      mockSession.status = 'requested';
      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'complete' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('State transition rejected');
    });

    test('BLOCKED Invalid Transitions from terminal states (cancelled -> confirmed)', async () => {
      mockSession.status = 'cancelled';
      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'accept' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Session is already cancelled');
    });
  });
});
