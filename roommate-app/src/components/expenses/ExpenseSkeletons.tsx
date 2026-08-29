import { Skeleton } from '@/components/ui/skeleton';

export function NetBalanceBannerSkeleton() {
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border shadow-xs">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-10 w-full md:w-32 rounded-lg" />
    </div>
  );
}

export function RoommateBalancesSkeleton() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3 border border-border shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            <Skeleton className="w-full h-1.5 rounded-full" />
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpenseLedgerSkeleton() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-border shadow-xs overflow-hidden divide-y divide-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
