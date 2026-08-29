import { Navigate, Outlet } from 'react-router-dom';
import useHousehold from '@/hooks/useHousehold';
import { Skeleton } from '@/components/ui/skeleton';

export default function HouseholdGuard() {
  const { hasActiveHousehold, isLoading, isFetching } = useHousehold();

  // If query is actively loading or in-flight without a resolved active household
  if (isLoading || (isFetching && !hasActiveHousehold)) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!hasActiveHousehold) {
    return <Navigate to="/households" replace />;
  }

  return <Outlet />;
}
