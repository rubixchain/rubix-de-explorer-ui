import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { NetworkMetrics } from '@/types';

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => api.getMetrics(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
