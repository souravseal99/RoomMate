import { Skeleton } from '@/components/ui/skeleton';

export function CurrentSpaceHeroSkeleton() {
  return (
    <div className="w-full bg-surface-container rounded-2xl p-6 md:p-8 border border-border/60 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-9 md:h-11 w-48 md:w-64 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border/40">
        <div className="flex -space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    </div>
  );
}

export function OtherSpacesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-surface-container rounded-2xl p-4 flex items-center justify-between border border-border/60 shadow-xs"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <div className="flex -space-x-1.5">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}
