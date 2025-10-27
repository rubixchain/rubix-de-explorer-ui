import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { NetworkMetrics } from '@/types';

export const useTokens = () => {
  return useQuery({
    queryKey: ['tokenslist'],
    queryFn: () => api.getTokens(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
