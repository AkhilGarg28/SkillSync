const request = require('supertest');
const app = require('../server');
const Match = require('../src/models/Match');
const Session = require('../src/models/Session');
const SessionNote = require('../src/models/SessionNote');
const ChatMessage = require('../src/models/ChatMessage');
const Notification = require('../src/models/Notification');
const { checkAndSendSessionReminders } = require('../src/services/reminderService');

describe('Module 3: Full End-to-End Module Integration & Lifecycle Flow', () => {
  const user1Id = '66b1a2c3d4e5f67890123456';
  const user2Id = '66b789012345678901234567';

  const futureMondayISO = '2026-08-10T15:00:00.000Z';

  const mockUser1Availability = {
    userId: user1Id,
    timezone: 'UTC',
    weeklySlots: [{ dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00' }],
    blackoutDates: [],
  };

  const mockUser2Availability = {
    userId: user2Id,
    timezone: 'UTC',
    weeklySlots: [{ dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00' }],
    blackoutDates: [],
  };

  let mockMatch;
  let mockSession;
  let mockNote;
  let mockMessage;

  beforeEach(() => {
    mockMatch = {
      _id: '66m_e2e_11111111111111111',
      user1Id,
      user2Id,
      status: 'accepted',
    };

    mockSession = {
      _id: '66s_e2e_22222222222222222',
      user1Id,
      user2Id,
      matchId: mockMatch._id,
      proposedTime: new Date(futureMondayISO),
      confirmedTime: new Date(futureMondayISO),
      status: 'requested',
      videoCallLink: '',
      notes: [],
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    mockNote = {
      _id: '66n_e2e_33333333333333333',
      sessionId: mockSession._id,
      authorId: user1Id,
      notes: 'Full flow integration test progress note',
      milestones: [{ _id: 'm1', text: 'E2E test milestone', isDone: false }],
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    mockMessage = {
      _id: '66c_e2e_44444444444444444',
      sessionId: mockSession._id,
      matchId: mockMatch._id,
      senderId: user1Id,
      messageText: 'End to end integration message',
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    const createChainableQuery = (data) => {
      const promise = Promise.resolve(data);
      promise.sort = jest.fn().mockReturnValue(Promise.resolve(data));
      return promise;
    };

    jest.spyOn(Match, 'findById').mockImplementation(() => Promise.resolve(mockMatch));
    jest.spyOn(Session, 'findById').mockImplementation(() => Promise.resolve(mockSession));
    jest.spyOn(Session, 'find').mockImplementation(() => createChainableQuery([mockSession]));
    jest.spyOn(Session, 'findByIdAndUpdate').mockImplementation(() => Promise.resolve(mockSession));
    jest.spyOn(Session.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });
    jest.spyOn(SessionNote.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });
    jest.spyOn(ChatMessage.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });
    jest.spyOn(Notification.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });
    jest.spyOn(Notification, 'findOne').mockImplementation(() => Promise.resolve(null));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('FULL END-TO-END FLOW: Match Accepted ➔ Propose ➔ Confirm ➔ Video Link ➔ Notes ➔ Chat ➔ Reminders ➔ Completed ➔ Data Contracts', async () => {
    const proposeRes = await request(app)
      .post('/api/sessions/propose')
      .send({
        user1Id,
        user2Id,
        matchId: mockMatch._id,
        proposedTime: futureMondayISO,
        user1Availability: mockUser1Availability,
        user2Availability: mockUser2Availability,
      });

    expect(proposeRes.statusCode).toBe(201);
    expect(proposeRes.body.data.status).toBe('requested');

    const confirmRes = await request(app)
      .put(`/api/sessions/${mockSession._id}/respond`)
      .send({ action: 'accept' });

    expect(confirmRes.statusCode).toBe(200);
    expect(confirmRes.body.data.status).toBe('confirmed');
    expect(confirmRes.body.data.videoCallLink).toBeTruthy();

    const noteRes = await request(app)
      .post('/api/session-notes')
      .set('x-user-id', user1Id)
      .send({
        sessionId: mockSession._id,
        notes: 'Learning React hooks in session 1',
        milestones: [{ text: 'Understand useState', isDone: true }],
      });

    expect(noteRes.statusCode).toBe(201);
    expect(noteRes.body.success).toBe(true);

    const chatRes = await request(app)
      .post('/api/chat-messages')
      .set('x-user-id', user1Id)
      .send({
        matchId: mockMatch._id,
        sessionId: mockSession._id,
        messageText: 'Hello from full E2E flow test!',
      });

    expect(chatRes.statusCode).toBe(201);
    expect(chatRes.body.success).toBe(true);

    mockSession.status = 'confirmed';
    const reminderResult = await checkAndSendSessionReminders();
    expect(reminderResult.success).toBe(true);

    const completeRes = await request(app)
      .put(`/api/sessions/${mockSession._id}/respond`)
      .send({ action: 'complete' });

    expect(completeRes.statusCode).toBe(200);
    expect(completeRes.body.data.status).toBe('completed');

    const userSessionsRes = await request(app).get(`/api/sessions/user/${user1Id}`);
    expect(userSessionsRes.statusCode).toBe(200);
    const sessionDoc = userSessionsRes.body.data[0];

    expect(sessionDoc).toHaveProperty('user1Id');
    expect(sessionDoc).toHaveProperty('user2Id');
    expect(sessionDoc).toHaveProperty('status', 'completed');

    expect(sessionDoc).toHaveProperty('_id');
    expect(sessionDoc).toHaveProperty('matchId');
    expect(sessionDoc).toHaveProperty('status', 'completed');
  });
});
