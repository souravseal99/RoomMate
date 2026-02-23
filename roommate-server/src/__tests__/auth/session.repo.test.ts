import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SessionRepo } from '@src/auth/session.repo';
import prisma from '@common/utils/prisma';

vi.mock('@common/utils/prisma', () => ({
  default: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('SessionRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const sessionId = 'session-123';
      const userId = 'user-456';
      const refreshToken = 'refresh-token-abc';
      const expiresAt = new Date('2025-12-31T23:59:59Z');

      const expectedSession = {
        sessionId,
        userId,
        refreshToken,
        expiresAt,
        createdAt: new Date('2025-11-05T10:00:00Z'),
      };

      vi.mocked(prisma.session.create).mockResolvedValue(expectedSession);

      const result = await SessionRepo.createSession(sessionId, userId, refreshToken, expiresAt);

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: { sessionId, userId, refreshToken, expiresAt },
      });
      expect(result).toEqual(expectedSession);
    });
  });

  describe('getSession', () => {
    it('should retrieve session with user relation', async () => {
      const sessionId = 'session-123';
      const expectedSession = {
        sessionId,
        userId: 'user-456',
        refreshToken: 'refresh-token-abc',
        createdAt: new Date('2025-11-05T10:00:00Z'),
        expiresAt: new Date('2025-12-31T23:59:59Z'),
        user: {
          userId: 'user-456',
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed-password',
        },
      };

      vi.mocked(prisma.session.findUnique).mockResolvedValue(expectedSession);

      const result = await SessionRepo.getSession(sessionId);

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionId },
        include: { user: true },
      });
      expect(result).toEqual(expectedSession);
      expect(result?.user.email).toBe('john@example.com');
    });

    it('should return null when session not found', async () => {
      vi.mocked(prisma.session.findUnique).mockResolvedValue(null);

      const result = await SessionRepo.getSession('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('should delete session by sessionId', async () => {
      const sessionId = 'session-to-delete';
      const deletedSession = {
        sessionId,
        userId: 'user-456',
        refreshToken: 'refresh-token-abc',
        createdAt: new Date('2025-11-05T10:00:00Z'),
        expiresAt: new Date('2025-12-31T23:59:59Z'),
      };

      vi.mocked(prisma.session.delete).mockResolvedValue(deletedSession);

      const result = await SessionRepo.deleteSession(sessionId);

      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { sessionId },
      });
      expect(result).toEqual(deletedSession);
    });
  });

  describe('deleteUserSessions', () => {
    it('should delete all sessions for a user', async () => {
      const userId = 'user-456';
      const deleteResult = { count: 3 };

      vi.mocked(prisma.session.deleteMany).mockResolvedValue(deleteResult);

      const result = await SessionRepo.deleteUserSessions(userId);

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result.count).toBe(3);
    });

    it('should return count of 0 when user has no sessions', async () => {
      const userId = 'user-no-sessions';
      const deleteResult = { count: 0 };

      vi.mocked(prisma.session.deleteMany).mockResolvedValue(deleteResult);

      const result = await SessionRepo.deleteUserSessions(userId);

      expect(result.count).toBe(0);
    });
  });
});
