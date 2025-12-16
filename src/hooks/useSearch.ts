import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SearchQuery, SearchFilters } from '@/types';
import { useApp } from '@/contexts/AppContext';

export const useSearch = () => {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'did' | 'token' | 'transaction' | 'block'>('all');
  const [filters, setFilters] = useState<SearchFilters>({});

  const searchQuery = useMemo(() => ({
    query,
    type: type === 'all' ? undefined : type,
    filters,
  }), [query, type, filters]);

 

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', state.selectedChain, searchQuery],
    queryFn: () => {
     
      return api.search(query, type === 'all' ? undefined : type);
    },
    enabled: query.length >= 2,
    staleTime: 0, // Always consider data stale
    // cacheTime: 0, // Don't cache data
    refetchOnMount: 'always', // Always refetch on mount
  });

  const search = useCallback((searchQuery: string, searchType?: string) => {
    setQuery(searchQuery);
    if (searchType) {
      setType(searchType as any);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setType('all');
    setFilters({});
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    query,
    type,
    filters,
    searchResults,
    isLoading,
    error,
    search,
    clearSearch,
    updateFilters,
    setType,
    refetch,
  };
};
