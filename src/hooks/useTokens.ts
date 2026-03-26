import { useQuery } from '@tanstack/react-query';
import { api, getBaseUrlForNetwork } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import { useDebounce } from '@/hooks/useDebounce';

interface UseTokensParams {
  page?: number;
  limit?: number;
}

export const useTokens = (params?: UseTokensParams) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['tokenslist', state.selectedChain, params],
    queryFn: () => api.getTokens({ ...params, network: state.selectedChain }),
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

// FT group list with token counts per FT name
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

// Individual FT tokens filtered by FT name
export const useFTListByFTName = (params?: { ftName?: string; page?: number; limit?: number }) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['ftListByName', state.selectedChain, params?.ftName, params?.page, params?.limit],
    queryFn: () => api.getFTListByFTName({ ...params, network: state.selectedChain }),
    enabled: !!params?.ftName,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Token details via unified search endpoint (GET /api/get-info?id=)
export const useTokenDetails = (tokenId: string) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['tokenDetails', state.selectedChain, tokenId],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      const response = await fetch(`${baseUrl}/api/get-info?id=${tokenId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token details');
      }
      return response.json();
    },
    enabled: !!tokenId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Token chain history (sequential block history for a token)
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
    enabled: !!tokenId,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Full transaction history for a token (GET /api/get-transaction-info-list?tokenID=)
export const useTokenTransactionHistory = (tokenId: string, params?: { page?: number; limit?: number }) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['tokenTxnHistory', state.selectedChain, tokenId, params],
    queryFn: () => api.getTransactionHistory(tokenId, { ...params, network: state.selectedChain }),
    enabled: !!tokenId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Sequential transaction ID list for a token (GET /api/get-transaction-id-list?tokenID=)
export const useTokenTransactionIdList = (tokenId: string) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['tokenTxnIdList', state.selectedChain, tokenId],
    queryFn: () => api.getTransactionIdList(tokenId, state.selectedChain),
    enabled: !!tokenId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Top holders for a specific FT (GET /api/get-ft-top-holders?ftName=&creatorDID=&limit=&page=)
export const useFTTopHolders = (
  params: { ftName: string; creatorDID: string; page?: number; limit?: number },
  enabled: boolean
) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['ftTopHolders', state.selectedChain, params.ftName, params.creatorDID, params.page, params.limit],
    queryFn: () => api.getFTTopHolders({ ...params, network: state.selectedChain }),
    enabled: enabled && !!params.ftName && !!params.creatorDID,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// RBT token ID search suggestions (GET /api/search-rbt-suggestions?query=&limit=)
export const useRBTSuggestions = (query: string, limit: number = 10) => {
  const { state } = useApp();
  const debouncedQuery = useDebounce(query, 300);
  return useQuery({
    queryKey: ['rbtSuggestions', state.selectedChain, debouncedQuery, limit],
    queryFn: () => api.searchRBTSuggestions(debouncedQuery, limit, state.selectedChain),
    enabled: debouncedQuery.length >= 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

// Single RBT token detail (GET /api/get-rbt-info?tokenId=)
export const useRBTInfo = (tokenId: string, enabled: boolean) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['rbtInfo', state.selectedChain, tokenId],
    queryFn: () => api.getRBTInfo(tokenId, state.selectedChain),
    enabled: enabled && !!tokenId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// FT detail info (GET /api/get-ft-info?ftName=&creatorDID=)
export const useFTInfo = (ftName: string, creatorDID: string, enabled: boolean) => {
  const { state } = useApp();
  return useQuery({
    queryKey: ['ftInfo', state.selectedChain, ftName, creatorDID],
    queryFn: () => api.getFTInfo(ftName, creatorDID, state.selectedChain),
    enabled: enabled && !!ftName && !!creatorDID,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// FT name autocomplete suggestions (GET /api/search-ft-suggestions?query=&limit=)
export const useFTSuggestions = (query: string, limit: number = 10) => {
  const { state } = useApp();
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['ftSuggestions', state.selectedChain, debouncedQuery, limit],
    queryFn: () => api.getFTSuggestions(debouncedQuery, limit, state.selectedChain),
    enabled: debouncedQuery.length >= 1,
    staleTime: 30000, // suggestions can be cached for 30s
    refetchOnWindowFocus: false,
  });
};
