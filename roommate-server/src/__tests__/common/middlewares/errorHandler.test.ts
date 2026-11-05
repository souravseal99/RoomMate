import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import errorHandler from "@common/middlewares/errorHandlder";
import { ApiError } from "@common/errors/ApiError";
import { INTERNAL_SERVER_ERROR } from "@common/config";

describe("errorHandler Middleware (VULN-08 Defense)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: any;
  let statusMock: any;
  let nextMock: NextFunction;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    nextMock = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it("should sanitize unexpected internal database errors in production (VULN-08)", () => {
    process.env.NODE_ENV = "production";

    const internalDbError = new Error(
      "PrismaClientKnownRequestError: Table 'users' does not exist in schema 'public' at 10.0.0.4:5432",
    );

    errorHandler(
      internalDbError,
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      errorMessage: INTERNAL_SERVER_ERROR,
    });
    // Ensure raw database error message is never exposed to the client
    expect(jsonMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage: expect.stringContaining("PrismaClientKnownRequestError"),
      }),
    );
  });

  it("should expose detailed message in non-production for developer debugging", () => {
    process.env.NODE_ENV = "development";

    const devError = new Error("Debuggable dev error");

    errorHandler(
      devError,
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      errorMessage: "Debuggable dev error",
    });
  });

  it("should handle ApiError instances with custom statusCode and payload", () => {
    const apiError = new ApiError(
      StatusCodes.BAD_REQUEST,
      "Invalid input data",
      ["Field 'amount' must be positive"],
    );

    errorHandler(
      apiError,
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      errorMessage: "Invalid input data",
      errors: ["Field 'amount' must be positive"],
    });
  });

  it("should handle CSRF validation errors with 403 Forbidden", () => {
    const csrfError = Object.assign(new Error("Invalid CSRF token"), {
      code: "EBADCSRFTOKEN",
    });

    errorHandler(
      csrfError,
      mockRequest as Request,
      mockResponse as Response,
      nextMock,
    );

    expect(statusMock).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      errorMessage: "Invalid CSRF token",
      code: "EBADCSRFTOKEN",
    });
  });
});
