import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full bg-surface-container" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 bg-surface-container" />
            <Skeleton className="h-3 w-24 bg-surface-container" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-full bg-surface-container" />
          <Skeleton className="w-9 h-9 rounded-full bg-surface-container" />
        </div>
      </div>

      {/* Net Balance Card Skeleton */}
      <div className="rounded-2xl bg-card border border-border/40 p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 bg-surface-container" />
            <Skeleton className="h-10 w-48 bg-surface-container" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl bg-surface-container" />
        </div>
        <div className="space-y-2 pt-3 border-t border-dashed border-border/30">
          <Skeleton className="h-4 w-full bg-surface-container" />
          <Skeleton className="h-4 w-3/4 bg-surface-container" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl bg-surface-container" />
      </div>

      {/* Quick Action Grid Skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-16 h-16 rounded-2xl bg-surface-container" />
            <Skeleton className="h-3 w-12 bg-surface-container" />
          </div>
        ))}
      </div>

      {/* Chores Section Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32 bg-surface-container" />
          <Skeleton className="h-4 w-16 bg-surface-container" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          <Skeleton className="w-44 h-32 rounded-2xl bg-surface-container shrink-0" />
          <Skeleton className="w-44 h-32 rounded-2xl bg-surface-container shrink-0" />
        </div>
      </div>

      {/* Activity Feed Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28 bg-surface-container" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl bg-surface-container shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-3/4 bg-surface-container" />
                <Skeleton className="h-3 w-20 bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
