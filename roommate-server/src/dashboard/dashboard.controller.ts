import { Request, Response } from "express";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { getUserFromRequestBody } from "@src/common/utils/utils";

export class DashboardController {
  static async getDashboardData(request: Request, response: Response) {
    try {
      const user = getUserFromRequestBody(request);
      
      // Rich mock data to showcase complete dashboard UI
      const mockDashboardData = {
        user: {
          name: "Alex Johnson",
          email: "alex.johnson@example.com"
        },
        households: [
          {
            id: "1",
            name: "Downtown Apartment",
            memberCount: 4,
            totalExpenses: 2850.75,
            myBalance: -247.80
          },
          {
            id: "2", 
            name: "Beach House",
            memberCount: 6,
            totalExpenses: 4200.50,
            myBalance: 125.25
          },
          {
            id: "3",
            name: "City Loft",
            memberCount: 3,
            totalExpenses: 1890.00,
            myBalance: -89.50
          }
        ],
        recentExpenses: [
          {
            id: "1",
            description: "Weekly Groceries - Whole Foods",
            amount: 156.75,
            paidBy: "Alex Johnson",
            householdName: "Downtown Apartment",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "2",
            description: "Electricity Bill - October",
            amount: 89.50,
            paidBy: "Sarah Chen",
            householdName: "Downtown Apartment", 
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: "3",
            description: "Internet & Cable",
            amount: 125.00,
            paidBy: "Mike Rodriguez",
            householdName: "Beach House",
            createdAt: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: "4",
            description: "Cleaning Supplies",
            amount: 47.80,
            paidBy: "Emma Wilson",
            householdName: "City Loft",
            createdAt: new Date(Date.now() - 345600000).toISOString()
          },
          {
            id: "5",
            description: "Gas Bill - September",
            amount: 67.25,
            paidBy: "Alex Johnson",
            householdName: "Downtown Apartment",
            createdAt: new Date(Date.now() - 432000000).toISOString()
          }
        ],
        upcomingChores: [
          {
            id: "1",
            title: "Take out trash & recycling",
            description: "Weekly garbage collection - Tuesday morning",
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            householdName: "Downtown Apartment",
            assignedTo: "Alex Johnson"
          },
          {
            id: "2", 
            title: "Deep clean bathroom",
            description: "Monthly deep cleaning of shared bathroom",
            dueDate: new Date(Date.now() + 172800000).toISOString(),
            householdName: "Downtown Apartment",
            assignedTo: "Sarah Chen"
          },
          {
            id: "3",
            title: "Vacuum living areas",
            description: "Weekly vacuuming of common spaces",
            dueDate: new Date(Date.now() + 259200000).toISOString(),
            householdName: "Beach House",
            assignedTo: "Mike Rodriguez"
          },
          {
            id: "4",
            title: "Restock kitchen supplies",
            description: "Buy paper towels, dish soap, sponges",
            dueDate: new Date(Date.now() + 345600000).toISOString(),
            householdName: "City Loft", 
            assignedTo: "Emma Wilson"
          },
          {
            id: "5",
            title: "Water plants",
            description: "Water all indoor plants and herbs",
            dueDate: new Date(Date.now() + 432000000).toISOString(),
            householdName: "Downtown Apartment",
            assignedTo: "James Park"
          }
        ],
        stats: {
          totalHouseholds: 3,
          totalExpenses: 8941.25,
          totalOwed: 342.15,
          totalOwing: 554.20,
          completedChores: 27,
          pendingChores: 8
        }
      };
      
      return response.status(200).json({
        message: "Dashboard data retrieved successfully",
        data: mockDashboardData,
      });
    } catch (error: any) {
      console.error("Dashboard error:", error);
      return response.status(500).json({
        message: "Failed to retrieve dashboard data",
        error: error.message,
      });
    }
  }

  static async getDashboardStats(request: Request, response: Response) {
    try {
      const user = getUserFromRequestBody(request);
      const { householdId } = request.params;
      
      if (!householdId) {
        return response.status(400).json({
          message: "Household ID is required",
        });
      }

      // Rich mock household stats based on householdId
      const householdNames: Record<string, string> = {
        "1": "Downtown Apartment",
        "2": "Beach House", 
        "3": "City Loft"
      };
      
      const mockStats = {
        householdName: householdNames[householdId] || "Unknown Household",
        memberCount: householdId === "1" ? 4 : householdId === "2" ? 6 : 3,
        totalExpenses: householdId === "1" ? 2850.75 : householdId === "2" ? 4200.50 : 1890.00,
        myContribution: householdId === "1" ? 712.69 : householdId === "2" ? 1050.13 : 472.50,
        myBalance: householdId === "1" ? -247.80 : householdId === "2" ? 125.25 : -89.50,
        completedChores: householdId === "1" ? 12 : householdId === "2" ? 18 : 8,
        pendingChores: householdId === "1" ? 4 : householdId === "2" ? 7 : 3,
        recentActivity: [
          {
            id: "1",
            type: "expense",
            description: householdId === "1" ? "Electricity Bill - October" : householdId === "2" ? "Pool Maintenance" : "Internet Bill",
            amount: householdId === "1" ? 89.50 : householdId === "2" ? 150.00 : 75.00,
            date: new Date(Date.now() - 86400000).toISOString(),
            paidBy: "Sarah Chen"
          },
          {
            id: "2",
            type: "expense", 
            description: householdId === "1" ? "Weekly Groceries" : householdId === "2" ? "Beach Equipment" : "Office Supplies",
            amount: householdId === "1" ? 156.75 : householdId === "2" ? 89.25 : 45.80,
            date: new Date(Date.now() - 172800000).toISOString(),
            paidBy: "Alex Johnson"
          },
          {
            id: "3",
            type: "chore_completed",
            description: householdId === "1" ? "Cleaned shared bathroom" : householdId === "2" ? "Maintained garden" : "Organized storage",
            completedBy: "Mike Rodriguez",
            date: new Date(Date.now() - 259200000).toISOString()
          }
        ],
        members: [
          {
            id: "1",
            name: "Alex Johnson", 
            role: "ADMIN",
            balance: householdId === "1" ? -247.80 : householdId === "2" ? 125.25 : -89.50,
            avatar: "AJ"
          },
          {
            id: "2",
            name: "Sarah Chen",
            role: "MEMBER",
            balance: householdId === "1" ? 89.50 : householdId === "2" ? -67.80 : 45.25,
            avatar: "SC"
          },
          {
            id: "3", 
            name: "Mike Rodriguez",
            role: "MEMBER",
            balance: householdId === "1" ? 158.30 : householdId === "2" ? -57.45 : 44.25,
            avatar: "MR"
          },
          ...(householdId === "1" ? [{
            id: "4",
            name: "James Park", 
            role: "MEMBER",
            balance: 0.00,
            avatar: "JP"
          }] : []),
          ...(householdId === "2" ? [
            {
              id: "4", 
              name: "Emma Wilson",
              role: "MEMBER",
              balance: 23.75,
              avatar: "EW"
            },
            {
              id: "5",
              name: "David Kim", 
              role: "MEMBER",
              balance: -78.90,
              avatar: "DK"
            },
            {
              id: "6",
              name: "Lisa Zhang",
              role: "MEMBER",
              balance: 155.15,
              avatar: "LZ"
            }
          ] : [])
        ]
      };
      
      return response.status(200).json({
        message: "Household stats retrieved successfully",
        data: mockStats,
      });
    } catch (error: any) {
      console.error("Dashboard stats error:", error);
      return response.status(500).json({
        message: "Failed to retrieve household stats",
        error: error.message,
      });
    }
  }
}