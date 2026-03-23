import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function HouseholdCardSkeleton() {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-blue-200 shadow-xl w-full">
      <Skeleton className="h-2 w-full" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-3 shadow-inner space-y-1">
          <Skeleton className="h-3 w-1/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-3 shadow-inner space-y-1">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export default HouseholdCardSkeleton;
