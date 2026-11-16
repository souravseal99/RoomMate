import { ApiResponse } from "@common/utils/ApiResponse";
import { validateAccessToken } from "@common/utils/jwtHandler";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { authenticatedLimiter } from "@common/middlewares/rateLimiter";

export default async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;
  const isBearerToken = authHeader?.startsWith("Bearer ");

  if (!authHeader || !isBearerToken) {
    const { status, message } = ApiResponse.error(
      "Token not found",
      StatusCodes.UNAUTHORIZED,
    );

    return response.status(status).json({
      message: message,
    });
  }

  const token: string = authHeader?.split(" ")[1] || "";

  try {
    const decoded = validateAccessToken(token);

    request.user = decoded; // NOTE - Binding the user propertry to the global express scope
    if (typeof response.setHeader === "function") {
      return authenticatedLimiter(request, response, next);
    }
    return next();
  } catch (error) {
    const { status, message } = ApiResponse.error(
      "Invalid or Expired token",
      StatusCodes.UNAUTHORIZED,
    );

    console.error("error: Roommate App: Ensure auth failed : ", message, error);

    return response.status(status).json({
      message: message,
    });
  }
}
