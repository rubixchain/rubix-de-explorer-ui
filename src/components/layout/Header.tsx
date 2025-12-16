import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSearch } from '@/hooks/useSearch';
// import { Button } from '@/components/ui/Button';
// import { NETWORK_CONFIG } from '@/constants';
// Commented out unused imports - Check, ChevronDown, Button, NETWORK_CONFIG, motion, AnimatePresence

export const Header: React.FC = () => {
  const { setSearchQuery } = useApp();
  const navigate = useNavigate();
  const { search, isLoading } = useSearch();
  // const [isNetworkModalOpen, setIsNetworkModalOpen] = React.useState(false);
  const [searchQuery, setSearchQueryState] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Commented out - Network switcher functionality
  // const networks = [
  //   {
  //     id: NETWORK_CONFIG.mainnet.id,
  //     name: NETWORK_CONFIG.mainnet.name,
  //     description: NETWORK_CONFIG.mainnet.description,
  //     status: 'Active',
  //     color: NETWORK_CONFIG.mainnet.color
  //   },
  //   {
  //     id: NETWORK_CONFIG.testnet.id,
  //     name: NETWORK_CONFIG.testnet.name,
  //     description: NETWORK_CONFIG.testnet.description,
  //     status: 'Active',
  //     color: NETWORK_CONFIG.testnet.color
  //   }
  // ];

  // const toggleNetworkModal = () => {
  //   setIsNetworkModalOpen(!isNetworkModalOpen);
  // };

  // const selectNetwork = (network: string) => {
  //   setSelectedChain(network);
  //   setIsNetworkModalOpen(false);
  // };

  // const closeNetworkModal = () => {
  //   setIsNetworkModalOpen(false);
  // };

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

      // Auto-detect search type based on query pattern
      if (query.startsWith('bafy')) {
        navigate(`/did-explorer?did=${encodeURIComponent(query)}`);
      } else if (query.startsWith('Qm')) {
        navigate(`/token-explorer?token=${encodeURIComponent(query)}`);
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

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Mobile Layout: Logo + Network on top, Search below */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <img
                src="/rubix-icon.png"
                alt="Rubix Logo"
                className="h-6 w-auto"
              />
              <span className="text-sm font-semibold text-heading font-heading whitespace-nowrap">
                Rubix Explorer
              </span>
            </Link>

            {/* Network Switcher - Commented out */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={toggleNetworkModal}
              className="flex px-2.5 py-2 rounded-md hover:bg-gray-100 items-center space-x-1.5 border border-gray-200"
            >
              <span className="text-xs font-medium text-gray-700 capitalize">
                {state.selectedChain}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </Button> */}
          </div>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full flex items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryState(e.target.value)}
                  placeholder="Search DID, tokens, transactions..."
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-l-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                {isLoading ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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

        {/* Tablet (iPad) & Desktop Layout: Everything in one line */}
        <div className="hidden md:flex items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <img
              src="/rubix-icon.png"
              alt="Rubix Logo"
              className="h-7 lg:h-8 w-auto"
            />
            <span className="text-base lg:text-lg font-semibold text-heading font-heading whitespace-nowrap">
              Rubix Explorer
            </span>
          </Link>

          {/* Search Bar - Takes remaining space */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl lg:max-w-4xl mx-4 lg:mx-8">
            <div className="relative w-full flex items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryState(e.target.value)}
                  placeholder="Search DID, tokens, or transactions..."
                  className="w-full pl-9 lg:pl-11 pr-10 py-2 lg:py-2.5 bg-gray-50 border border-gray-200 rounded-l-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                {isLoading ? (
                  <div className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchButtonClick}
                disabled={isLoading || !searchQuery.trim()}
                className="px-4 lg:px-6 py-2 lg:py-2.5 bg-primary-600 text-white rounded-r-full hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm font-medium whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>

          {/* Network Switcher - Commented out */}
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={toggleNetworkModal}
            className="flex px-3 lg:px-4 py-2 lg:py-2.5 rounded-md hover:bg-gray-100 items-center space-x-1.5 lg:space-x-2 border border-gray-200 flex-shrink-0"
          >
            <span className="text-sm font-medium text-gray-700 capitalize whitespace-nowrap">
              {state.selectedChain}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button> */}
        </div>
      </div>

      {/* Network Switcher Modal - Commented out */}
      {/* <AnimatePresence>
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
                        state.selectedChain === network.id
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
                      {state.selectedChain === network.id && (
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
      </AnimatePresence> */}
    </header>
  );
};
