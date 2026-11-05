import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  refreshTokenSetter,
} from "./refreshTokenSetter";

export class AuthController {
  static async register(request: Request, response: Response) {
    const { name, email, password } = request.body;
    const sessionId = request.headers["x-session-id"] as string;

    if (!sessionId) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Session ID required",
      });
    }

    const { status, data, message } = await AuthService.registerUser(
      name,
      email,
      password,
      sessionId,
    );

    const authData = data as {
      refreshToken?: string;
      [key: string]: any;
    } | null;

    if (authData?.refreshToken) {
      refreshTokenSetter(response, authData.refreshToken);
      const { refreshToken: _rt, ...clientData } = authData;
      return response.status(status).json({
        message,
        data: clientData,
      });
    }

    return response.status(status).json({
      message,
      data,
    });
  }

  static async login(request: Request, response: Response) {
    const { email, password } = request.body;
    const sessionId = request.headers["x-session-id"] as string;

    if (!sessionId) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Session ID required",
      });
    }

    const { status, data, message } = await AuthService.login(
      email,
      password,
      sessionId,
    );

    const authData = data as {
      refreshToken?: string;
      [key: string]: any;
    } | null;

    if (authData?.refreshToken) {
      refreshTokenSetter(response, authData.refreshToken);
      const { refreshToken: _rt, ...clientData } = authData;
      return response.status(status).json({
        message,
        data: clientData,
      });
    }

    return response.status(status).json({
      message,
      data,
    });
  }

  static async refresh(request: Request, response: Response) {
    const sessionId = request.headers["x-session-id"] as string;
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!sessionId) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Session ID required",
      });
    }

    if (!refreshToken) {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: "Refresh token cookie missing",
      });
    }

    const { status, data, message } = await AuthService.refresh(
      refreshToken,
      sessionId,
    );

    const authData = data as {
      refreshToken?: string;
      [key: string]: any;
    } | null;

    if (authData?.refreshToken) {
      refreshTokenSetter(response, authData.refreshToken);
      const { refreshToken: _rt, ...clientData } = authData;
      return response.status(status).json({
        message,
        data: clientData,
      });
    }

    return response.status(status).json({
      message,
      data,
    });
  }

  static async logout(request: Request, response: Response) {
    const sessionId = request.headers["x-session-id"] as string;

    await AuthService.logout(sessionId);
    clearRefreshTokenCookie(response);

    return response.status(StatusCodes.OK).json({
      message: "Logged out successfully",
    });
  }
}
