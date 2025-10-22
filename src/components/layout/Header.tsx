import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Check, ChevronDown, User, Coins, Hash } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const { state, setSearchQuery } = useApp();
  const navigate = useNavigate();
  const { search, isLoading } = useSearch();
  const [isNetworkModalOpen, setIsNetworkModalOpen] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState('mainnet');
  const [searchQuery, setSearchQueryState] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const networks = [
    {
      id: 'mainnet',
      name: 'Mainnet',
      description: 'Production network',
      status: 'Active',
      color: 'bg-green-500'
    },
    {
      id: 'testnet',
      name: 'Testnet',
      description: 'Testing network',
      status: 'Active',
      color: 'bg-blue-500'
    }
  ];

  const searchFilters = [
    {
      id: 'all',
      label: 'All',
      icon: Search,
      description: 'Search all types'
    },
    {
      id: 'did',
      label: 'DID',
      icon: User,
      description: 'Search DIDs'
    },
    {
      id: 'token',
      label: 'Token',
      icon: Coins,
      description: 'Search tokens'
    },
    {
      id: 'transaction',
      label: 'Transaction',
      icon: Hash,
      description: 'Search transactions'
    }
  ];


  const toggleNetworkModal = () => {
    setIsNetworkModalOpen(!isNetworkModalOpen);
  };

  const selectNetwork = (network: string) => {
    setSelectedNetwork(network);
    setIsNetworkModalOpen(false);
  };

  const closeNetworkModal = () => {
    setIsNetworkModalOpen(false);
  };

  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const selectFilter = (filterId: string) => {
    setSelectedFilter(filterId);
    setIsFilterDropdownOpen(false);
  };

  const closeFilterDropdown = () => {
    setIsFilterDropdownOpen(false);
  };

  const clearSearch = () => {
    setSearchQueryState('');
    searchInputRef.current?.focus();
  };

  const performSearch = () => {
    const query = searchQuery.trim();
    if (query) {
      // Update the global search query state
      setSearchQuery(query);
      
      // Perform the search using the search hook
      search(query);
      
      // Navigate based on selected filter or auto-detect if "all" is selected
      if (selectedFilter === 'did') {
        navigate(`/did-explorer?did=${encodeURIComponent(query)}`);
      } else if (selectedFilter === 'token') {
        navigate(`/token-explorer?token=${encodeURIComponent(query)}`);
      } else if (selectedFilter === 'transaction') {
        navigate(`/transaction-explorer?tx=${encodeURIComponent(query)}`);
      } else {
        // Auto-detect when "all" is selected
        if (query.startsWith('did:rubix:')) {
          navigate(`/did-explorer?did=${encodeURIComponent(query)}`);
        } else if (query.match(/^(RBT|FT|NFT|SC)-/)) {
          navigate(`/token-explorer?token=${encodeURIComponent(query)}`);
        } else if (query.startsWith('0x') && query.length >= 40) {
          navigate(`/transaction-explorer?tx=${encodeURIComponent(query)}`);
        } else if (/^\d+$/.test(query)) {
          // Block number search - route to transaction explorer with block parameter
          navigate(`/transaction-explorer?block=${encodeURIComponent(query)}`);
        } else {
          // For any other query, try to determine the best route
          // If it looks like a DID (contains 'did' or 'rubix'), route to DID explorer
          if (query.toLowerCase().includes('did') || query.toLowerCase().includes('rubix')) {
            navigate(`/did-explorer?did=${encodeURIComponent(query)}`);
          } 
          // If it looks like a token ID, route to token explorer
          else if (query.toLowerCase().includes('token') || query.match(/^[A-Z]{2,4}-/)) {
            navigate(`/token-explorer?token=${encodeURIComponent(query)}`);
          }
          // If it looks like a transaction hash, route to transaction explorer
          else if (query.toLowerCase().includes('tx') || query.length > 20) {
            navigate(`/transaction-explorer?tx=${encodeURIComponent(query)}`);
          }
          // Default fallback - try DID explorer first
          else {
            navigate(`/did-explorer?did=${encodeURIComponent(query)}`);
          }
        }
      }
      searchInputRef.current?.blur();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSearchButtonClick = () => {
    performSearch();
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
        setSearchQueryState('');
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-filter-dropdown]')) {
          setIsFilterDropdownOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-end space-x-2 sm:space-x-3 flex-shrink-0">
            <img
              src="/rubix-icon.png"
              alt="Rubix Logo"
              className="h-6 sm:h-8 w-auto"
            />
            <span className="text-sm sm:text-lg font-semibold text-heading flex items-end font-heading whitespace-nowrap">
              Rubix Explorer
            </span>
          </Link>

          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-[800px] max-w-4xl">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full flex">
                {/* Filter Dropdown */}
                <div className="relative" data-filter-dropdown>
                  <button
                    type="button"
                    onClick={toggleFilterDropdown}
                    className="flex items-center space-x-1 px-4 py-2.5 bg-gray-50 border border-gray-200 border-r-0 rounded-l-full text-sm text-gray-700 hover:bg-gray-100 transition-colors min-w-[120px]"
                  >
                    {(() => {
                      const filter = searchFilters.find(f => f.id === selectedFilter);
                      const Icon = filter?.icon || Search;
                      return (
                        <>
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{filter?.label}</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      );
                    })()}
                  </button>
                  
                  <AnimatePresence>
                    {isFilterDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[9998]"
                          onClick={closeFilterDropdown}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-56"
                          onClick={(e) => e.stopPropagation()}
                        >
                        {searchFilters.map((filter) => {
                          const Icon = filter.icon;
                          return (
                            <button
                              key={filter.id}
                              onClick={() => selectFilter(filter.id)}
                              className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                                selectedFilter === filter.id ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">{filter.label}</div>
                                <div className="text-xs text-gray-500">{filter.description}</div>
                              </div>
                              {selectedFilter === filter.id && (
                                <Check className="w-4 h-4 text-primary-600" />
                              )}
                            </button>
                          );
                        })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQueryState(e.target.value)}
                    placeholder="Search DID, tokens, or transactions..."
                    className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-w-0"
                  />
                  {isLoading ? (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchButtonClick}
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-r-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNetworkModal}
              className="hidden sm:flex px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 items-center space-x-1 border border-gray-200"
            >
              <span className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                {selectedNetwork}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNetworkModal}
              className="sm:hidden px-2 py-2 rounded-md hover:bg-gray-100 items-center space-x-1 border border-gray-200"
            >
              <span className="text-xs font-medium text-gray-700 capitalize">
                {selectedNetwork}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="md:hidden mt-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full flex">
              {/* Mobile Filter Dropdown */}
              <div className="relative" data-filter-dropdown>
                <button
                  type="button"
                  onClick={toggleFilterDropdown}
                  className="flex items-center space-x-1 px-2 py-2.5 bg-gray-50 border border-gray-200 border-r-0 rounded-l-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {(() => {
                    const filter = searchFilters.find(f => f.id === selectedFilter);
                    const Icon = filter?.icon || Search;
                    return (
                      <>
                        <Icon className="w-3 h-3" />
                        <span className="text-xs">{filter?.label}</span>
                        <ChevronDown className="w-3 h-3" />
                      </>
                    );
                  })()}
                </button>
                
                <AnimatePresence>
                  {isFilterDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998]"
                        onClick={closeFilterDropdown}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-48"
                        onClick={(e) => e.stopPropagation()}
                      >
                      {searchFilters.map((filter) => {
                        const Icon = filter.icon;
                        return (
                          <button
                            key={filter.id}
                            onClick={() => selectFilter(filter.id)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                              selectedFilter === filter.id ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <div className="flex-1">
                              <div className="text-xs font-medium">{filter.label}</div>
                            </div>
                            {selectedFilter === filter.id && (
                              <Check className="w-3 h-3 text-primary-600" />
                            )}
                          </button>
                        );
                      })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryState(e.target.value)}
                  placeholder="Search by DID / token id (RBT/FT/NFT/SC)"
                  className="w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 min-w-0"
                />
                {isLoading ? (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                ) : (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs">/</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchButtonClick}
                disabled={isLoading || !searchQuery.trim()}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-r-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm font-medium"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {isNetworkModalOpen && (
          <motion.div
            className="fixed bg-black/50 flex items-center justify-center z-50 p-4"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNetworkModal}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select a network
                </h3>
                <button
                  onClick={closeNetworkModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-1">
                  {networks.map((network) => (
                    <button
                      key={network.id}
                      onClick={() => selectNetwork(network.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                        selectedNetwork === network.id
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${network.color} flex items-center justify-center`}>
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {network.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {network.description}
                          </div>
                        </div>
                      </div>
                      {selectedNetwork === network.id && (
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    More networks coming soon
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
