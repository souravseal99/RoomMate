import { useEffect, useMemo, useState } from "react";
import { Home, DollarSign, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import dashboardApi from "@/api/dashboardApi";

interface Activity {
  id: string;
  type: 'EXPENSE' | 'CHORE';
  title: string;
  household: string;
}

interface RecentExpense extends Activity {
  amount: number;
  paidBy: string;
  date: string;
}

interface RecentChore extends Activity {
  status: string;
  assignee: string;
  dueDate: string;
}

interface StatsProps {
  householdCount: number;
  pendingChoresCount: number;
  expenses: number;
  recentExpenses: RecentExpense[];
  recentChores: RecentChore[];
}

function DummyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsProps>();
  const dashboardAPI = useMemo(dashboardApi, []);

  useEffect(() => {
    async function loadDashboard() {
      const data = await dashboardAPI.fetchDashboardData();
      setStats(data);
    }
    loadDashboard();
  }, []);

  const features = [
    {
      title: "Households",
      description: "Create and manage your shared living spaces",
      icon: Home,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      stats: { label: "Active Households", value: stats?.householdCount },
      action: () => navigate("/households"),
    },
    {
      title: "Chores",
      description: "Assign and track household tasks",
      icon: CheckSquare,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      stats: { label: "Pending Tasks", value: stats?.pendingChoresCount },
      action: () => navigate("/chores"),
    },
    {
      title: "Expenses",
      description: "Split bills and track shared expenses",
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      stats: { label: "Expenses", value: stats?.expenses },
      action: () => navigate("/expenses"),
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">

      <div className="flex-shrink-0 p-6 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening in your households</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/expenses")} className="cursor-pointer">Add Expense</Button>
            <Button size="sm" onClick={() => navigate("/chores")} className="cursor-pointer bg-blue-600">New Chore</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  onClick={feature.action}
                >
                  <div className={`h-1.5 bg-gradient-to-r ${feature.gradient}`}></div>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{feature.stats.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{feature.stats.value ?? 0}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Expenses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Recent Expenses
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/expenses")} className="text-blue-600 hover:text-blue-700">View All</Button>
              </div>
              <Card className="bg-white border-blue-50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {stats.recentExpenses.map((expense) => (
                        <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{expense.title}</p>
                              <p className="text-xs text-gray-500">{expense.paidBy} • {expense.household}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 italic">No recent expenses</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Chores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  Upcoming Chores
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/chores")} className="text-blue-600 hover:text-blue-700">View All</Button>
              </div>
              <Card className="bg-white border-blue-50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {stats?.recentChores && stats.recentChores.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {stats.recentChores.map((chore) => (
                        <div key={chore.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${chore.status === 'COMPLETED' ? 'bg-green-50' : 'bg-orange-50'} flex items-center justify-center`}>
                              <CheckSquare className={`w-5 h-5 ${chore.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{chore.title}</p>
                              <p className="text-xs text-gray-500">{chore.assignee} • {chore.household}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${chore.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {chore.status}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1">Due {new Date(chore.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 italic">No upcoming chores</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DummyDashboard;
