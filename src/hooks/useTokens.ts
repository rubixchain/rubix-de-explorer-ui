import { useQuery } from '@tanstack/react-query';
import { api, getBaseUrlForNetwork } from '@/services/api';
import { NetworkMetrics } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface UseTokensParams {
  page?: number;
  limit?: number;
  // type?: string;
  // status?: string;
}


export const useTokens =  (params?: UseTokensParams) => {
  const { state } = useApp();



  return useQuery({
    queryKey: ['tokenslist', state.selectedChain, params ],
    queryFn: () => {
     
      return api.getTokens({ ...params, network: state.selectedChain });
    },
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
};

// Hook for fetching FT list with minted counts
export const useFTList = (params?: { page?: number; limit?: number }) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['ftlist', state.selectedChain, params],
    queryFn: () => api.getFTList({ ...params, network: state.selectedChain }),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching individual token details
export const useTokenDetails = (tokenId: string) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['tokenDetails', state.selectedChain, tokenId],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      const response = await fetch(`${baseUrl}/search?id=${tokenId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch token details');
      }

      return response.json();
    },
    enabled: !!tokenId, // Only run if tokenId exists
    staleTime: 0,
    // cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching token chain data
export const useTokenChain = (tokenId: string) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['tokenChain', state.selectedChain, tokenId],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      const url = `${baseUrl}/token-chain?token_id=${tokenId}`;
      console.log('[useTokenChain] Fetching:', url);
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[useTokenChain] Error:', response.status, text);
        throw new Error(`Failed to fetch token chain: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useTokenChain] Response:', data);
      return data.TokenChainData;
    },
    enabled: !!tokenId, // Only run if tokenId exists
    retry: false,
    staleTime: 0,
    // cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};
