const request = require('supertest');
const app = require('../server');
const Match = require('../src/models/Match');
const Session = require('../src/models/Session');
const ChatMessage = require('../src/models/ChatMessage');

describe('Module 3: In-App Chat, File Sharing & Pre-Acceptance Match Lock', () => {
  const user1Id = '66b1a2c3d4e5f67890123456';
  const user2Id = '66b789012345678901234567';
  const user3Id = '66b999999999999999999999';

  let pendingMatch;
  let acceptedMatch;
  let requestedSession;
  let confirmedSession;
  let mockMessage;

  beforeEach(() => {
    pendingMatch = {
      _id: '66m111111111111111111111',
      user1Id,
      user2Id,
      status: 'pending',
    };

    acceptedMatch = {
      _id: '66m222222222222222222222',
      user1Id,
      user2Id,
      status: 'accepted',
    };

    requestedSession = {
      _id: '66s111111111111111111111',
      user1Id,
      user2Id,
      matchId: pendingMatch._id,
      status: 'requested',
    };

    confirmedSession = {
      _id: '66s222222222222222222222',
      user1Id,
      user2Id,
      matchId: acceptedMatch._id,
      status: 'confirmed',
    };

    mockMessage = {
      _id: '66msg1111111111111111111',
      sessionId: confirmedSession._id,
      matchId: acceptedMatch._id,
      senderId: user1Id,
      messageText: 'Hello world from chat!',
      fileAttachment: {
        fileName: 'test_doc.pdf',
        fileUrl: '/api/chat-messages/files/download/test_doc.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(Match, 'findById').mockImplementation((id) => {
      if (id === acceptedMatch._id || id?.toString() === acceptedMatch._id) {
        return Promise.resolve(acceptedMatch);
      }
      return Promise.resolve(pendingMatch);
    });

    jest.spyOn(Session, 'findById').mockImplementation((id) => {
      if (id === confirmedSession._id || id?.toString() === confirmedSession._id) {
        return Promise.resolve(confirmedSession);
      }
      return Promise.resolve(requestedSession);
    });

    jest.spyOn(ChatMessage, 'findById').mockImplementation(() => Promise.resolve(mockMessage));
    jest.spyOn(ChatMessage, 'findOne').mockImplementation(() => Promise.resolve(mockMessage));
    jest.spyOn(ChatMessage.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });
    jest.spyOn(ChatMessage, 'find').mockImplementation(() => ({
      sort: jest.fn().mockReturnValue(Promise.resolve([mockMessage])),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Pre-Acceptance Match Lock (403 Forbidden)', () => {
    test('rejects chat creation for pending match with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/chat-messages')
        .set('x-user-id', user1Id)
        .send({
          matchId: pendingMatch._id,
          messageText: 'Attempting to chat before acceptance',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden');
      expect(res.body.error).toContain('Chat is locked');
    });

    test('rejects reading chat messages for unaccepted requested session with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/chat-messages/session/${requestedSession._id}`)
        .set('x-user-id', user1Id);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden');
      expect(res.body.error).toContain('Chat is locked');
    });
  });

  describe('2. Accepted Match Messaging & Persistence', () => {
    test('allows messaging for accepted match and persists to ChatMessage', async () => {
      const res = await request(app)
        .post('/api/chat-messages')
        .set('x-user-id', user1Id)
        .send({
          matchId: acceptedMatch._id,
          sessionId: confirmedSession._id,
          messageText: 'Valid chat message for accepted match',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messageText).toBe('Valid chat message for accepted match');
    });

    test('allows reading chat messages for accepted match/session', async () => {
      const res = await request(app)
        .get(`/api/chat-messages/session/${confirmedSession._id}`)
        .set('x-user-id', user2Id);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('3. File Sharing & Access Scoping Boundary (403 Forbidden for Non-Participants)', () => {
    test('blocks non-participant User 3 from fetching another match\'s uploaded file with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/chat-messages/files/download/test_doc.pdf')
        .set('x-user-id', user3Id);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: You are not authorized to access files from this match');
    });

    test('allows matched participant User 1 or User 2 to access file (200 OK or 404 if file missing on disk)', async () => {
      const res = await request(app)
        .get('/api/chat-messages/files/download/test_doc.pdf')
        .set('x-user-id', user1Id);

      expect(res.statusCode).not.toBe(403);
      expect(res.statusCode).not.toBe(401);
    });
  });
});
