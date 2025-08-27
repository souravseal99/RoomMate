import { ApiResponse } from "@common/utils/ApiResponse";
import { validateAccessToken } from "@common/utils/jwtHandler";
import { Request, Response, NextFunction, response } from "express";
import { StatusCodes } from "http-status-codes";

export default async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;
  const isBearerToken = authHeader?.startsWith("Bearer ");

  if (!authHeader || !isBearerToken) {
    const { status, message } = ApiResponse.error("Token not found");

    return response.status(status).json({
      message: message,
    });
  }

  const token: string = authHeader?.split(" ")[1] || "";

  try {
    const decoded = await validateAccessToken(token);

    console.log(decoded);

    request.user = decoded; // NOTE - Binding the user propertry to the global express scope
    next();
  } catch (error) {
    const { status, message, data } = ApiResponse.error(
      "Invalid or Expired token",
      StatusCodes.UNAUTHORIZED,
      error
    );

    console.error("error: Roommate App: Ensure auth failed : ", message, data);

    return response.status(status).json({
      message: message,
      error: data,
    });
  }
}
