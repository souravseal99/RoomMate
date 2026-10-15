import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HouseholdCardSkeleton() {
  return (
    <Card className="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col gap-4 min-h-[190px]">
      <CardContent className="p-0 flex flex-col justify-between h-full gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
        <div className="pt-4 border-t border-border/40 flex items-center justify-between">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

