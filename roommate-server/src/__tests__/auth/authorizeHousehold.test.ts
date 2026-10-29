import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { authorizeHousehold } from "@src/auth/middlewares/authorizeHousehold";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { Role } from "@generated/prisma";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/household-members/householdMember.repo", () => ({
  HouseholdMemberRepo: {
    isExistingUser: vi.fn(),
  },
}));

describe("authorizeHousehold Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = vi.fn();
  });

  it("should reject with 401 when request.user is missing (unauthenticated)", async () => {
    mockRequest = {
      params: { householdId: "household-123" },
      body: {},
      query: {},
    };

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/authentication required/i),
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should reject with 400 when householdId is missing from params, body, and query", async () => {
    mockRequest = {
      user: { userId: "user-123" },
      params: {},
      body: {},
      query: {},
    };

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/household id is required/i),
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should correctly extract householdId from request params", async () => {
    mockRequest = {
      user: { userId: "user-123" },
      params: { householdId: "household-from-params" },
      body: {},
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce({
      householdMemberId: "hm-1",
      userId: "user-123",
      householdId: "household-from-params",
      role: Role.MEMBER,
    } as any);

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
      "user-123",
      "household-from-params",
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.householdMember).toBeDefined();
  });

  it("should correctly extract householdId from request body", async () => {
    mockRequest = {
      user: { userId: "user-123" },
      params: {},
      body: { householdId: "household-from-body" },
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce({
      householdMemberId: "hm-2",
      userId: "user-123",
      householdId: "household-from-body",
      role: Role.MEMBER,
    } as any);

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
      "user-123",
      "household-from-body",
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.householdMember).toBeDefined();
  });

  it("should correctly extract householdId from request query", async () => {
    mockRequest = {
      user: { userId: "user-123" },
      params: {},
      body: {},
      query: { householdId: "household-from-query" },
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce({
      householdMemberId: "hm-3",
      userId: "user-123",
      householdId: "household-from-query",
      role: Role.MEMBER,
    } as any);

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
      "user-123",
      "household-from-query",
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.householdMember).toBeDefined();
  });

  it("should reject with 403 when user does not belong to the household", async () => {
    mockRequest = {
      user: { userId: "intruder-user" },
      params: { householdId: "household-123" },
      body: {},
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce(null);

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/you do not belong to this household/i),
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should allow a valid member when requireAdmin is false or default", async () => {
    const memberRecord = {
      householdMemberId: "hm-123",
      userId: "user-123",
      householdId: "household-123",
      role: Role.MEMBER,
    };

    mockRequest = {
      user: { userId: "user-123" },
      params: { householdId: "household-123" },
      body: {},
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce(
      memberRecord as any,
    );

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.householdMember).toEqual(memberRecord);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("should reject with 403 when requireAdmin is true but user has Role.MEMBER", async () => {
    mockRequest = {
      user: { userId: "user-member" },
      params: { householdId: "household-123" },
      body: {},
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce({
      householdMemberId: "hm-123",
      userId: "user-member",
      householdId: "household-123",
      role: Role.MEMBER,
    } as any);

    const middleware = authorizeHousehold({ requireAdmin: true });
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/admin privileges required/i),
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should allow access when requireAdmin is true and user has Role.ADMIN", async () => {
    const adminRecord = {
      householdMemberId: "hm-admin",
      userId: "user-admin",
      householdId: "household-123",
      role: Role.ADMIN,
    };

    mockRequest = {
      user: { userId: "user-admin" },
      params: { householdId: "household-123" },
      body: {},
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValueOnce(
      adminRecord as any,
    );

    const middleware = authorizeHousehold({ requireAdmin: true });
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRequest.householdMember).toEqual(adminRecord);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("should handle unexpected database errors gracefully with 500", async () => {
    mockRequest = {
      user: { userId: "user-123" },
      params: { householdId: "household-123" },
      body: {},
      query: {},
    };

    vi.mocked(HouseholdMemberRepo.isExistingUser).mockRejectedValueOnce(
      new Error("Database connection lost"),
    );

    const middleware = authorizeHousehold();
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/failed to authorize household access/i),
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
