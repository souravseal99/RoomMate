import api from "@/api/axios";

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

export interface HouseholdStats {
  householdName: string;
  memberCount: number;
  totalExpenses: number;
  completedChores: number;
  pendingChores: number;
  members: {
    id: string;
    name: string;
    role: string;
  }[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  console.log("📡 Making API call to /dashboard");
  
  try {
    const response = await api.get("/dashboard");
    console.log("📡 Dashboard API full response:", response);
    console.log("📡 Dashboard API response.data:", response.data);
    console.log("📡 Dashboard API response.data.data:", response.data.data);
    console.log("📡 Dashboard API response status:", response.status);
    
    if (!response.data) {
      console.error("📡 No data in response:", response.data);
      throw new Error("No data received from dashboard API");
    }
    
    return response.data;
  } catch (error: any) {
    console.error("📡 Dashboard API error:", error);
    console.error("📡 Dashboard API error response:", error.response?.data);
    console.error("📡 Dashboard API error status:", error.response?.status);
    throw error;
  }
};

export const getHouseholdStats = async (householdId: string): Promise<HouseholdStats> => {
  const response = await api.get(`/dashboard/stats/${householdId}`);
  return response.data.data;
};