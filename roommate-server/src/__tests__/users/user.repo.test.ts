import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepo } from '@src/users/user.repo';
import prisma from '@src/common/utils/prisma';
import { User } from '@generated/prisma';

vi.mock('@src/common/utils/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('UserRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser: User = {
        userId: 'user-123',
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'hashed_password',
        createdAt: new Date('2024-01-01'),
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await UserRepo.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });

    it('should return null when not found or error occurs', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      expect(await UserRepo.getUserById('non-existent')).toBeNull();

      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB error'));
      expect(await UserRepo.getUserById('user-123')).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser: User = {
        userId: 'user-456',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'hashed_password',
        createdAt: new Date('2024-02-15'),
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const result = await UserRepo.getUserByEmail('bob@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'bob@example.com' },
      });
    });

    it('should return null when not found or error occurs', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      expect(await UserRepo.getUserByEmail('notfound@example.com')).toBeNull();

      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB error'));
      expect(await UserRepo.getUserByEmail('test@example.com')).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      const mockUser: User = {
        userId: 'user-789',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'hashed_password',
        createdAt: new Date('2024-11-05'),
      };
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await UserRepo.createUser('Charlie Brown', 'charlie@example.com', 'hashed_password');

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          password: 'hashed_password',
        },
      });
    });

    it('should throw error on duplicate email', async () => {
      const duplicateError = new Error('Unique constraint failed');
      (duplicateError as any).code = 'P2002';
      vi.mocked(prisma.user.create).mockRejectedValue(duplicateError);

      await expect(
        UserRepo.createUser('Eve', 'existing@example.com', 'pass')
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        { userId: 'user-1', name: 'Alice', email: 'alice@example.com', password: 'hash1', createdAt: new Date() },
        { userId: 'user-2', name: 'Bob', email: 'bob@example.com', password: 'hash2', createdAt: new Date() },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      const result = await UserRepo.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array or null for no users/error', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      expect(await UserRepo.getAllUsers()).toEqual([]);

      vi.mocked(prisma.user.findMany).mockRejectedValue(new Error('DB error'));
      expect(await UserRepo.getAllUsers()).toBeNull();
    });
  });
});
