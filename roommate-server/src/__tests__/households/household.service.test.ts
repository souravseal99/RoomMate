import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role, Household } from '@generated/prisma';
import { StatusCodes } from 'http-status-codes';

// Mock Prisma FIRST to prevent PrismaClient instantiation errors
vi.mock('@src/common/utils/prisma', () => ({
  default: {},
}));

vi.mock('@src/users/user.repo');
vi.mock('@src/households/household.repo');
vi.mock('@src/household-members/householdMember.repo');

import { HouseholdService } from '@src/households/household.service';
import { HouseholdRepository } from '@src/households/household.repo';
import { UserRepo } from '@src/users/user.repo';
import { HouseholdMemberRepo } from '@src/household-members/householdMember.repo';
import UserDto from '@src/common/dtos/UserDto';

describe('HouseholdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create household with unique name', async () => {
      const mockUser = {
        userId: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed_password',
        createdAt: new Date('2025-11-01'),
      };

      const mockHousehold: Household = {
        householdId: 'household-123',
        name: 'My House',
        inviteCode: 'ABC12345',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(HouseholdRepository.findNamesLikeByUser).mockResolvedValue([]);
      vi.mocked(HouseholdRepository.create).mockResolvedValue(mockHousehold as any);

      const result = await HouseholdService.create('user-123', 'My House');

      expect(UserRepo.getUserById).toHaveBeenCalledWith('user-123');
      expect(HouseholdRepository.findNamesLikeByUser).toHaveBeenCalledWith('user-123', 'My House');
      expect(HouseholdRepository.create).toHaveBeenCalledWith('My House', 'user-123', Role.ADMIN);
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        message: 'Household created',
        data: {
          household: mockHousehold,
        },
      });
    });

    it('should create household with numbered suffix when name exists', async () => {
      const mockUser = {
        userId: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed_password',
        createdAt: new Date('2025-11-01'),
      };

      const existingNames = [
        { name: 'My House' },
        { name: 'My House (1)' },
      ];

      const mockHousehold: Household = {
        householdId: 'household-456',
        name: 'My House (2)',
        inviteCode: 'XYZ98765',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(HouseholdRepository.findNamesLikeByUser).mockResolvedValue(existingNames);
      vi.mocked(HouseholdRepository.create).mockResolvedValue(mockHousehold as any);

      const result = await HouseholdService.create('user-123', 'My House');

      expect(HouseholdRepository.findNamesLikeByUser).toHaveBeenCalledWith('user-123', 'My House');
      expect(HouseholdRepository.create).toHaveBeenCalledWith('My House (2)', 'user-123', Role.ADMIN);
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        data: {
          household: mockHousehold,
        },
      });
    });

    it('should reject creation when user not found', async () => {
      vi.mocked(UserRepo.getUserById).mockResolvedValue(null);

      const result = await HouseholdService.create('user-nonexistent', 'My House');

      expect(UserRepo.getUserById).toHaveBeenCalledWith('user-nonexistent');
      expect(HouseholdRepository.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      });
    });

    it('should trim whitespace from household name', async () => {
      const mockUser = {
        userId: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed_password',
        createdAt: new Date('2025-11-01'),
      };

      const mockHousehold: Household = {
        householdId: 'household-789',
        name: 'My House',
        inviteCode: 'TRIM1234',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(HouseholdRepository.findNamesLikeByUser).mockResolvedValue([]);
      vi.mocked(HouseholdRepository.create).mockResolvedValue(mockHousehold as any);

      await HouseholdService.create('user-123', '  My House  ');

      expect(HouseholdRepository.findNamesLikeByUser).toHaveBeenCalledWith('user-123', '  My House  ');
      expect(HouseholdRepository.create).toHaveBeenCalledWith('My House', 'user-123', Role.ADMIN);
    });
  });

  describe('getHouseholdsByUser', () => {
    it('should successfully get all households for user', async () => {
      const mockUser = {
        userId: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed_password',
        createdAt: new Date('2025-11-01'),
      };

      const mockHouseholds = [
        {
          householdId: 'household-1',
          name: 'House 1',
          inviteCode: 'CODE1111',
          createdAt: new Date('2025-11-05'),
          members: [],
        },
        {
          householdId: 'household-2',
          name: 'House 2',
          inviteCode: 'CODE2222',
          createdAt: new Date('2025-11-05'),
          members: [],
        },
      ];

      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(HouseholdRepository.getHouseholdsByUser).mockResolvedValue(mockHouseholds as any);

      const result = await HouseholdService.getHouseholdsByUser('user-123');

      expect(UserRepo.getUserById).toHaveBeenCalledWith('user-123');
      expect(HouseholdRepository.getHouseholdsByUser).toHaveBeenCalledWith('user-123');
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: 'Households for the user: Alice',
        data: {
          household: mockHouseholds,
        },
      });
    });

    it('should reject when user not found', async () => {
      vi.mocked(UserRepo.getUserById).mockResolvedValue(null);

      const result = await HouseholdService.getHouseholdsByUser('user-nonexistent');

      expect(UserRepo.getUserById).toHaveBeenCalledWith('user-nonexistent');
      expect(HouseholdRepository.getHouseholdsByUser).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      });
    });
  });

  describe('delete', () => {
    it('should successfully delete household', async () => {
      const mockHousehold = {
        householdId: 'household-123',
        name: 'House to Delete',
        inviteCode: 'DELETE12',
        createdAt: new Date('2025-11-05'),
      };

      const mockDeleteResponse = [
        { count: 2 }, // members
        { count: 5 }, // splits
        { count: 3 }, // expenses
        { count: 1 }, // chores
        { count: 4 }, // inventory
        mockHousehold, // household
      ];

      vi.mocked(HouseholdRepository.getHouseholdById).mockResolvedValue(mockHousehold);
      vi.mocked(HouseholdRepository.delete).mockResolvedValue(mockDeleteResponse as any);

      const result = await HouseholdService.delete('household-123');

      expect(HouseholdRepository.getHouseholdById).toHaveBeenCalledWith('household-123');
      expect(HouseholdRepository.delete).toHaveBeenCalledWith('household-123');
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: 'Household deleted successfully',
        data: {
          household: mockDeleteResponse,
        },
      });
    });

    it('should reject when household not found', async () => {
      vi.mocked(HouseholdRepository.getHouseholdById).mockResolvedValue(null);

      const result = await HouseholdService.delete('household-nonexistent');

      expect(HouseholdRepository.getHouseholdById).toHaveBeenCalledWith('household-nonexistent');
      expect(HouseholdRepository.delete).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: 'Household not found',
      });
    });
  });

  describe('join', () => {
    it('should successfully join household with invite code', async () => {
      const mockHousehold: Household = {
        householdId: 'household-123',
        name: 'Shared House',
        inviteCode: 'INVITE12',
        createdAt: new Date('2025-11-05'),
      };

      const mockUser = {
        userId: 'user-456',
        name: 'Bob',
        email: 'bob@example.com',
        password: 'hashed_password',
        createdAt: new Date('2025-11-01'),
      };

      const mockJoinedMember = {
        householdMemberId: 'member-789',
        userId: 'user-456',
        householdId: 'household-123',
        role: Role.MEMBER,
      };

      vi.mocked(HouseholdRepository.getHouseholdByInviteCode).mockResolvedValue(mockHousehold);
      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);
      vi.mocked(HouseholdMemberRepo.join).mockResolvedValue(mockJoinedMember);

      const result = await HouseholdService.join('INVITE12', 'user-456');

      expect(HouseholdRepository.getHouseholdByInviteCode).toHaveBeenCalledWith('INVITE12');
      expect(UserRepo.getUserById).toHaveBeenCalledWith('user-456');
      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith('user-456', 'household-123');
      expect(HouseholdMemberRepo.join).toHaveBeenCalledWith('user-456', 'household-123');
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        message: 'Joined the Household',
        data: {
          household: {
            ...mockJoinedMember,
            householdName: 'Shared House',
          },
        },
      });
    });

    it('should reject when user already member of household', async () => {
      const mockHousehold: Household = {
        householdId: 'household-123',
        name: 'Shared House',
        inviteCode: 'INVITE12',
        createdAt: new Date('2025-11-05'),
      };

      const mockUser = {
        userId: 'user-456',
        name: 'Bob',
        email: 'bob@example.com',
        password: 'hashed_password',
        createdAt: new Date('2025-11-01'),
      };

      const existingMember = {
        householdMemberId: 'member-existing',
        userId: 'user-456',
        householdId: 'household-123',
        role: Role.MEMBER,
      };

      vi.mocked(HouseholdRepository.getHouseholdByInviteCode).mockResolvedValue(mockHousehold);
      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(existingMember);

      const result = await HouseholdService.join('INVITE12', 'user-456');

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith('user-456', 'household-123');
      expect(HouseholdMemberRepo.join).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.CONFLICT,
        message: 'User already exists in this household: household-123',
        data: {
          userId: 'user-456',
          householdId: 'household-123',
          householdName: 'Shared House',
        },
      });
    });

    it('should reject when household not found by invite code', async () => {
      vi.mocked(HouseholdRepository.getHouseholdByInviteCode).mockResolvedValue(null);

      const result = await HouseholdService.join('INVALID_CODE', 'user-456');

      expect(HouseholdRepository.getHouseholdByInviteCode).toHaveBeenCalledWith('INVALID_CODE');
      expect(UserRepo.getUserById).not.toHaveBeenCalled();
      expect(HouseholdMemberRepo.join).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: 'Household not found',
      });
    });
  });
});
