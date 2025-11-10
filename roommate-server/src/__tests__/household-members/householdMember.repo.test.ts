import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HouseholdMemberRepo } from '@src/household-members/householdMember.repo';
import prisma from '@src/common/utils/prisma';
import { Role } from '@generated/prisma';

vi.mock('@src/common/utils/prisma', () => ({
  default: {
    householdMember: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('HouseholdMemberRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create household member with custom data', async () => {
      const memberBody = {
        userId: 'user-123',
        householdId: 'household-123',
        role: Role.ADMIN,
      };

      const mockMember = {
        householdMemberId: 'member-123',
        userId: 'user-123',
        householdId: 'household-123',
        role: Role.ADMIN,
      };

      vi.mocked(prisma.householdMember.create).mockResolvedValue(mockMember);

      const result = await HouseholdMemberRepo.create(memberBody);

      expect(prisma.householdMember.create).toHaveBeenCalledWith({
        data: memberBody,
      });
      expect(result).toEqual(mockMember);
    });
  });

  describe('isExistingUser', () => {
    it('should return member when user exists in household', async () => {
      const mockMember = {
        householdMemberId: 'member-456',
        userId: 'user-456',
        householdId: 'household-456',
        role: Role.MEMBER,
      };

      vi.mocked(prisma.householdMember.findUnique).mockResolvedValue(mockMember);

      const result = await HouseholdMemberRepo.isExistingUser('user-456', 'household-456');

      expect(prisma.householdMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_householdId: {
            userId: 'user-456',
            householdId: 'household-456',
          },
        },
      });
      expect(result).toEqual(mockMember);
    });

    it('should return null when user not in household', async () => {
      vi.mocked(prisma.householdMember.findUnique).mockResolvedValue(null);

      const result = await HouseholdMemberRepo.isExistingUser('user-999', 'household-999');

      expect(prisma.householdMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_householdId: {
            userId: 'user-999',
            householdId: 'household-999',
          },
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('join', () => {
    it('should join household as MEMBER role', async () => {
      const mockMember = {
        householdMemberId: 'member-789',
        userId: 'user-789',
        householdId: 'household-789',
        role: Role.MEMBER,
      };

      vi.mocked(prisma.householdMember.create).mockResolvedValue(mockMember);

      const result = await HouseholdMemberRepo.join('user-789', 'household-789');

      expect(prisma.householdMember.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-789',
          householdId: 'household-789',
          role: Role.MEMBER,
        },
      });
      expect(result).toEqual(mockMember);
      expect(result.role).toBe(Role.MEMBER);
    });
  });

  describe('getByHouseholdId', () => {
    it('should get all members with user details', async () => {
      const mockMembers = [
        {
          householdMemberId: 'member-1',
          userId: 'user-1',
          householdId: 'household-123',
          role: Role.ADMIN,
          user: {
            name: 'Alice',
            email: 'alice@example.com',
          },
        },
        {
          householdMemberId: 'member-2',
          userId: 'user-2',
          householdId: 'household-123',
          role: Role.MEMBER,
          user: {
            name: 'Bob',
            email: 'bob@example.com',
          },
        },
      ];

      vi.mocked(prisma.householdMember.findMany).mockResolvedValue(mockMembers as any);

      const result = await HouseholdMemberRepo.getByHouseholdId('household-123');

      expect(prisma.householdMember.findMany).toHaveBeenCalledWith({
        where: { householdId: 'household-123' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].user.name).toBe('Alice');
      expect(result[1].user.name).toBe('Bob');
    });

    it('should return empty array when no members', async () => {
      vi.mocked(prisma.householdMember.findMany).mockResolvedValue([]);

      const result = await HouseholdMemberRepo.getByHouseholdId('household-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
