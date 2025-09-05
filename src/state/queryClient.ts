import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  residents: {
    all: ['residents'] as const,
    list: () => [...queryKeys.residents.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.residents.all, 'detail', id] as const,
  },
  feed: {
    all: ['feed'] as const,
    byResident: (residentId: string) => [...queryKeys.feed.all, 'byResident', residentId] as const,
    item: (id: string) => [...queryKeys.feed.all, 'item', id] as const,
  },
  uploads: {
    all: ['uploads'] as const,
    presign: () => [...queryKeys.uploads.all, 'presign'] as const,
  },
} as const;
