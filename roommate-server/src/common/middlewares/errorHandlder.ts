import { Request, Response, NextFunction } from "express";
import { INTERNAL_SERVER_ERROR } from "@common/config";
import { ApiError } from "@common/errors/ApiError";

function errorHandler(
  error: Error | ApiError,
  _req: Request,
  resp: Response,
  _next: NextFunction
) {
  if (error instanceof ApiError) {
    return resp.status(error.statusCode).json({
      success: false,
      errorMessage: error.message,
      errors: error.errors,
    });
  }

  console.error("Error: Roommate-server: Unexpected Error:", error);

  return resp.status(500).json({
    success: false,
    errorMessage: INTERNAL_SERVER_ERROR,
  });
}

export default errorHandler;
