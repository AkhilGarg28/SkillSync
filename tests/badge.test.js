const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Session = require('../src/models/Session');
const Review = require('../src/models/Review');

describe('Module 1: Badge System API Endpoints', () => {
  const userId = '66a111111111111111111111';

  const mockUser = {
    _id: userId,
    name: 'Jane Doe',
    email: 'jane@example.com',
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/users/:id/badges', () => {
    test('returns empty array when user has no completed sessions and no reviews', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(Review, 'find').mockResolvedValue([]);

      const res = await request(app)
        .get(`/api/users/${userId}/badges`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    test('awards "Verified Teacher" badge after 3 completed sessions', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(3);
      jest.spyOn(Review, 'find').mockResolvedValue([]);

      const res = await request(app)
        .get(`/api/users/${userId}/badges`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Verified Teacher');
    });

    test('awards "Peer Rated" badge after positive reviews', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(Review, 'find').mockResolvedValue([
        { rating: 4, revieweeId: userId },
        { rating: 5, revieweeId: userId },
      ]);

      const res = await request(app)
        .get(`/api/users/${userId}/badges`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Peer Rated');
      expect(res.body.data[0].averageRating).toBe(4.5);
    });

    test('does not award "Peer Rated" badge if average rating is below 4.0', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(Review, 'find').mockResolvedValue([
        { rating: 3, revieweeId: userId },
        { rating: 4, revieweeId: userId },
      ]); // avg is 3.5

      const res = await request(app)
        .get(`/api/users/${userId}/badges`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    test('awards both badges when both criteria are met', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(Session, 'countDocuments').mockResolvedValue(5);
      jest.spyOn(Review, 'find').mockResolvedValue([
        { rating: 5, revieweeId: userId }
      ]);

      const res = await request(app)
        .get(`/api/users/${userId}/badges`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      const names = res.body.data.map(b => b.name);
      expect(names).toContain('Verified Teacher');
      expect(names).toContain('Peer Rated');
    });

    test('returns 404 if user does not exist', async () => {
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/users/${userId}/badges`)
        .set('x-user-id', userId);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('User not found');
    });

    test('returns 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/users/${userId}/badges`);
      expect(res.statusCode).toBe(401);
    });
  });
});
