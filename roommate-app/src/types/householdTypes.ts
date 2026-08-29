export type HouseholdRole = 'ADMIN' | 'MEMBER';

export interface UserSummary {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface HouseholdMember {
  householdMemberId: string;
  userId: string;
  householdId: string;
  role: HouseholdRole;
  createdAt?: string;
  user: UserSummary;
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
  memberCount: number;
}

export interface CascadeDeleteReport {
  message: string;
  data: {
    household: Array<{
      count?: number;
      householdId?: string;
      name?: string;
      inviteCode?: string;
      createdAt?: string;
    }>;
  };
}
