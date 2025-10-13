import { DashboardRepo } from "@src/dashboard/dashboard.repo";

export interface DashboardData {
  user: {
    name: string;
    email: string;
  };
  households: {
    id: string;
    name: string;
    memberCount: number;
    totalExpenses: number;
    myBalance: number;
  }[];
  recentExpenses: {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    householdName: string;
    createdAt: string;
  }[];
  upcomingChores: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    householdName: string;
    assignedTo: string;
  }[];
  stats: {
    totalHouseholds: number;
    totalExpenses: number;
    totalOwed: number;
    totalOwing: number;
    completedChores: number;
    pendingChores: number;
  };
}

export class DashboardService {
  static async getDashboardData(userId: string): Promise<DashboardData> {
    const user = await DashboardRepo.getUserData(userId);
    const households = await DashboardRepo.getUserHouseholds(userId);
    const recentExpenses = await DashboardRepo.getRecentExpenses(userId, 5);
    const upcomingChores = await DashboardRepo.getUpcomingChores(userId, 5);
    const stats = await DashboardRepo.getUserStats(userId);

    return {
      user,
      households,
      recentExpenses,
      upcomingChores,
      stats
    };
  }

  static async getHouseholdStats(userId: string, householdId: string) {
    return await DashboardRepo.getHouseholdStats(userId, householdId);
  }
}