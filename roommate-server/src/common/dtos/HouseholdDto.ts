import {
  Chore,
  Expense,
  HouseholdMember,
  InventoryItem,
} from "@generated/prisma";

export interface HouseholdDto {
  name: String;
  inviteCode?: String;
  //TODO - add the actual types of the followings
  members?: HouseholdMember[];
  expenses?: Expense[];
  chores?: Chore[];
  inventory?: InventoryItem[];
}
