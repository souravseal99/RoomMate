import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRouter from '@/router';
import { AppToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { queryClient } from '@/lib/queryClient';
import { useHouseholdEventSync } from '@/hooks/useHouseholdEventSync';
import '@/App.css';

function AppContent() {
  useHouseholdEventSync();

  useEffect(() => {
    document.title = 'RoomMate - Manage Your Shared Living Space';
  }, []);

  return (
    <>
      <AppRouter />
      <AppToaster />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
