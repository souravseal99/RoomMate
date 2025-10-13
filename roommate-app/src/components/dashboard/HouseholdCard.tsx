import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";
import type { DashboardData } from "@/api/dashboardApi";

interface HouseholdCardProps {
  household: DashboardData['households'][0];
  onViewDetails?: (householdId: string) => void;
}

export function HouseholdCard({ household, onViewDetails }: HouseholdCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{household.name}</CardTitle>
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            {household.memberCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Total Expenses
            </span>
            <span className="font-medium">
              {formatCurrency(household.totalExpenses)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">My Balance</span>
            <span className={`font-medium ${
              household.myBalance > 0 ? 'text-green-600' : 
              household.myBalance < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {formatCurrency(household.myBalance)}
            </span>
          </div>

          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3"
              onClick={() => onViewDetails(household.id)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}