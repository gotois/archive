import { QueryClient } from '@tanstack/vue-query'
import { getHttpStatus } from './http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error: unknown) => {
        const status = getHttpStatus(error)

        if (status === 401 || status === 403 || status === 404) {
          return false
        }

        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
