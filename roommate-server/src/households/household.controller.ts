import { Request, Response } from "express";
import { ApiResponse } from "@common/utils/ApiResponse";
import { getUserFromRequest } from "@common/utils/utils";

class HouseholdController {
  constructor() {}

  public create(request: Request, response: Response) {
    const { userId } = getUserFromRequest(request);
    const { status, data, message } = ApiResponse.success(
      "create household: " + userId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}

export default new HouseholdController();
