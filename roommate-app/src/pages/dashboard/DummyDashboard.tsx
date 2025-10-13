import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { getDashboardData } from "@/api/dashboardApi";
import type { DashboardData } from "@/api/dashboardApi";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HouseholdCard } from "@/components/dashboard/HouseholdCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, DollarSign, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!isAuthenticated) {
        console.log("Debug: Not authenticated, skipping dashboard load");
        return;
      }

      console.log("Debug: Loading dashboard data...");
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboardData();
        console.log("Debug: Dashboard data received:", data);
        console.log("Debug: Data type:", typeof data);
        console.log("Debug: Data keys:", data ? Object.keys(data) : "no data");
        console.log("Debug: Households length:", data?.households?.length);
        setDashboardData(data);
      } catch (err: any) {
        console.error("Debug: Dashboard error:", err);
        console.error("Debug: Error response:", err.response?.data);
        console.error("Debug: Error status:", err.response?.status);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          <p className="mt-1 text-xs text-gray-500">Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="mt-1 text-xs text-gray-500">Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No dashboard data available</p>
          <p className="mt-1 text-xs text-gray-500">Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p className="mt-1 text-xs text-gray-500">Loading: {loading ? 'Yes' : 'No'}</p>
          <p className="mt-1 text-xs text-gray-500">Error: {error || 'None'}</p>
        </div>
      </div>
    );
  }

  const { stats, households, recentExpenses, upcomingChores } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {dashboardData.user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening in your households
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Households"
          value={stats.totalHouseholds}
          description="Active households"
          icon={<Home className="w-4 h-4" />}
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          description="All time expenses"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatsCard
          title="Completed Chores"
          value={stats.completedChores}
          description={`${stats.pendingChores} pending`}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <StatsCard
          title="Pending Chores"
          value={stats.pendingChores}
          description="Need attention"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Households Grid */}
      {households.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Your Households
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {households.map((household) => (
              <HouseholdCard
                key={household.id}
                household={household}
                onViewDetails={(id) => {
                  // TODO: Navigate to household details
                  console.log("View household:", id);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Recent Activity
        </h2>
        <RecentActivity expenses={recentExpenses} chores={upcomingChores} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium">Create Household</h3>
              <p className="text-sm text-muted-foreground">Start a new shared living group</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium">Add Expense</h3>
              <p className="text-sm text-muted-foreground">Log a new shared expense</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium">Create Chore</h3>
              <p className="text-sm text-muted-foreground">Assign a new household task</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
