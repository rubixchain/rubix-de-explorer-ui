import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { SearchQuery, SearchFilters } from '@/types';

export const useSearch = () => {
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
    queryKey: ['search', searchQuery],
    queryFn: () => api.search(query, type === 'all' ? undefined : type),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
