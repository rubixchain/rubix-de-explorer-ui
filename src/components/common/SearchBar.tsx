import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Hash, User, Coins, X } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useApp } from '@/contexts/AppContext';
import { STORAGE_KEYS } from '@/constants';

interface SearchSuggestion {
  id: string;
  type: 'did' | 'token' | 'transaction' | 'block';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, type?: string) => void;
  showSuggestions?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search by DID, Token ID, Transaction ID, or Block Height...",
  className = '',
  onSearch,
  showSuggestions = true,
  size = 'lg',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, searchResults, isLoading } = useSearch();
  const { setSearchQuery } = useApp();

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const saveToHistory = (searchTerm: string) => {
    if (searchTerm.trim() && !searchHistory.includes(searchTerm)) {
      const newHistory = [searchTerm, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
    }
  };

  const generateSuggestions = (query: string): SearchSuggestion[] => {
    if (query.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    
    if (query.toLowerCase().includes('did') || query.startsWith('did:')) {
      suggestions.push({
        id: 'did:rubix:example1',
        type: 'did',
        title: 'did:rubix:example1',
        subtitle: 'DID • 1,250 RBT • 5 tokens',
        icon: User,
      });
    }

    if (query.toLowerCase().includes('token') || query.startsWith('0x')) {
      suggestions.push({
        id: '0x1234...5678',
        type: 'token',
        title: '0x1234...5678',
        subtitle: 'RBT Token • Active',
        icon: Coins,
      });
    }

    if (query.toLowerCase().includes('tx') || query.startsWith('tx:')) {
      suggestions.push({
        id: 'tx:abc123...def456',
        type: 'transaction',
        title: 'tx:abc123...def456',
        subtitle: 'Transfer • 2 minutes ago',
        icon: Hash,
      });
    }

    if (query.toLowerCase().includes('block') || /^\d+$/.test(query)) {
      suggestions.push({
        id: '1234567',
        type: 'block',
        title: 'Block #1234567',
        subtitle: '2 minutes ago • 15 transactions',
        icon: Hash,
      });
    }

    return suggestions.slice(0, 5);
  };

  const handleSearch = (searchQuery: string, type?: string) => {
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
      setSearchQuery(searchQuery);
      search(searchQuery, type);
      onSearch?.(searchQuery, type);
      setIsFocused(false);
      setShowHistory(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  };

  const removeFromHistory = (index: number) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
  };

  const sizeClasses = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-12 px-4 text-base',
    lg: 'h-14 px-6 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const suggestions = generateSuggestions(query);
  const showDropdown = isFocused && (showSuggestions ? suggestions.length > 0 : searchHistory.length > 0);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSizes[size]}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            setIsFocused(true);
            setShowHistory(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
              setShowHistory(false);
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 ${sizeClasses[size]} border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200`}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {showSuggestions && suggestions.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                  Suggestions
                </div>
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSearch(suggestion.title, suggestion.type)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  >
                    <suggestion.icon className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {suggestion.subtitle}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : searchHistory.length > 0 ? (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Recent Searches
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white truncate">
                        {item}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(index);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.button>
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export type { SearchBarProps };
