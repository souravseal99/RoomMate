import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import * as jwtHandler from "@common/utils/jwtHandler";

vi.mock("@common/utils/jwtHandler", () => ({
  validateAccessToken: vi.fn(),
}));

describe("ensureAuthenticated Middleware (VULN-08 Defense)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: any;
  let statusMock: any;
  let nextMock: NextFunction;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    nextMock = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return 401 when Authorization header is missing", async () => {
    mockRequest.headers = {};

    await ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Token not found",
    });
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header does not start with Bearer", async () => {
    mockRequest.headers = {
      authorization: "Basic dXNlcjpwYXNz",
    };

    await ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Token not found",
    });
    expect(nextMock).not.toHaveBeenCalled();
  });

  it("should set request.user and call next() when token is valid", async () => {
    mockRequest.headers = {
      authorization: "Bearer valid_jwt_token",
    };

    const mockPayload = { userId: "user-abc-123" };
    vi.mocked(jwtHandler.validateAccessToken).mockReturnValue(
      mockPayload as any,
    );

    await ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(jwtHandler.validateAccessToken).toHaveBeenCalledWith(
      "valid_jwt_token",
    );
    expect((mockRequest as any).user).toEqual(mockPayload);
    expect(nextMock).toHaveBeenCalledWith();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("should return 401 and sanitize response without leaking internal JWT errors (VULN-08)", async () => {
    mockRequest.headers = {
      authorization: "Bearer invalid_malformed_token",
    };

    const jwtError = new Error(
      "JsonWebTokenError: jwt malformed at Object.verify (/node_modules/jsonwebtoken)",
    );
    vi.mocked(jwtHandler.validateAccessToken).mockImplementation(() => {
      throw jwtError;
    });

    await ensureAuthenticated(
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    // Response must only contain clean message, never the raw error or stack
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Invalid or Expired token",
    });
    expect(jsonMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.anything(),
      }),
    );
    expect(nextMock).not.toHaveBeenCalled();
  });
});
