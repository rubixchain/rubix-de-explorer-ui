import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { NetworkMetrics } from '@/types';
import { useApp } from '@/contexts/AppContext';

export const useMetrics = () => {
  const { state } = useApp();

  

  return useQuery({
    queryKey: ['metrics', state.selectedChain],
    queryFn: () => {
      
      return api.getMetrics(state.selectedChain);
    },
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
};
