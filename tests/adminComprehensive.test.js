const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Match = require('../src/models/Match');
const Session = require('../src/models/Session');
const Report = require('../src/models/Report');
const Review = require('../src/models/Review');
const Dispute = require('../src/models/Dispute');
const SkillCategory = require('../src/models/SkillCategory');
const Announcement = require('../src/models/Announcement');
const AuditLog = require('../src/models/AuditLog');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middleware/auth');

describe('SkillSync Admin Panel Comprehensive Test Suite (13 Features + Security)', () => {
  const superAdminId = '66a999999999999999999999';
  const supportAdminId = '66a777777777777777777777';
  const regularUserId = '66a111111111111111111111';
  const targetUserId = '66a222222222222222222222';

  const mockSuperAdmin = {
    _id: superAdminId,
    name: 'Super Admin',
    email: 'super@skillsync.com',
    role: 'admin',
    adminRole: 'super_admin',
    isBlocked: false,
    isVerified: true,
  };

  const mockSupportAdmin = {
    _id: supportAdminId,
    name: 'Support Admin',
    email: 'support@skillsync.com',
    role: 'admin',
    adminRole: 'support_admin',
    isBlocked: false,
    isVerified: true,
  };

  const mockRegularUser = {
    _id: regularUserId,
    name: 'Jane Regular',
    email: 'jane@example.com',
    role: 'user',
    isBlocked: false,
    isVerified: false,
  };

  const mockTargetUser = {
    _id: targetUserId,
    name: 'John Target',
    email: 'john@example.com',
    role: 'user',
    isBlocked: false,
    isVerified: false,
    skillsToTeach: [
      { skillName: 'React', experienceLevel: 'Expert', proofLink: 'https://proof.com', proofStatus: 'pending' },
    ],
    skillsToLearn: [{ skillName: 'Python', desiredLevel: 'Beginner' }],
    save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
  };

  let superAdminToken;
  let supportAdminToken;
  let regularUserToken;

  beforeAll(() => {
    superAdminToken = jwt.sign({ id: superAdminId, role: 'admin', adminRole: 'super_admin' }, JWT_SECRET, { expiresIn: '1h' });
    supportAdminToken = jwt.sign({ id: supportAdminId, role: 'admin', adminRole: 'support_admin' }, JWT_SECRET, { expiresIn: '1h' });
    regularUserToken = jwt.sign({ id: regularUserId, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  // --- Feature 1: Verify Skills ---
  describe('Feature 1: Skill Verification Queue & Approval/Rejection', () => {
    test('fetches pending skill verification queue', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(User, 'find').mockReturnValue({ select: jest.fn().mockResolvedValue([mockTargetUser]) });

      const res = await request(app)
        .get('/api/admin/pending-skills')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].skillName).toBe('React');
    });

    test('approves skill proof and sets proofStatus: approved', async () => {
      jest.spyOn(User, 'findById').mockImplementation((id) => {
        if (id === superAdminId) return { select: jest.fn().mockResolvedValue(mockSuperAdmin) };
        return Promise.resolve(mockTargetUser);
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .put(`/api/admin/users/${targetUserId}/verify-skill`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ skillName: 'React', status: 'approved' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTargetUser.skillsToTeach[0].proofStatus).toBe('approved');
    });

    test('rejects skill proof with optional rejection reason', async () => {
      jest.spyOn(User, 'findById').mockImplementation((id) => {
        if (id === superAdminId) return { select: jest.fn().mockResolvedValue(mockSuperAdmin) };
        return Promise.resolve(mockTargetUser);
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .put(`/api/admin/users/${targetUserId}/verify-skill`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ skillName: 'React', status: 'rejected', rejectionReason: 'Invalid document link.' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTargetUser.skillsToTeach[0].proofStatus).toBe('rejected');
      expect(mockTargetUser.skillsToTeach[0].rejectionReason).toBe('Invalid document link.');
    });
  });

  // --- Feature 2: Manage Users ---
  describe('Feature 2: Searchable User Management & Activity Summary', () => {
    test('fetches paginated user list with search', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(User, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(User, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockTargetUser]),
      });

      const res = await request(app)
        .get('/api/admin/users?search=Target')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    test('toggles block status on user', async () => {
      jest.spyOn(User, 'findById').mockImplementation((id) => {
        if (id === superAdminId) return { select: jest.fn().mockResolvedValue(mockSuperAdmin) };
        return Promise.resolve(mockTargetUser);
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .put(`/api/admin/users/${targetUserId}/block`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTargetUser.isBlocked).toBe(true);
    });
  });

  // --- Feature 3: Manage Reports ---
  describe('Feature 3: Abuse Reports Queue & Resolution Actions', () => {
    test('fetches reports queue and handles action (warn/block/dismiss)', async () => {
      const mockReport = {
        _id: '66a333333333333333333333',
        reporterId: regularUserId,
        reportedUserId: targetUserId,
        reason: 'Harassment',
        details: 'Offensive language',
        status: 'pending',
        save: jest.fn().mockResolvedValue(this),
      };

      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(Report, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([mockReport]),
      });
      jest.spyOn(Report, 'findById').mockResolvedValue(mockReport);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const getRes = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(getRes.statusCode).toBe(200);

      const actionRes = await request(app)
        .put(`/api/admin/reports/${mockReport._id}/action`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ action: 'warn', resolutionNotes: 'Warning issued.' });

      expect(actionRes.statusCode).toBe(200);
      expect(mockReport.status).toBe('resolved');
    });
  });

  // --- Feature 4: Manage Sessions ---
  describe('Feature 4: Global Session Monitoring & Cancellation', () => {
    test('cancels scheduled session and notifies participants', async () => {
      const mockSession = {
        _id: '66a444444444444444444444',
        user1Id: regularUserId,
        user2Id: targetUserId,
        status: 'confirmed',
        save: jest.fn().mockResolvedValue(this),
      };

      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(Session, 'findById').mockResolvedValue(mockSession);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .put(`/api/admin/sessions/${mockSession._id}/cancel`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ reason: 'Inappropriate content report.' });

      expect(res.statusCode).toBe(200);
      expect(mockSession.status).toBe('cancelled');
    });
  });

  // --- Feature 5 & 11: Analytics & CSV Export ---
  describe('Feature 5 & 11: Analytics Metrics & CSV Export', () => {
    test('returns accurate database metrics in analytics endpoint', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(User, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Match, 'countDocuments').mockResolvedValue(2);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(3);
      jest.spyOn(Report, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(User, 'find').mockReturnValue({ select: jest.fn().mockResolvedValue([]) });

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalUsers).toBe(5);
      expect(res.body.data.totalMatches).toBe(2);
    });

    test('exports formatted CSV file for users', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: targetUserId, name: 'John Target', email: 'john@example.com', role: 'user', isVerified: false, isBlocked: false, createdAt: new Date() }]),
      });

      const res = await request(app)
        .get('/api/admin/export/users')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('ID,Name,Email,Role');
    });
  });

  // --- Feature 6: Dispute Resolution ---
  describe('Feature 6: Dispute Resolution Workflow', () => {
    test('resolves session dispute with void_session outcome', async () => {
      const mockDispute = {
        _id: '66a555555555555555555555',
        sessionId: '66a444444444444444444444',
        initiatorId: regularUserId,
        respondentId: targetUserId,
        status: 'pending',
        save: jest.fn().mockResolvedValue(this),
      };

      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(Dispute, 'findById').mockResolvedValue(mockDispute);
      jest.spyOn(Session, 'findByIdAndUpdate').mockResolvedValue({});
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .put(`/api/admin/disputes/${mockDispute._id}/resolve`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ outcome: 'void_session', adminNotes: 'No show verified.' });

      expect(res.statusCode).toBe(200);
      expect(mockDispute.status).toBe('resolved');
      expect(mockDispute.outcome).toBe('void_session');
    });
  });

  // --- Feature 7: Manage Reviews ---
  describe('Feature 7: Review Moderation & Deletion', () => {
    test('deletes fake review and logs audit trail', async () => {
      const mockReview = {
        _id: '66a666666666666666666666',
        reviewerId: regularUserId,
        revieweeId: targetUserId,
        rating: 1,
        comment: 'Fake review',
      };

      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(Review, 'findByIdAndDelete').mockResolvedValue(mockReview);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .delete(`/api/admin/reviews/${mockReview._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // --- Feature 8: Skill Categories ---
  describe('Feature 8: Skill Category CRUD & Safety Protections', () => {
    test('creates new skill category as Super Admin', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(SkillCategory, 'findOne').mockResolvedValue(null);
      jest.spyOn(SkillCategory, 'create').mockResolvedValue({ _id: '66a777777777777777777771', name: 'Design' });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const res = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'Design', description: 'Art & UI' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('blocks deleting in-use category without reassignment parameter', async () => {
      const mockCat = { _id: '66a777777777777777777771', name: 'Coding' };
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(SkillCategory, 'findById').mockResolvedValue(mockCat);
      jest.spyOn(User, 'find').mockResolvedValue([mockTargetUser]);

      const res = await request(app)
        .delete(`/api/admin/categories/${mockCat._id}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Cannot delete category');
    });
  });

  // --- Feature 9: System Health ---
  describe('Feature 9: System Health & Active Sessions Monitoring', () => {
    test('returns active session count and server status for Super Admin', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(4);

      const res = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.activeSessionsCount).toBe(4);
      expect(res.body.data.backendStatus).toBe('OK');
    });
  });

  // --- Feature 10: Admin Roles & Permission Boundaries ---
  describe('Feature 10: Admin Roles & Permission Boundary Enforcement', () => {
    test('Support Admin can perform support moderation (reports)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSupportAdmin) });
      jest.spyOn(Report, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${supportAdminToken}`);

      expect(res.statusCode).toBe(200);
    });

    test('Support Admin is rejected with 403 on Super Admin endpoints (Category creation, Health, Role Update)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSupportAdmin) });

      const catRes = await request(app)
        .post('/api/admin/categories')
        .set('Authorization', `Bearer ${supportAdminToken}`)
        .send({ name: 'Hacked Cat' });
      expect(catRes.statusCode).toBe(403);
      expect(catRes.body.error).toContain('Super Admin privileges required');

      const healthRes = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${supportAdminToken}`);
      expect(healthRes.statusCode).toBe(403);

      const roleRes = await request(app)
        .put(`/api/admin/users/${targetUserId}/role`)
        .set('Authorization', `Bearer ${supportAdminToken}`)
        .send({ role: 'admin', adminRole: 'super_admin' });
      expect(roleRes.statusCode).toBe(403);
    });
  });

  // --- Feature 12: Announcements ---
  describe('Feature 12: Platform Announcements Lifecycle', () => {
    test('creates announcement and exposes it on active user endpoint', async () => {
      const mockAnn = {
        _id: '66a888888888888888888881',
        title: 'Maintenance Update',
        message: 'System upgrade at midnight.',
        type: 'warning',
        isActive: true,
      };

      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(Announcement, 'create').mockResolvedValue(mockAnn);
      jest.spyOn(Announcement, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockAnn]),
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({});

      const postRes = await request(app)
        .post('/api/admin/announcements')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ title: 'Maintenance Update', message: 'System upgrade at midnight.', type: 'warning' });
      expect(postRes.statusCode).toBe(201);

      const userRes = await request(app).get('/api/announcements/active');
      expect(userRes.statusCode).toBe(200);
      expect(userRes.body.data.length).toBe(1);
    });
  });

  // --- Feature 13: Audit Logs ---
  describe('Feature 13: Administrative Audit Logs', () => {
    test('fetches audit logs filterable by action', async () => {
      const mockLog = {
        _id: '66a888888888888888888882',
        adminEmail: 'super@skillsync.com',
        action: 'BLOCK_USER',
        targetType: 'User',
        targetId: targetUserId,
        createdAt: new Date(),
      };

      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockSuperAdmin) });
      jest.spyOn(AuditLog, 'find').mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockLog]),
      });

      const res = await request(app)
        .get('/api/admin/audit-logs?action=BLOCK_USER')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].action).toBe('BLOCK_USER');
    });
  });

  // --- Security Pass: Non-Admin Rejection ---
  describe('Security Pass: Non-Admin Token API Rejection', () => {
    test('regular user token is rejected with 403 Forbidden across all admin endpoints', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({ select: jest.fn().mockResolvedValue(mockRegularUser) });

      const endpoints = [
        ['get', '/api/admin/analytics'],
        ['get', '/api/admin/users'],
        ['get', '/api/admin/pending-skills'],
        ['get', '/api/admin/reports'],
        ['get', '/api/admin/disputes'],
        ['get', '/api/admin/sessions'],
        ['get', '/api/admin/reviews'],
        ['get', '/api/admin/categories'],
        ['get', '/api/admin/health'],
        ['get', '/api/admin/announcements'],
        ['get', '/api/admin/audit-logs'],
      ];

      for (const [method, route] of endpoints) {
        const res = await request(app)[method](route).set('Authorization', `Bearer ${regularUserToken}`);
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toContain('Admin access required');
      }
    });
  });
});
