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

export type KitchenTableMode = 'CHEF' | 'QNA' | 'NOTICE';

export interface KitchenTableRsvp {
  userId: string;
  userName: string;
  attending: boolean;
  note?: string;
  updatedAt: string;
}

export interface KitchenTableMeal {
  dishName: string;
  servingTime: string;
  extraPlates: number;
  chefId: string;
  chefName: string;
  broadcastAt: string;
  status: 'ACTIVE' | 'ARCHIVED';
  rsvps: KitchenTableRsvp[];
}

export interface KitchenTableNotice {
  noticeId: string;
  title: string;
  urgency: 'URGENT' | 'MAINTENANCE' | 'GENERAL' | 'SOCIAL';
  authorId: string;
  authorName: string;
  broadcastAt: string;
  acknowledgments: Array<{
    userId: string;
    userName: string;
    acknowledgedAt: string;
  }>;
}

export interface KitchenTableQnaReply {
  replyId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface KitchenTableQna {
  qnaId: string;
  question: string;
  category: string;
  authorId: string;
  authorName: string;
  broadcastAt: string;
  replies: KitchenTableQnaReply[];
}

export interface KitchenTableData {
  activeMode: KitchenTableMode;
  meal?: KitchenTableMeal;
  notice?: KitchenTableNotice;
  qna?: KitchenTableQna;
  // Backward compatibility fields
  dishName?: string;
  servingTime?: string;
  extraPlates?: number;
  chefId?: string;
  chefName?: string;
  broadcastAt?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  rsvps?: KitchenTableRsvp[];
  updatedAt?: string;
}

export interface BroadcastKitchenTableDto {
  mode?: KitchenTableMode;
  payload?: any;
  dishName?: string;
  servingTime?: string;
  extraPlates?: number;
}

export interface ToggleKitchenTableRsvpDto {
  attending: boolean;
  note?: string;
}

export interface ReplyKitchenTableQnaDto {
  text: string;
}
