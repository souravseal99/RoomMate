import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* 1. Hero Cockpit Skeleton */}
      <Card className="w-full rounded-2xl bg-card border-border/40 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-lg bg-surface-container" />
            <Skeleton className="h-6 w-44 bg-surface-container" />
          </div>
          <Skeleton className="h-6 w-36 rounded-lg bg-surface-container" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-surface-container/50 border border-border/40 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20 bg-surface-container" />
                <Skeleton className="h-4 w-14 rounded bg-surface-container" />
              </div>
              <Skeleton className="h-8 w-32 bg-surface-container" />
              <Skeleton className="h-10 w-full rounded-lg bg-surface-container" />
            </div>
          ))}
        </div>

        <Skeleton className="h-10 w-full rounded-xl bg-surface-container/70" />
      </Card>

      {/* 2. Quick Actions Bar Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl bg-card border-border/40 p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <Skeleton className="h-4 w-20 bg-surface-container" />
                <Skeleton className="h-3 w-16 bg-surface-container" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. 2-Column Main Bento Grid Skeleton (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
        {/* Left Operational Wing (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-2xl bg-card border-border/40 p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border/30">
              <Skeleton className="h-5 w-36 bg-surface-container" />
              <Skeleton className="h-5 w-24 rounded bg-surface-container" />
            </div>
            {/* Direct Settlements rows */}
            <Skeleton className="h-16 w-full rounded-xl bg-surface-container/60" />
            <Skeleton className="h-16 w-full rounded-xl bg-surface-container/60" />
            {/* Flatmate tabs */}
            <Skeleton className="h-14 w-full rounded-xl bg-surface-container/40" />
            {/* Bills */}
            <Skeleton className="h-20 w-full rounded-xl bg-surface-container/30" />
          </Card>

          <Card className="rounded-2xl bg-card border-border/40 p-5 space-y-3 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <Skeleton className="h-5 w-32 bg-surface-container" />
              <Skeleton className="h-4 w-20 rounded bg-surface-container" />
            </div>
            <Skeleton className="h-12 w-full bg-surface-container/50 rounded-lg" />
            <Skeleton className="h-12 w-full bg-surface-container/50 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-xl bg-surface-container" />
          </Card>
        </div>

        {/* Right Communal Wing (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl bg-card border-border/40 p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-border/30">
              <Skeleton className="h-5 w-32 bg-surface-container" />
              <Skeleton className="h-5 w-20 rounded bg-surface-container" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl bg-surface-container/60" />
            <Skeleton className="h-16 w-full rounded-xl bg-surface-container/40" />
          </Card>

          <Card className="rounded-2xl bg-card border-border/40 p-5 space-y-3 shadow-xs">
            <Skeleton className="h-5 w-36 bg-surface-container" />
            <Skeleton className="h-20 w-full rounded-xl bg-surface-container/50" />
          </Card>

          <Card className="rounded-2xl bg-card border-border/40 p-5 space-y-3 shadow-xs">
            <Skeleton className="h-5 w-28 bg-surface-container" />
            <Skeleton className="h-14 w-full rounded-lg bg-surface-container/50" />
            <Skeleton className="h-14 w-full rounded-lg bg-surface-container/50" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
