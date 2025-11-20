import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Transaction } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface UseTransactionsParams {
  page?: number;
  limit?: number;
  // type?: string;
  // status?: string;
}

export const useTransactions = (params?: UseTransactionsParams) => {
  const { state } = useApp();

  

  return useQuery({
    queryKey: ['transactions', state.selectedChain, params],
    queryFn: () => {
     
      return api.getTransactions({ ...params, network: state.selectedChain });
    },
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
};

export const useTransaction = (id: string) => {
  const { state } = useApp();

 

  return useQuery({
    queryKey: ['transaction', state.selectedChain, id],
    queryFn: () => {
     
      return api.getTransaction(id, state.selectedChain);
    },
    enabled: !!id,
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
};

export const useSCTxns = (params?: UseTransactionsParams) => {
  const { state } = useApp();

 

  return useQuery({
    queryKey: ['sctxns', state.selectedChain, params],
    queryFn: () => {
     
      return api.getSCTransactions({ ...params, network: state.selectedChain });
    },
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
}

export const useBurntTxn = (params?: UseTransactionsParams) => {
  const { state } = useApp();

  

  return useQuery({
    queryKey: ['burnttxns', state.selectedChain, params],
    queryFn: async () => {
      
      const result = await api.getBurntTransactions({ ...params, network: state.selectedChain });
      return result;
    },
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching individual burnt transaction by hash
export const useBurntTransaction = (hash: string) => {
  const { state } = useApp();

  

  return useQuery({
    queryKey: ['burntTransaction', state.selectedChain, hash],
    queryFn: async () => {
      
      const baseUrl = state.selectedChain === 'mainnet'
        ? import.meta.env.VITE_API_BASE_URL_MAINNET
        : import.meta.env.VITE_API_BASE_URL_TESTNET;

      const response = await fetch(`${baseUrl}/burnttxn-info?hash=${hash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch burnt transaction data');
      }
      return response.json();
    },
    enabled: !!hash,
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
};

// Hook for fetching individual smart contract transaction by hash
export const useSCTransaction = (hash: string) => {
  const { state } = useApp();



  return useQuery({
    queryKey: ['scTransaction', state.selectedChain, hash],
    queryFn: async () => {
     
      const baseUrl = state.selectedChain === 'mainnet'
        ? import.meta.env.VITE_API_BASE_URL_MAINNET
        : import.meta.env.VITE_API_BASE_URL_TESTNET;

      const response = await fetch(`${baseUrl}/sctxn-info?hash=${hash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch SC transaction data');
      }
      return response.json();
    },
    enabled: !!hash,
    staleTime: 0,
     // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });
};





