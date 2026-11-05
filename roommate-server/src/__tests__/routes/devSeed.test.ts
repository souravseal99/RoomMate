import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as childProcess from "child_process";

vi.mock("child_process", () => ({
  exec: vi.fn(),
}));

describe("POST /dev/seed Security & Path Protection (VULN-15)", () => {
  const originalEnv = { ...process.env };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusCode = 200;
  let responseData: any = null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv };
    statusCode = 200;
    responseData = null;

    mockResponse = {
      status: vi.fn().mockImplementation((code: number) => {
        statusCode = code;
        return mockResponse;
      }),
      json: vi.fn().mockImplementation((data: any) => {
        responseData = data;
        return mockResponse;
      }),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should NOT mount /dev/seed route when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    process.env.ENABLE_DEV_SEED = "true";

    const { default: routes } = await import("@src/routes");

    const devSeedRoute = routes.stack.find(
      (layer: any) => layer.route && layer.route.path === "/dev/seed",
    );

    expect(devSeedRoute).toBeUndefined();
  });

  it("should NOT mount /dev/seed route in development when ENABLE_DEV_SEED is false", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_SEED = "false";

    const { default: routes } = await import("@src/routes");

    const devSeedRoute = routes.stack.find(
      (layer: any) => layer.route && layer.route.path === "/dev/seed",
    );

    expect(devSeedRoute).toBeUndefined();
  });

  it("should reject /dev/seed with 403 when x-dev-seed-secret header is missing", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_SEED = "true";
    process.env.DEV_SEED_SECRET = "super_secure_seed_token";

    const { default: routes } = await import("@src/routes");
    const devSeedLayer = routes.stack.find(
      (layer: any) => layer.route && layer.route.path === "/dev/seed",
    );
    expect(devSeedLayer).toBeDefined();

    const handler = devSeedLayer.route.stack[0].handle;
    mockRequest = {
      headers: {},
    };

    await handler(mockRequest as Request, mockResponse as Response);

    expect(statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(responseData).toEqual({
      message: "Forbidden: Invalid or missing dev seed secret",
    });
  });

  it("should reject /dev/seed with 403 when x-dev-seed-secret header is incorrect", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_SEED = "true";
    process.env.DEV_SEED_SECRET = "super_secure_seed_token";

    const { default: routes } = await import("@src/routes");
    const devSeedLayer = routes.stack.find(
      (layer: any) => layer.route && layer.route.path === "/dev/seed",
    );

    const handler = devSeedLayer.route.stack[0].handle;
    mockRequest = {
      headers: {
        "x-dev-seed-secret": "wrong_token",
      },
    };

    await handler(mockRequest as Request, mockResponse as Response);

    expect(statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(responseData).toEqual({
      message: "Forbidden: Invalid or missing dev seed secret",
    });
  });

  it("should execute idempotent seeder and return sanitized message when authorized", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_SEED = "true";
    process.env.DEV_SEED_SECRET = "super_secure_seed_token";

    vi.mocked(childProcess.exec).mockImplementation((_cmd, callback: any) => {
      callback(null, "Sensitive stdout path /var/internal/db", "");
      return {} as any;
    });

    const { default: routes } = await import("@src/routes");
    const devSeedLayer = routes.stack.find(
      (layer: any) => layer.route && layer.route.path === "/dev/seed",
    );

    const handler = devSeedLayer.route.stack[0].handle;
    mockRequest = {
      headers: {
        "x-dev-seed-secret": "super_secure_seed_token",
      },
    };

    await handler(mockRequest as Request, mockResponse as Response);

    expect(statusCode).toBe(StatusCodes.OK);
    // Verifies idempotent seeder is called instead of destructive seeder
    expect(childProcess.exec).toHaveBeenCalledWith(
      "npm run db:seed:idempotent",
      expect.any(Function),
    );
    expect(responseData).toEqual({
      message: "Database seeded successfully for development",
    });
    // Ensure sensitive stdout is NOT exposed to client
    expect(responseData.output).toBeUndefined();
  });

  it("should return sanitized 500 when seeding fails without leaking stderr or error message", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_SEED = "true";
    process.env.DEV_SEED_SECRET = "super_secure_seed_token";

    vi.mocked(childProcess.exec).mockImplementation((_cmd, callback: any) => {
      callback(
        new Error("Internal Prisma DB connection failure"),
        "",
        "Sensitive stderr trace",
      );
      return {} as any;
    });

    const { default: routes } = await import("@src/routes");
    const devSeedLayer = routes.stack.find(
      (layer: any) => layer.route && layer.route.path === "/dev/seed",
    );

    const handler = devSeedLayer.route.stack[0].handle;
    mockRequest = {
      headers: {
        "x-dev-seed-secret": "super_secure_seed_token",
      },
    };

    await handler(mockRequest as Request, mockResponse as Response);

    expect(statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(responseData).toEqual({
      message: "Seeding failed",
    });
    expect(responseData.error).toBeUndefined();
    expect(responseData.stderr).toBeUndefined();
  });
});
