const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');

describe('Module 1: User Profile API Endpoints', () => {
  const userId = '66a111111111111111111111';
  const otherUserId = '66a222222222222222222222';

  const mockUser = {
    _id: userId,
    name: 'Jane Doe',
    email: 'jane@example.com',
    city: 'San Francisco',
    timezone: 'PST',
    availability: [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00' }
    ],
    profilePhoto: 'https://example.com/photo.jpg',
    bio: 'Software engineer and mentor.',
    skillsToTeach: [
      { skillName: 'JavaScript', experienceLevel: 'Expert', proofLink: 'https://github.com/janedoe' }
    ],
    skillsToLearn: [
      { skillName: 'Python', desiredLevel: 'Intermediate' }
    ],
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    mockUser.save.mockReset();
    mockUser.save.mockImplementation(function () {
      return Promise.resolve(this);
    });
  });

  describe('1. GET /api/users/:id', () => {
    test('successfully retrieves user profile (without password)', async () => {
      // Mock User.findById chain: findById -> select -> returning mockUser
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Jane Doe');
      expect(res.body.data.password).toBeUndefined();
    });

    test('returns 404 if user profile is not found', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .get(`/api/users/${otherUserId}`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('User not found');
    });
  });

  describe('2. PUT /api/users/:id', () => {
    test('successfully updates profile details', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-user-id', userId)
        .send({
          name: 'Jane Smith',
          city: 'Seattle',
          bio: 'Updated bio description.',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.name).toBe('Jane Smith');
      expect(mockUser.city).toBe('Seattle');
      expect(mockUser.bio).toBe('Updated bio description.');
    });

    test('blocks profile updates by unauthorized users with 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-user-id', otherUserId)
        .send({ name: 'Hacked Name' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden');
    });

    test('returns 400 validation error if name is empty', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-user-id', userId)
        .send({ name: ' ' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Name cannot be empty');
    });

    test('returns 400 duplicate email error if email is already taken', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: otherUserId });

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('x-user-id', userId)
        .send({ email: 'duplicate@taken.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Email already in use');
    });
  });

  describe('3. POST /api/users/:id/skills-teach', () => {
    test('successfully adds or updates teaching skill', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const res = await request(app)
        .post(`/api/users/${userId}/skills-teach`)
        .set('x-user-id', userId)
        .send({
          skillName: 'TypeScript',
          experienceLevel: 'Advanced',
          proofLink: 'https://typescriptlang.org',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      const added = mockUser.skillsToTeach.find(s => s.skillName === 'TypeScript');
      expect(added).toBeDefined();
      expect(added.experienceLevel).toBe('Advanced');
    });

    test('returns 400 if skillName or experienceLevel is missing', async () => {
      const res = await request(app)
        .post(`/api/users/${userId}/skills-teach`)
        .set('x-user-id', userId)
        .send({
          skillName: 'Go',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('skillName and experienceLevel are required');
    });

    test('blocks modifying teaching skills of other users with 403 Forbidden', async () => {
      const res = await request(app)
        .post(`/api/users/${userId}/skills-teach`)
        .set('x-user-id', otherUserId)
        .send({
          skillName: 'Swift',
          experienceLevel: 'Intermediate',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden');
    });
  });

  describe('4. POST /api/users/:id/skills-learn', () => {
    test('successfully adds or updates learning skill', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const res = await request(app)
        .post(`/api/users/${userId}/skills-learn`)
        .set('x-user-id', userId)
        .send({
          skillName: 'Rust',
          desiredLevel: 'Beginner',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      const added = mockUser.skillsToLearn.find(s => s.skillName === 'Rust');
      expect(added).toBeDefined();
      expect(added.desiredLevel).toBe('Beginner');
    });

    test('returns 400 if skillName or desiredLevel is missing', async () => {
      const res = await request(app)
        .post(`/api/users/${userId}/skills-learn`)
        .set('x-user-id', userId)
        .send({
          desiredLevel: 'Expert',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('skillName and desiredLevel are required');
    });

    test('blocks modifying learning skills of other users with 403 Forbidden', async () => {
      const res = await request(app)
        .post(`/api/users/${userId}/skills-learn`)
        .set('x-user-id', otherUserId)
        .send({
          skillName: 'Kotlin',
          desiredLevel: 'Intermediate',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden');
    });
  });
});
