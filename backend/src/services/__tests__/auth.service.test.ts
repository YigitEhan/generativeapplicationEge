import { AuthService } from '../auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'RECRUITER',
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw error if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'RECRUITER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});

