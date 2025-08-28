import prisma from "@src/common/utils/prisma";

export class HouseholdMemberRepo {
  static async create(householdMemberBody: any) {
    return await prisma.householdMember.create({
      data: householdMemberBody,
    });
  }
}
