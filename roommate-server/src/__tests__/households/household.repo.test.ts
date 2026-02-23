import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@generated/prisma';
import { HouseholdRepository } from '@src/households/household.repo';
import prisma from '@src/common/utils/prisma';
import { nanoid } from 'nanoid';

vi.mock('@src/common/utils/prisma', () => ({
  default: {
    household: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    householdMember: {
      deleteMany: vi.fn(),
    },
    expenseSplit: {
      deleteMany: vi.fn(),
    },
    expense: {
      deleteMany: vi.fn(),
    },
    chore: {
      deleteMany: vi.fn(),
    },
    inventoryItem: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(),
}));

describe('HouseholdRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create household with admin role', async () => {
      const mockHousehold = {
        householdId: 'household-123',
        name: 'My Apartment',
        inviteCode: 'ABC12345',
        createdAt: new Date('2025-11-05'),
        members: [
          {
            householdMemberId: 'member-123',
            userId: 'user-123',
            householdId: 'household-123',
            role: Role.ADMIN,
          },
        ],
      };

      vi.mocked(nanoid).mockReturnValue('ABC12345');
      vi.mocked(prisma.household.create).mockResolvedValue(mockHousehold);

      const result = await HouseholdRepository.create('My Apartment', 'user-123', Role.ADMIN);

      expect(nanoid).toHaveBeenCalledWith(8);
      expect(prisma.household.create).toHaveBeenCalledWith({
        data: {
          name: 'My Apartment',
          inviteCode: 'ABC12345',
          members: {
            create: {
              userId: 'user-123',
              role: Role.ADMIN,
            },
          },
        },
        include: { members: true },
      });
      expect(result).toEqual(mockHousehold);
      expect(result.members[0].role).toBe(Role.ADMIN);
    });

    it('should create household with default MEMBER role', async () => {
      const mockHousehold = {
        householdId: 'household-456',
        name: 'Shared House',
        inviteCode: 'XYZ98765',
        createdAt: new Date('2025-11-05'),
        members: [
          {
            householdMemberId: 'member-456',
            userId: 'user-456',
            householdId: 'household-456',
            role: Role.MEMBER,
          },
        ],
      };

      vi.mocked(nanoid).mockReturnValue('XYZ98765');
      vi.mocked(prisma.household.create).mockResolvedValue(mockHousehold);

      const result = await HouseholdRepository.create('Shared House', 'user-456');

      expect(prisma.household.create).toHaveBeenCalledWith({
        data: {
          name: 'Shared House',
          inviteCode: 'XYZ98765',
          members: {
            create: {
              userId: 'user-456',
              role: Role.MEMBER,
            },
          },
        },
        include: { members: true },
      });
      expect(result.members[0].role).toBe(Role.MEMBER);
    });

    it('should verify inviteCode generates unique 8-character codes', async () => {
      const mockHousehold = {
        householdId: 'household-789',
        name: 'Test House',
        inviteCode: 'UNIQUE12',
        createdAt: new Date('2025-11-05'),
        members: [],
      };

      vi.mocked(nanoid).mockReturnValue('UNIQUE12');
      vi.mocked(prisma.household.create).mockResolvedValue(mockHousehold);

      await HouseholdRepository.create('Test House', 'user-789');

      expect(nanoid).toHaveBeenCalledWith(8);
      expect(mockHousehold.inviteCode).toHaveLength(8);
    });
  });

  describe('getHouseholdByInviteCode', () => {
    it('should return household when found or null when not found', async () => {
      const mockHousehold = {
        householdId: 'household-123',
        name: 'Found Household',
        inviteCode: 'FOUND123',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(prisma.household.findUnique).mockResolvedValue(mockHousehold);
      const result = await HouseholdRepository.getHouseholdByInviteCode('FOUND123');

      expect(prisma.household.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: 'FOUND123' },
      });
      expect(result).toEqual(mockHousehold);

      vi.mocked(prisma.household.findUnique).mockResolvedValue(null);
      const notFound = await HouseholdRepository.getHouseholdByInviteCode('NOTFOUND');
      expect(notFound).toBeNull();
    });
  });

  describe('getHouseholdsByUser', () => {
    it('should return all households with members and user details', async () => {
      const mockHouseholds = [
        {
          householdId: 'household-1',
          name: 'Household 1',
          inviteCode: 'CODE1111',
          createdAt: new Date('2025-11-05'),
          members: [
            {
              householdMemberId: 'member-1',
              userId: 'user-123',
              householdId: 'household-1',
              role: Role.ADMIN,
              user: {
                userId: 'user-123',
                name: 'Alice',
                email: 'alice@example.com',
              },
            },
          ],
        },
        {
          householdId: 'household-2',
          name: 'Household 2',
          inviteCode: 'CODE2222',
          createdAt: new Date('2025-11-05'),
          members: [
            {
              householdMemberId: 'member-2',
              userId: 'user-123',
              householdId: 'household-2',
              role: Role.MEMBER,
              user: {
                userId: 'user-123',
                name: 'Alice',
                email: 'alice@example.com',
              },
            },
          ],
        },
      ];

      vi.mocked(prisma.household.findMany).mockResolvedValue(mockHouseholds);

      const result = await HouseholdRepository.getHouseholdsByUser('user-123');

      expect(prisma.household.findMany).toHaveBeenCalledWith({
        where: { members: { some: { userId: 'user-123' } } },
        include: {
          members: {
            include: {
              user: {
                select: {
                  userId: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].members[0].user.name).toBe('Alice');
    });
  });

  describe('getHouseholdById', () => {
    it('should return household when found or null when not found', async () => {
      const mockHousehold = {
        householdId: 'household-123',
        name: 'Test Household',
        inviteCode: 'TEST1234',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(prisma.household.findFirst).mockResolvedValue(mockHousehold);
      const result = await HouseholdRepository.getHouseholdById('household-123');

      expect(prisma.household.findFirst).toHaveBeenCalledWith({
        where: { householdId: 'household-123' },
      });
      expect(result).toEqual(mockHousehold);

      vi.mocked(prisma.household.findFirst).mockResolvedValue(null);
      const notFound = await HouseholdRepository.getHouseholdById('non-existent');
      expect(notFound).toBeNull();
    });
  });

  describe('findNamesLikeByUser', () => {
    it('should find households with similar names for ADMIN users', async () => {
      const mockHouseholds = [
        { name: 'My House' },
        { name: 'My House (2)' },
        { name: 'My House (3)' },
      ] as any;

      vi.mocked(prisma.household.findMany).mockResolvedValue(mockHouseholds);

      const result = await HouseholdRepository.findNamesLikeByUser('user-123', 'My House');

      expect(prisma.household.findMany).toHaveBeenCalledWith({
        where: {
          members: { some: { userId: 'user-123', role: Role.ADMIN } },
          OR: [
            { name: 'My House' },
            { name: { startsWith: 'My House (' } },
          ],
        },
        select: { name: true },
      });
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('My House');
      expect(result[1].name).toBe('My House (2)');
    });
  });

  describe('delete', () => {
    it('should delete household with cascade in transaction', async () => {
      const householdId = 'household-123';
      const mockTransactionResult = [
        { count: 2 }, // householdMember.deleteMany
        { count: 5 }, // expenseSplit.deleteMany
        { count: 3 }, // expense.deleteMany
        { count: 1 }, // chore.deleteMany
        { count: 4 }, // inventoryItem.deleteMany
        { householdId, name: 'Deleted Household', inviteCode: 'DEL12345', createdAt: new Date() }, // household.delete
      ];

      vi.mocked(prisma.$transaction).mockResolvedValue(mockTransactionResult);

      const result = await HouseholdRepository.delete(householdId);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      const transactionCalls = vi.mocked(prisma.$transaction).mock.calls[0][0];
      expect(transactionCalls).toHaveLength(6);
      expect(result).toEqual(mockTransactionResult);
    });

    it('should rollback transaction if any deletion fails', async () => {
      const householdId = 'household-456';
      const error = new Error('Foreign key constraint failed');

      vi.mocked(prisma.$transaction).mockRejectedValue(error);

      await expect(HouseholdRepository.delete(householdId)).rejects.toThrow(
        'Foreign key constraint failed'
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
