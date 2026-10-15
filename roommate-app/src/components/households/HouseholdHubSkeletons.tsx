import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CurrentSpaceHeroSkeleton() {
  return (
    <Card className="w-full bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-4 select-none">
      <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <Skeleton className="h-8 sm:h-9 w-64 sm:w-80 rounded-lg mt-1" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function OtherSpacesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card
          key={i}
          className="bg-surface-container rounded-2xl p-4 flex items-center justify-between border-border/60 shadow-xs"
        >
          <CardContent className="p-0 flex items-center justify-between w-full">
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex -space-x-1.5">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-5 h-5 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="w-11 h-11 rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

