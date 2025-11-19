import { Household, Role, User } from "@generated/prisma";

export interface HouseholdMemberDto {
  userId: string;
  householdId?: string;
  role?: Role;

  user?: User;
  household?: Household;
}
