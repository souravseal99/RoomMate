import { Skeleton } from '@/components/ui/skeleton';

export function InventoryPantrySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Assistant Skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl" />

      {/* Quick Add Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex gap-2.5 overflow-hidden">
          <Skeleton className="h-10 w-28 rounded-full shrink-0" />
          <Skeleton className="h-10 w-28 rounded-full shrink-0" />
          <Skeleton className="h-10 w-28 rounded-full shrink-0" />
          <Skeleton className="h-10 w-28 rounded-full shrink-0" />
        </div>
      </div>

      {/* Items list skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function InventoryShoppingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
