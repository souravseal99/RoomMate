import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-pulse mt-4">
      {/* Hero Card Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Spaces Grid Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>

      {/* Security Section Skeleton */}
      <Skeleton className="h-44 w-full rounded-2xl" />
    </div>
  );
}
