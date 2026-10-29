import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import userRouter from "@src/users/user.routes";
import { UserController } from "@src/users/user.controller";
import { UserService } from "@src/users/user.service";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/users/user.service");

describe("User Routes & Privacy (Anti-Enumeration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should NOT expose GET /all endpoint (prohibiting global user enumeration)", () => {
    const registeredPaths = userRouter.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: layer.route.methods,
      }));

    const hasGetAllUsersRoute = registeredPaths.some(
      (r) => r.path === "/all" && r.methods.get,
    );

    expect(hasGetAllUsersRoute).toBe(false);
  });

  it("should mount GET /profile endpoint", () => {
    const registeredPaths = userRouter.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: layer.route.methods,
      }));

    const hasProfileRoute = registeredPaths.some(
      (r) => r.path === "/profile" && r.methods.get,
    );

    expect(hasProfileRoute).toBe(true);
  });

  it("UserController.profile should only return the authenticated user's own profile", async () => {
    const mockRequest = {
      user: { userId: "user-current-123" },
    } as unknown as Request;

    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    const mockProfile = {
      userId: "user-current-123",
      name: "Alice",
      email: "alice@example.com",
    };

    vi.mocked(UserService.profile).mockResolvedValue({
      status: StatusCodes.OK,
      message: "User Profile",
      data: mockProfile as any,
    });

    await UserController.profile(mockRequest, mockResponse);

    expect(UserService.profile).toHaveBeenCalledWith("user-current-123");
    expect(statusMock).toHaveBeenCalledWith(StatusCodes.OK);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockProfile,
      }),
    );
  });
});
