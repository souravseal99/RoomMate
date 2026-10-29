import "express";
import { HouseholdMember } from "@generated/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
      };
      householdMember?: HouseholdMember;
    }
  }
}
