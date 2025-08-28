import { Role } from "@generated/prisma";

export default interface HouseholdMember {
  userId: string;
  householdId?: string;
  role: Role;
}
