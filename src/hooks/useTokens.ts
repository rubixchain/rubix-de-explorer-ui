import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { NetworkMetrics } from '@/types';

interface UseTokensParams {
  page?: number;
  limit?: number;  
  // type?: string;
  // status?: string;
}


export const useTokens =  (params?: UseTokensParams) => {
  return useQuery({
    queryKey: ['tokenslist', params ],
    queryFn: () => api.getTokens(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every 5 minutes
  });
};
