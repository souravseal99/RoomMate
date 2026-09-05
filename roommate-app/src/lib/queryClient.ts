import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute fresh cache
      gcTime: 1000 * 60 * 10, // 10 minutes cache retention
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
