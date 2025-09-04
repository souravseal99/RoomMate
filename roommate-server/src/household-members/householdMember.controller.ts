import { Request, Response } from "express";
import { HouseholdMemberService } from "@src/household-members/householdMember.service";
import { getUserFromRequestBody } from "@src/common/utils/utils";

export class HouseholdMemberController {
  static async create(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);

    const { status, message, data } = await HouseholdMemberService.create(
      userId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
