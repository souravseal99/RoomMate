import { describe, it, expect, vi } from "vitest";
import {
  generateCsrfToken,
  doubleCsrfProtection,
} from "@common/middlewares/csrf";
import { Request, Response, NextFunction } from "express";

describe("CSRF Protection Middleware", () => {
  it("should allow safe HTTP methods (GET, HEAD, OPTIONS) without a CSRF token", () => {
    const req = {
      method: "GET",
      path: "/household/all",
      headers: {},
      cookies: {},
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    doubleCsrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should generate a CSRF token and set the cookie", () => {
    const cookieMock = vi.fn();
    const req = {
      headers: { "x-session-id": "session-123" },
      cookies: {},
    } as unknown as Request;

    const res = {
      cookie: cookieMock,
    } as unknown as Response;

    const token = generateCsrfToken(req, res);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(10);
    expect(cookieMock).toHaveBeenCalledWith(
      "x-csrf-token",
      token,
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: expect.stringMatching(/lax|none|strict/),
      }),
    );
  });

  it("should allow public auth route POST /auth/login without a CSRF token", () => {
    const req = {
      method: "POST",
      path: "/auth/login",
      originalUrl: "/auth/login",
      headers: {},
      cookies: {},
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    doubleCsrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should allow public auth route POST /auth/register without a CSRF token", () => {
    const req = {
      method: "POST",
      path: "/auth/register",
      originalUrl: "/auth/register",
      headers: {},
      cookies: {},
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    doubleCsrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should reject mutating requests (POST) on protected endpoints when CSRF token is missing", () => {
    const req = {
      method: "POST",
      path: "/expense/create",
      originalUrl: "/expense/create",
      headers: {},
      cookies: {},
    } as unknown as Request;

    const res = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    doubleCsrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "EBADCSRFTOKEN",
      }),
    );
  });

  it("should accept mutating requests (POST) on protected endpoints when valid CSRF token and cookie are provided", () => {
    const cookieMock = vi.fn();
    const reqGen = {
      headers: { "x-session-id": "session-456" },
      cookies: {},
    } as unknown as Request;

    const resGen = {
      cookie: cookieMock,
    } as unknown as Response;

    const validToken = generateCsrfToken(reqGen, resGen);

    const reqPost = {
      method: "POST",
      path: "/expense/create",
      originalUrl: "/expense/create",
      headers: {
        "x-session-id": "session-456",
        "x-csrf-token": validToken,
      },
      cookies: {
        "x-csrf-token": validToken,
      },
    } as unknown as Request;

    const resPost = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    doubleCsrfProtection(reqPost, resPost, next);

    expect(next).toHaveBeenCalledWith();
  });
});
