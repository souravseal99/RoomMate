export type ActivityType = 'EXPENSE' | 'CHORE_COMPLETED' | 'SETTLEMENT' | 'NUDGE';

export interface ReactionSummary {
  emoji: string;
  count: number;
}

export interface ActivityUser {
  userId: string;
  name: string;
  email: string;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  user: ActivityUser;
  isPrivate: boolean;
  totalReactionCount: number;
  dominantEmoji: string;
  userReactedEmoji: string | null;
  userReacted: boolean;
  reactions: ReactionSummary[];
}

export interface ToggleReactionResponse {
  activityId: string;
  totalReactionCount: number;
  dominantEmoji: string;
  userReactedEmoji: string | null;
  userReacted: boolean;
  reactions: ReactionSummary[];
}
