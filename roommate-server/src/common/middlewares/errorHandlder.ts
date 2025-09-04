import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
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

  console.error("Error: Roommate-server: Unexpected Error:", error.message);

  return resp.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    errorMessage: error.message || INTERNAL_SERVER_ERROR,
  });
}

export default errorHandler;
