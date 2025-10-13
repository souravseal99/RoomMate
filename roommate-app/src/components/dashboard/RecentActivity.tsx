import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import type { DashboardData } from "@/api/dashboardApi";

interface RecentActivityProps {
  expenses: DashboardData['recentExpenses'];
  chores: DashboardData['upcomingChores'];
}

export function RecentActivity({ expenses, chores }: RecentActivityProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent expenses
              </p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{expense.description}</p>
                      <span className="font-bold text-sm">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        {expense.paidBy} • {expense.householdName}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(expense.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Chores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Chores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming chores
              </p>
            ) : (
              chores.map((chore) => (
                <div key={chore.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{chore.title}</p>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(chore.dueDate)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        {chore.assignedTo} • {chore.householdName}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}