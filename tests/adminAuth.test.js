const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Match = require('../src/models/Match');
const Session = require('../src/models/Session');
const Report = require('../src/models/Report');
const AuditLog = require('../src/models/AuditLog');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middleware/auth');

describe('Admin Authentication & Authorization API Endpoints', () => {
  const adminId = '66a999999999999999999999';
  const regularUserId = '66a111111111111111111111';
  const blockedUserId = '66a888888888888888888888';

  const mockAdmin = {
    _id: adminId,
    name: 'Admin User',
    email: 'admin@skillsync.com',
    role: 'admin',
    isBlocked: false,
    isVerified: true,
    comparePassword: jest.fn(),
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  const mockUser = {
    _id: regularUserId,
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'user',
    isBlocked: false,
    isVerified: false,
    comparePassword: jest.fn(),
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  const mockBlockedUser = {
    _id: blockedUserId,
    name: 'Blocked User',
    email: 'blocked@example.com',
    role: 'user',
    isBlocked: true,
    isVerified: false,
    comparePassword: jest.fn(),
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  let adminToken;
  let userToken;

  beforeAll(() => {
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    userToken = jwt.sign({ id: regularUserId, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    mockAdmin.comparePassword.mockReset();
    mockUser.comparePassword.mockReset();
    mockBlockedUser.comparePassword.mockReset();
  });

  describe('1. Login Endpoint Admin & User Handling', () => {
    test('successfully authenticates admin user and returns role: admin', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockAdmin);
      mockAdmin.comparePassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@skillsync.com',
          password: 'admin123456',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');

      // Verify token payload includes role
      const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
      expect(decoded.role).toBe('admin');
    });

    test('authenticates regular user and returns role: user', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('user');
    });

    test('rejects login for blocked user with 403 Forbidden', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockBlockedUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'blocked@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('suspended/blocked');
    });

    test('rejects login with invalid credentials with 401', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockAdmin);
      mockAdmin.comparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@skillsync.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });
  });

  describe('2. Admin API Route Protection (Middleware)', () => {
    test('allows admin user with valid Bearer token to access /api/admin/analytics', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });
      jest.spyOn(User, 'countDocuments').mockResolvedValue(10);
      jest.spyOn(Match, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(3);
      jest.spyOn(Report, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBe(10);
    });

    test('blocks regular user with Bearer token with 403 Forbidden', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Admin access required');
    });

    test('blocks unauthenticated request (no token) with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/analytics');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Missing authentication token');
    });

    test('allows admin user authenticated via x-user-id header', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });
      jest.spyOn(User, 'countDocuments').mockResolvedValue(10);
      jest.spyOn(Match, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(3);
      jest.spyOn(Report, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('x-user-id', adminId)
        .set('x-user-role', 'admin');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('blocks non-admin user authenticated via x-user-id header with 403', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('x-user-id', regularUserId)
        .set('x-user-role', 'user');

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Admin access required');
    });
  });

  describe('3. Admin Operations', () => {
    test('admin can fetch user list (/api/admin/users)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });
      jest.spyOn(User, 'countDocuments').mockResolvedValue(2);
      jest.spyOn(User, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockAdmin, mockUser]),
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    test('admin can toggle block state on user (/api/admin/users/:id/block)', async () => {
      jest.spyOn(User, 'findById').mockImplementation((id) => {
        if (id === adminId) {
          return { select: jest.fn().mockResolvedValue(mockAdmin) };
        }
        return Promise.resolve(mockUser);
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .put(`/api/admin/users/${regularUserId}/block`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.isBlocked).toBe(true);
    });
  });
});
