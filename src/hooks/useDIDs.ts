import { useQuery } from '@tanstack/react-query';
import { api, getCurrentBaseUrl, getBaseUrlForNetwork } from '@/services/api';
import { NetworkMetrics } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface UseDIDsParams {
  page?: number;
  limit?: number;
  // type?: string;
  // status?: string;
}

export const useDIDs = (params: UseDIDsParams) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['didList', state.selectedChain, params], // Include network in cache key
    queryFn: () => {
      return api.getDIDs({ ...params, network: state.selectedChain });
    },
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching single DID info with RBT holdings
export const useDIDInfo = (did: string, page: number, limit: number) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['didInfo', state.selectedChain, did, page, limit],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      const response = await fetch(
        `${baseUrl}/getdidinfo?did=${did}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch DID info');
      }
      return response.json();
    },
    enabled: !!did, // Only run if did exists
    staleTime: 0,
    // cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching FT holdings
export const useFTHoldings = (did: string, page: number, limit: number, enabled: boolean) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['ftHoldings', state.selectedChain, did, page, limit],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      const response = await fetch(
        `${baseUrl}/ftholdings?did=${did}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch FT holdings');
      }
      const data = await response.json();
      return data.ft_info;
    },
    enabled: enabled && !!did, // Only run if enabled (tab is active) and did exists
    staleTime: 0,
    // cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

