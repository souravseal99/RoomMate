export interface HouseholdMember {
  householdMemberId: string;
  userId: string;
  householdId: string;
  role: 'ADMIN' | 'MEMBER';
  user?: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  household?: {
    householdId: string;
    name: string;
    inviteCode: string;
  };
}

export interface HouseholdMemberOptions {
  key: string;
  value: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface CreateHouseholdMemberRequest {
  userId: string;
  householdId: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface HouseholdMemberResponse {
  householdMemberId: string;
  userId: string;
  householdId: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
