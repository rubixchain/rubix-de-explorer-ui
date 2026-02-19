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

// Hook for fetching individual token details
export const useTokenDetails = (tokenId: string) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['tokenDetails', state.selectedChain, tokenId],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      const url = `${baseUrl}/search?id=${tokenId}`;
      console.log('[useTokenDetails] Fetching:', url);
      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[useTokenDetails] Error:', response.status, text);
        throw new Error(`Failed to fetch token details: ${response.status} ${text}`);
      }

      const data = await response.json();
      console.log('[useTokenDetails] Response:', data);
      return data;
    },
    enabled: !!tokenId, // Only run if tokenId exists
    retry: false, // Don't retry on failure
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
      const response = await fetch(`${baseUrl}/token-chain?token_id=${tokenId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch token chain');
      }

      const data = await response.json();
      return data.TokenChainData;
    },
    enabled: !!tokenId, // Only run if tokenId exists
    retry: false, // Don't retry on failure - show error immediately so token details are still visible
    staleTime: 0,
    // cacheTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};
