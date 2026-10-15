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

export interface SuggestedMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  sharedHouseholds: string[];
}

export interface HouseholdSettings {
  unitOrApt?: string;
  billingCycleDay?: number;
  targetRoommates?: number;
  monthlyCommunalBudget?: number | null;
  wifiSsid?: string;
  wifiPassword?: string;
  trashDay?: string;
  currency?: string;
}

export interface HouseholdResponse {
  householdId: string;
  inviteCode: string;
  name: string;
  settings?: HouseholdSettings;
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
