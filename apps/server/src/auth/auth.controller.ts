import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import { SessionRepo } from "./session.repo";

export class AuthController {
  static async register(request: Request, response: Response) {
    const { name, email, password } = request.body;
    const sessionId = request.headers['x-session-id'] as string;

    if (!sessionId) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Session ID required"
      });
    }

    const { status, data, message } = await AuthService.registerUser(
      name,
      email,
      password,
      sessionId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async login(request: Request, response: Response) {
    const { email, password } = request.body;
    const sessionId = request.headers['x-session-id'] as string;

    if (!sessionId) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: "Session ID required"
      });
    }

    const { status, data, message } = await AuthService.login(email, password, sessionId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async refresh(request: Request, response: Response) {
    const sessionId = request.headers['x-session-id'] as string;
    
    if (!sessionId) {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: "No session ID provided",
      });
    }

    const session = await SessionRepo.getSession(sessionId);

    if (!session) {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid session",
      });
    }

    if (new Date() > session.expiresAt) {
      await SessionRepo.deleteSession(sessionId);
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: "Session expired",
      });
    }

    const { status, data, message } = await AuthService.refresh(session.refreshToken, session.userId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async logout(request: Request, response: Response) {
    const sessionId = request.headers['x-session-id'] as string;
    
    if (sessionId) {
      try {
        await SessionRepo.deleteSession(sessionId);
      } catch (e) {
        // Session might not exist
      }
    }
    
    return response.status(StatusCodes.OK).json({
      message: "Logged out successfully",
    });
  }
}
