import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { NetworkMetrics } from '@/types';

interface UseDIDsParams {
  page?: number;
  limit?: number;  
  // type?: string;
  // status?: string;
}

export const useDIDs = (params: UseDIDsParams) => {
  return useQuery({
    queryKey: ['didList', params], // unique cache per page/limit
    queryFn: () => api.getDIDs(params), // ✅ use params
    staleTime: 1 * 60 * 1000, 
    refetchOnMount: 'always',        // ensures query runs on each mount
    refetchOnWindowFocus: false,     // optional
  });
};

