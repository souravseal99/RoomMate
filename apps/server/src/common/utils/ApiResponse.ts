import { INTERNAL_SERVER_ERROR } from "@common/config";
import { StatusCodes } from "http-status-codes";

export class ApiResponse<T = any> {
  public status: number;
  public data: T | null | object;
  public message: string;

  constructor(status?: number, data?: T, message?: string) {
    this.status = status || StatusCodes.EXPECTATION_FAILED;
    this.data = data || null;
    this.message = message || "Unable to get response";
  }

  static success<T>(
    data: T,
    message = "Success",
    status: number = StatusCodes.OK
  ) {
    return new ApiResponse(status, data, message);
  }
  static error<T>(
    message = INTERNAL_SERVER_ERROR,
    status: number = StatusCodes.INTERNAL_SERVER_ERROR,
    data?: T
  ) {
    return new ApiResponse(status, data, message);
  }
}
