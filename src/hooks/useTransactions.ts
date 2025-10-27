import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Transaction } from '@/types';

interface UseTransactionsParams {
  page?: number;
  limit?: number;  
  // type?: string;
  // status?: string;
}

export const useTransactions = (params?: UseTransactionsParams) => {
  console.log("testing-111", params)
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.getTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => api.getTransaction(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
