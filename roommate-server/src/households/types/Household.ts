export interface Household {
  householdId: string;
  name: String;
  inviteCode?: String;
  //TODO - add the actual types of the followings
  members?: string[];
  expenses?: string[];
  chores?: string[];
  inventory?: string[];
}
