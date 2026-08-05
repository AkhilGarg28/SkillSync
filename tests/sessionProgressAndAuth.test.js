const request = require('supertest');
const app = require('../server');
const Session = require('../src/models/Session');
const SessionNote = require('../src/models/SessionNote');
const { generateVideoCallLink } = require('../src/utils/videoLinkGenerator');

describe('Module 3: Video Call Links, Progress Tracking & Authorization Boundaries', () => {
  const user1Id = '66b1a2c3d4e5f67890123456';
  const user2Id = '66b789012345678901234567';
  const user3Id = '66b999999999999999999999';

  let mockSession;
  let mockNote;

  beforeEach(() => {
    mockSession = {
      _id: '66c999999999999999999999',
      user1Id,
      user2Id,
      proposedTime: new Date('2026-08-10T16:00:00.000Z'),
      status: 'requested',
      videoCallLink: '',
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    mockNote = {
      _id: '66d888888888888888888888',
      sessionId: mockSession._id,
      authorId: user1Id,
      notes: 'Initial progress notes for SkillSync session.',
      milestones: [
        { _id: '66e111111111111111111111', text: 'Setup repo', isDone: true },
        { _id: '66e222222222222222222222', text: 'Build API endpoints', isDone: false },
      ],
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(Session, 'findById').mockImplementation((id) => Promise.resolve(mockSession));
    jest.spyOn(Session, 'findByIdAndUpdate').mockImplementation(() => Promise.resolve(mockSession));
    jest.spyOn(SessionNote, 'findById').mockImplementation((id) => Promise.resolve(mockNote));
    jest.spyOn(SessionNote.prototype, 'save').mockImplementation(function () {
      return Promise.resolve(this);
    });
    jest.spyOn(SessionNote, 'find').mockImplementation(() => ({
      sort: jest.fn().mockReturnValue(Promise.resolve([mockNote])),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Video Call Link Auto-Generation', () => {
    test('generateVideoCallLink creates unique room link pattern', () => {
      const link = generateVideoCallLink(mockSession._id);
      expect(link).toContain('https://meet.skillsync.app/room/session_');
    });

    test('auto-generates videoCallLink when session status moves to confirmed', async () => {
      mockSession.status = 'requested';
      mockSession.videoCallLink = '';

      const res = await request(app)
        .put(`/api/sessions/${mockSession._id}/respond`)
        .send({ action: 'accept' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
      expect(res.body.data.videoCallLink).toBeTruthy();
      expect(res.body.data.videoCallLink).toContain('https://meet.skillsync.app/room/session_');
    });
  });

  describe('2. Authorized Progress Tracking (Matched Users)', () => {
    test('allows User 1 (participant) to create session notes', async () => {
      const res = await request(app)
        .post('/api/session-notes')
        .set('x-user-id', user1Id)
        .send({
          sessionId: mockSession._id,
          notes: 'Learning React hooks in session 1',
          milestones: [{ text: 'Understand useState', isDone: true }],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).toBe('Learning React hooks in session 1');
    });

    test('allows User 2 (matched participant) to read session notes', async () => {
      const res = await request(app)
        .get(`/api/session-notes/session/${mockSession._id}`)
        .set('x-user-id', user2Id);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('allows User 1 to update free-text notes', async () => {
      const res = await request(app)
        .put(`/api/session-notes/${mockNote._id}`)
        .set('x-user-id', user1Id)
        .send({ notes: 'Updated notes content' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('allows User 2 to add a milestone to notes', async () => {
      mockNote.milestones.push = jest.fn();
      const res = await request(app)
        .post(`/api/session-notes/${mockNote._id}/milestones`)
        .set('x-user-id', user2Id)
        .send({ text: 'Implement MongoDB indexes', isDone: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('3. Authorization Boundary Enforcement (Third User 403 Forbidden)', () => {
    test('blocks User 3 (unauthorized) from reading another match\'s session notes with 403', async () => {
      const res = await request(app)
        .get(`/api/session-notes/session/${mockSession._id}`)
        .set('x-user-id', user3Id);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: You are not a participant in this session');
    });

    test('blocks User 3 (unauthorized) from creating notes on another match\'s session with 403', async () => {
      const res = await request(app)
        .post('/api/session-notes')
        .set('x-user-id', user3Id)
        .send({
          sessionId: mockSession._id,
          notes: 'Malicious note injection',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: You are not a participant in this session');
    });

    test('blocks User 3 (unauthorized) from editing another match\'s session note with 403', async () => {
      const res = await request(app)
        .put(`/api/session-notes/${mockNote._id}`)
        .set('x-user-id', user3Id)
        .send({ notes: 'Hacked content' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: You are not a participant in this session');
    });

    test('blocks User 3 (unauthorized) from adding milestones to another match\'s session with 403', async () => {
      const res = await request(app)
        .post(`/api/session-notes/${mockNote._id}/milestones`)
        .set('x-user-id', user3Id)
        .send({ text: 'Unauthorized milestone' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: You are not a participant in this session');
    });

    test('blocks requests missing authentication with 401 Unauthorized', async () => {
      const res = await request(app).get(`/api/session-notes/session/${mockSession._id}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Not authorized');
    });
  });
});
