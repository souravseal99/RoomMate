export interface HouseholdMember {
  householdMemberId: string;
  userId: string;
  householdId: string;
  role: string;
  user: {
    userId: string;
    name: string;
    email: string;
  };
}

export interface HouseholdResponse {
  householdId: string;
  inviteCode: string;
  name: string;
  createdAt: string;
  members?: HouseholdMember[];
}

export interface HouseholdOptions {
  key: string;
  value: string;
}
