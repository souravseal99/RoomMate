import {
  Chore,
  Expense,
  HouseholdMember,
  InventoryItem,
} from "@generated/prisma";

export interface HouseholdDto {
  name: string;
  inviteCode?: string;
  //TODO - add the actual types of the followings
  members?: HouseholdMember[];
  expenses?: Expense[];
  chores?: Chore[];
  inventory?: InventoryItem[];
}
