const request = require('supertest');
const crypto = require('crypto');
const passport = require('passport');

// Mock passport authenticate before importing app
jest.spyOn(passport, 'authenticate').mockImplementation((strategy, options) => {
  return (req, res, next) => {
    if (strategy === 'google') {
      if (options && options.scope) {
        // Initiating OAuth: mock redirect/rendering consent
        return res.status(302).setHeader('Location', 'https://accounts.google.com/o/oauth2/v2/auth').end();
      } else {
        // OAuth Callback: mock login success by injecting req.user
        req.user = {
          _id: '66a111111111111111111111',
          name: 'Google Test User',
          email: 'google@test.com',
        };
        return next();
      }
    }
    next();
  };
});

const app = require('../server');
const User = require('../src/models/User');

describe('Module 1: Authentication API Endpoints', () => {
  const mockUser = {
    _id: '66a111111111111111111111',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashedpassword123',
    comparePassword: jest.fn(),
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    mockUser.comparePassword.mockReset();
    mockUser.save.mockReset();
    mockUser.save.mockImplementation(function () {
      return Promise.resolve(this);
    });
  });

  describe('1. Email/Password Registration (POST /api/auth/register)', () => {
    test('successfully registers a user with valid fields', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: '66a222222222222222222222',
        name: 'John Doe',
        email: 'john@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    test('fails registration if name, email, or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Please enter all fields');
    });

    test('fails registration if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Password must be at least 6 characters');
    });

    test('fails registration if email is already registered', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Email already registered');
    });
  });

  describe('2. Login using JWT (POST /api/auth/login)', () => {
    test('successfully authenticates with valid credentials', async () => {
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
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.id).toBe(mockUser._id);
    });

    test('fails login if credentials are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Please enter email and password');
    });

    test('fails login if user email does not exist', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });

    test('fails login if password comparison fails', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid credentials');
    });
  });

  describe('3. Google OAuth Login (GET /api/auth/google & GET /api/auth/google/callback)', () => {
    test('initiating Google OAuth redirects successfully', async () => {
      const res = await request(app).get('/api/auth/google');
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('accounts.google.com');
    });

    test('Google OAuth callback generates and returns JWT securely', async () => {
      const res = await request(app).get('/api/auth/google/callback');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('google@test.com');
    });
  });

  describe('4. Password Reset Flow', () => {
    describe('Request Reset Link (POST /api/auth/forgot-password)', () => {
      test('successfully generates reset token and sends email', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

        const res = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'jane@example.com' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('Password reset link sent');
        expect(mockUser.resetPasswordToken).toBeDefined();
        expect(mockUser.resetPasswordExpires).toBeDefined();
      });

      test('returns 404 if email does not match any user', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        const res = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'noone@example.com' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('User not found');
      });
    });

    describe('Reset Password (POST /api/auth/reset-password)', () => {
      test('successfully resets password when valid token is provided', async () => {
        const rawToken = 'mock-reset-token';
        const hashedToken = crypto
          .createHash('sha256')
          .update(rawToken)
          .digest('hex');

        jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

        const res = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: rawToken,
            newPassword: 'newsecurepassword123',
          });

        expect(User.findOne).toHaveBeenCalledWith({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: expect.any(Number) },
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('successful');
        expect(mockUser.password).toBe('newsecurepassword123');
        expect(mockUser.resetPasswordToken).toBeUndefined();
        expect(mockUser.resetPasswordExpires).toBeUndefined();
      });

      test('fails resetting password if token is invalid or expired', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        const res = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'invalidtoken',
            newPassword: 'newsecurepassword123',
          });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Invalid or expired password reset token');
      });
    });
  });
});
