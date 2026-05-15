import { useQuery } from '@tanstack/react-query';
import { api, getBaseUrlForNetwork } from '@/services/api';
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
        `${baseUrl}/api/get-did-balance?did=${encodeURIComponent(did)}&page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to fetch DID info');
      const raw = await response.json();
      // API returns: Array<{ did, asset_type, token_name, creator_did, token_value, balance, last_update }>
      const entries: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
      const rbt  = entries.filter((e: any) => e.asset_type === 'RBT');
      const ft   = entries.filter((e: any) => e.asset_type === 'FT');
      const nft  = entries.filter((e: any) => e.asset_type === 'NFT');
      const sc   = entries.filter((e: any) => e.asset_type === 'SC');
      const free_rbt    = rbt.reduce((s: number, e: any) => s + (e.balance || 0), 0);
      const pledged_rbt = rbt.reduce((s: number, e: any) => s + (e.pledged_balance || 0), 0);
      return {
        did: {
          did,
          free_rbt,
          pledged_rbt,
          total_rbts: free_rbt + pledged_rbt,
          total_fts:  ft.reduce((s: number, e: any) => s + (e.balance || 0), 0),
          total_nfts: nft.reduce((s: number, e: any) => s + (e.balance || 0), 0),
          total_scs:  sc.reduce((s: number, e: any) => s + (e.balance || 0), 0),
        },
        entries,
        rbt, ft, nft, sc,
        hasFT:  ft.length > 0,
        hasNFT: nft.length > 0,
        hasSC:  sc.length > 0,
        count: entries.length,
      };
    },
    enabled: !!did,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching FT holders list (global, filtered by ft_name)
export const useFTHolders = (params: { ft_name?: string; page: number; limit: number }, enabled: boolean) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['ftHolders', state.selectedChain, params.ft_name, params.page, params.limit],
    queryFn: () => api.getFTHolders({ ...params, network: state.selectedChain }),
    enabled: enabled && !!params.ft_name,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// All FT holders — list of DIDs with total_ft_count and holdings breakdown
export const useFTHoldersList = (params: { page: number; limit: number }, enabled: boolean = true) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['ftHoldersList', state.selectedChain, params.page, params.limit],
    queryFn: () => api.getFTHoldersList({ ...params, network: state.selectedChain }),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching SC tokens deployed/owned by a DID
export const useSCTokensByDID = (did: string, page: number, limit: number, enabled: boolean) => {
  const { state } = useApp();

  return useQuery({
    queryKey: ['scTokensByDID', state.selectedChain, did, page, limit],
    queryFn: async () => {
      const baseUrl = getBaseUrlForNetwork(state.selectedChain);
      try {
        const response = await fetch(
          `${baseUrl}/api/get-sc-list?did=${encodeURIComponent(did)}&page=${page}&limit=${limit}`
        );
        if (!response.ok) return { tokens: [], count: 0, totalPages: 1 };
        const data = await response.json();
        if (Array.isArray(data)) return { tokens: data, count: data.length, totalPages: 1 };
        if (Array.isArray(data?.data)) return { tokens: data.data, count: data.total ?? data.count ?? data.data.length, totalPages: data.total_pages ?? 1 };
        return { tokens: [], count: 0, totalPages: 1 };
      } catch {
        return { tokens: [], count: 0 };
      }
    },
    enabled: enabled && !!did,
    staleTime: 0,
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
        `${baseUrl}/api/get-ft-holdings?did=${encodeURIComponent(did)}&page=${page}&limit=${limit}`
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

