import { Card, CardContent } from '@/components/ui/card';

export default function HouseholdCardSkeleton() {
  return (
    <Card className="bg-card border-[1.5px] border-border rounded-lg p-card-padding shadow-sm animate-pulse flex flex-col gap-4 min-h-[190px]">
      <CardContent className="p-0 flex flex-col justify-between h-full gap-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-surface-container rounded w-3/4" />
            <div className="flex items-center gap-2">
              <div className="h-4 bg-surface-container rounded w-16" />
              <div className="h-4 bg-surface-container rounded w-12" />
            </div>
          </div>
          <div className="w-8 h-8 bg-surface-container rounded-full" />
        </div>
        <div className="pt-4 border-t-[1.5px] border-border/20 flex items-center justify-between">
          <div className="h-4 bg-surface-container rounded w-16" />
          <div className="h-8 bg-surface-container rounded w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
